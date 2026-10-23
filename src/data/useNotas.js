import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { prepararImagem } from "../lib/imagem";

function montarNotas(notasRows = [], questoesRows = []) {
  return notasRows.map((n) => ({
    id: n.id,
    numero: n.numero,
    versao: n.versao ?? 1,
    titulo: n.titulo,
    descricao: n.descricao ?? "",
    conteudo: n.conteudo ?? "",
    pdf: n.pdf_url || undefined,
    pdfPath: n.pdf_path || undefined,
    pdfNome: n.pdf_nome || undefined,
    video: n.video_url || undefined,
    criadoEm: n.created_at,
    atualizadoEm: n.updated_at,
    questoes: questoesRows
      .filter((q) => q.nota_id === n.id)
      .sort((a, b) => a.ordem - b.ordem)
      .map((q) => ({
        id: q.id,
        pergunta: q.pergunta,
        alternativas: Array.isArray(q.alternativas) ? q.alternativas : ["", "", "", ""],
        correta: q.correta,
        explicacao: q.explicacao ?? "",
      })),
  }));
}

export function useNotas() {
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const carregar = useCallback(async () => {
    setLoading(true);
    setError("");

    const [{ data: notasRows, error: erroNotas }, { data: questoesRows, error: erroQuestoes }] =
      await Promise.all([
        supabase.from("notas_tecnicas").select("*").order("numero", { ascending: true }),
        supabase.from("questoes").select("*").order("ordem", { ascending: true }),
      ]);

    const erro = erroNotas || erroQuestoes;
    if (erro) {
      setError(erro.message);
      setNotas([]);
    } else {
      setNotas(montarNotas(notasRows, questoesRows));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const salvarQuestoes = useCallback(async (notaId, questoes) => {
    const { error: erroDelete } = await supabase
      .from("questoes")
      .delete()
      .eq("nota_id", notaId);

    if (erroDelete) throw erroDelete;

    const linhas = (questoes ?? []).map((q, i) => ({
      nota_id: notaId,
      pergunta: q.pergunta.trim(),
      alternativas: q.alternativas,
      correta: Number(q.correta),
      explicacao: q.explicacao?.trim() || "",
      ordem: i,
    }));

    if (!linhas.length) return;

    const { error } = await supabase.from("questoes").insert(linhas);
    if (error) throw error;
  }, []);

  const salvarNota = useCallback(async (notaId, dados) => {
    const linha = {
      numero: Number(dados.numero),
      titulo: dados.titulo.trim(),
      descricao: dados.descricao?.trim() || "",
      conteudo: dados.conteudo || "",
      video_url: dados.video?.trim() || null,
    };

    let id = notaId;

    if (notaId) {
      const { error } = await supabase
        .from("notas_tecnicas")
        .update(linha)
        .eq("id", notaId);
      if (error) throw error;
    } else {
      const { data, error } = await supabase
        .from("notas_tecnicas")
        .insert(linha)
        .select("id")
        .single();
      if (error) throw error;
      id = data.id;
    }

    try {
      await salvarQuestoes(id, dados.questoes ?? []);
    } catch (erroQuestoes) {
      // Se a nota era nova, não deixamos um registro órfão caso o
      // cadastro das questões falhe.
      if (!notaId) {
        await supabase.from("notas_tecnicas").delete().eq("id", id);
      }
      throw erroQuestoes;
    }

    await carregar();
    return id;
  }, [salvarQuestoes, carregar]);

  const excluirNota = useCallback(async (id) => {
    const nota = notas.find((item) => item.id === id);

    const { error } = await supabase.from("notas_tecnicas").delete().eq("id", id);
    if (error) throw error;

    if (nota?.pdfPath) {
      await supabase.storage.from("notas-pdfs").remove([nota.pdfPath]);
    }

    await carregar();
  }, [notas, carregar]);

  const enviarPdf = useCallback(async (notaId, file) => {
    if (!file || file.type !== "application/pdf") {
      throw new Error("Selecione um arquivo PDF válido.");
    }

    if (file.size > 50 * 1024 * 1024) {
      throw new Error("O PDF deve ter no máximo 50 MB.");
    }

    const { data: nota, error: erroNota } = await supabase
      .from("notas_tecnicas")
      .select("pdf_path")
      .eq("id", notaId)
      .single();

    if (erroNota) throw erroNota;

    if (nota?.pdf_path) {
      await supabase.storage.from("notas-pdfs").remove([nota.pdf_path]);
    }

    const caminho = `${notaId}/${crypto.randomUUID()}.pdf`;

    const { error: erroUpload } = await supabase.storage
      .from("notas-pdfs")
      .upload(caminho, file, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (erroUpload) throw erroUpload;

    const { data: publicData } = supabase.storage
      .from("notas-pdfs")
      .getPublicUrl(caminho);

    const { error: erroUpdate } = await supabase
      .from("notas_tecnicas")
      .update({
        pdf_path: caminho,
        pdf_url: publicData.publicUrl,
        pdf_nome: file.name,
      })
      .eq("id", notaId);

    if (erroUpdate) {
      await supabase.storage.from("notas-pdfs").remove([caminho]);
      throw erroUpdate;
    }

    await carregar();
    return publicData.publicUrl;
  }, [carregar]);

  // Envia uma imagem do editor para o Storage e devolve a URL pública.
  const enviarImagem = useCallback(async (file) => {
    const pronta = await prepararImagem(file);
    const extensao = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" }[pronta.type];
    const caminho = `conteudo/${crypto.randomUUID()}.${extensao}`;

    const { error } = await supabase.storage
      .from("notas-imagens")
      .upload(caminho, pronta, { contentType: pronta.type, upsert: false });

    if (error) {
      throw new Error(
        /bucket not found/i.test(error.message)
          ? "Bucket de imagens não existe. Execute supabase/migration_imagens.sql no Supabase."
          : error.message
      );
    }

    return supabase.storage.from("notas-imagens").getPublicUrl(caminho).data.publicUrl;
  }, []);

  const removerPdf = useCallback(async (notaId) => {
    const nota = notas.find((item) => item.id === notaId);
    if (!nota) return;

    const { error } = await supabase
      .from("notas_tecnicas")
      .update({ pdf_path: null, pdf_url: null, pdf_nome: null })
      .eq("id", notaId);

    if (error) throw error;

    if (nota.pdfPath) {
      const { error: erroStorage } = await supabase.storage
        .from("notas-pdfs")
        .remove([nota.pdfPath]);
      if (erroStorage) throw erroStorage;
    }

    await carregar();
  }, [notas, carregar]);

  const buscarPorId = useCallback(
    (id) => notas.find((n) => n.id === id) ?? null,
    [notas]
  );

  // =====================================================================
  // LIBERAR NOVAMENTE (versionamento)
  // =====================================================================
  //
  // Aumenta a versão da Nota Técnica. Isso NÃO apaga progresso nem
  // histórico: participantes que já concluíram a versão anterior
  // passam a poder acessar novamente porque `versao_concluida` deles
  // fica menor que a nova `versao` da nota. Quem nunca fez continua
  // liberado normalmente.
  // =====================================================================
  const liberarNovamente = useCallback(
    async (notaId) => {
      const notaAtual = notas.find((n) => n.id === notaId);

      if (!notaAtual) {
        throw new Error("Nota Técnica não encontrada.");
      }

      const novaVersao = (notaAtual.versao ?? 1) + 1;

      const { data, error } = await supabase
        .from("notas_tecnicas")
        .update({ versao: novaVersao })
        .eq("id", notaId)
        .select("id, versao")
        .single();

      if (error) throw error;

      await carregar();
      return data.versao;
    },
    [notas, carregar]
  );

  return {
    notas,
    loading,
    error,
    buscarPorId,
    recarregar: carregar,
    salvarNota,
    excluirNota,
    enviarPdf,
    enviarImagem,
    removerPdf,
    liberarNovamente,
  };
}
