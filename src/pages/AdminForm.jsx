import { useEffect, useState } from "react";
import { useNotas } from "../data/useNotas";
import EditorTexto from "../components/EditorTexto";
import { htmlVazio, limparHtml } from "../lib/html";

function novaQuestao() {
  return { pergunta: "", alternativas: ["", "", "", ""], correta: 0, explicacao: "" };
}

export default function AdminForm({ notaId, onSalvar, onCancelar }) {
  const { notas, loading, salvarNota, enviarPdf, enviarImagem, removerPdf } = useNotas();
  const existente = notaId ? notas.find((n) => n.id === notaId) : null;

  const [numero, setNumero] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [video, setVideo] = useState("");
  const [questoes, setQuestoes] = useState([novaQuestao()]);
  const [pdf, setPdf] = useState(null);
  const [pdfAtual, setPdfAtual] = useState(null);
  const [removerPdfMarcado, setRemoverPdfMarcado] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!notaId) return;
    if (!existente) return;
    setNumero(String(existente.numero ?? ""));
    setTitulo(existente.titulo ?? "");
    setDescricao(existente.descricao ?? "");
    setConteudo(existente.conteudo ?? "");
    setVideo(existente.video ?? "");
    setQuestoes(existente.questoes?.length ? existente.questoes : [novaQuestao()]);
    setPdfAtual(existente.pdf ? { nome: existente.pdfNome || "PDF atual", url: existente.pdf } : null);
  }, [notaId, existente]);

  const atualizarQuestao = (i, campo, valor) => {
    setQuestoes((prev) => prev.map((q, idx) => idx === i ? { ...q, [campo]: valor } : q));
  };

  const atualizarAlternativa = (qi, ai, valor) => {
    setQuestoes((prev) => prev.map((q, idx) => {
      if (idx !== qi) return q;
      const alternativas = [...q.alternativas];
      alternativas[ai] = valor;
      return { ...q, alternativas };
    }));
  };

  const selecionarPdf = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setErro("Selecione um arquivo PDF válido.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setErro("O PDF deve ter no máximo 50 MB.");
      return;
    }
    setErro("");
    setPdf(file);
    setRemoverPdfMarcado(false);
  };

  const salvar = async (e) => {
    e.preventDefault();
    setErro("");

    if (!numero || Number(numero) < 1) return setErro("Informe o número da Nota Técnica.");
    if (!titulo.trim()) return setErro("O título é obrigatório.");
    if (!questoes.length) return setErro("Adicione pelo menos uma questão.");

    for (let i = 0; i < questoes.length; i++) {
      const q = questoes[i];
      if (htmlVazio(q.pergunta) || q.alternativas.some((a) => htmlVazio(a))) {
        return setErro(`Preencha a questão ${i + 1} e todas as alternativas.`);
      }
    }

    setSalvando(true);

    try {
      const id = await salvarNota(notaId, {
        numero: Number(numero),
        titulo,
        descricao,
        conteudo: limparHtml(conteudo),
        video,
        questoes: questoes.map((q) => ({
          ...q,
          pergunta: limparHtml(q.pergunta),
          alternativas: q.alternativas.map((a) => limparHtml(a, { inline: true })),
          explicacao: htmlVazio(q.explicacao) ? "" : limparHtml(q.explicacao),
        })),
      });

      if (removerPdfMarcado && !pdf) await removerPdf(id);
      if (pdf) await enviarPdf(id, pdf);

      onSalvar();
    } catch (e) {
      setErro(e.message || "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  };

  if (notaId && loading && !existente) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-ink-500">Carregando nota...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-[#0d1520]">
      <header className="border-b border-black/5 bg-white dark:border-white/10 dark:bg-[#101b28]">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <p className="font-display text-sm font-semibold text-ink-900 dark:text-white">{existente ? "Editar Nota Técnica" : "Nova Nota Técnica"}</p>
          <button onClick={onCancelar} className="text-xs font-semibold text-ink-500 hover:text-primary-500">Cancelar</button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <form onSubmit={salvar} className="space-y-6">
          <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-ink-700/30">
            <h2 className="mb-4 text-sm font-bold text-ink-900 dark:text-white">Dados básicos</h2>
            <label className="mb-1 block text-xs font-semibold text-ink-700 dark:text-white">Número</label>
            <input type="number" min="1" value={numero} onChange={(e) => setNumero(e.target.value)} className="mb-4 w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
            <label className="mb-1 block text-xs font-semibold text-ink-700 dark:text-white">Título</label>
            <input required value={titulo} onChange={(e) => setTitulo(e.target.value)} className="mb-4 w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
            <label className="mb-1 block text-xs font-semibold text-ink-700 dark:text-white">Descrição</label>
            <input value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
          </section>

          <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-ink-700/30">
            <h2 className="mb-1 text-sm font-bold text-ink-900 dark:text-white">Conteúdo</h2>
            <p className="mb-3 text-xs text-ink-300">Use a barra de formatação como no Word. Você também pode colar texto direto do Word.</p>
            <EditorTexto onEnviarImagem={enviarImagem} variant="completo" value={conteudo} onChange={setConteudo} ariaLabel="Conteúdo da Nota Técnica" placeholder="Digite ou cole o conteúdo da Nota Técnica..." />
          </section>

          <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-ink-700/30">
            <h2 className="mb-1 text-sm font-bold text-ink-900 dark:text-white">PDF da Nota Técnica</h2>
            <p className="mb-4 text-xs text-ink-300">O arquivo será enviado ao Supabase Storage. O usuário poderá visualizá-lo dentro da página.</p>
            {pdfAtual && !pdf && !removerPdfMarcado && (
              <div className="mb-4 rounded-xl border border-success-500/20 bg-success-500/10 p-3 text-xs text-success-600">
                PDF atual: <strong>{pdfAtual.nome}</strong>
                <a href={pdfAtual.url} target="_blank" rel="noreferrer" className="ml-3 underline">Abrir</a>
                <button type="button" onClick={() => setRemoverPdfMarcado(true)} className="ml-3 font-semibold text-danger-500">Excluir</button>
              </div>
            )}
            <input type="file" accept="application/pdf" onChange={selecionarPdf} className="text-sm dark:text-white" />
            {pdf && <p className="mt-2 text-xs text-ink-500">Novo PDF: <strong>{pdf.name}</strong></p>}
            {removerPdfMarcado && !pdf && <p className="mt-2 text-xs text-danger-500">O PDF atual será excluído ao salvar.</p>}
          </section>

          <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-ink-700/30">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink-900 dark:text-white">Questões</h2>
              <button type="button" onClick={() => setQuestoes((p) => [...p, novaQuestao()])} className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold dark:border-white/10 dark:text-white">+ Adicionar questão</button>
            </div>

            <div className="space-y-5">
              {questoes.map((q, qi) => (
                <div key={qi} className="rounded-xl border border-black/10 p-4 dark:border-white/10">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold text-ink-500">Questão {qi + 1}</p>
                    {questoes.length > 1 && <button type="button" onClick={() => setQuestoes((p) => p.filter((_, i) => i !== qi))} className="text-xs font-semibold text-danger-500">Remover</button>}
                  </div>
                  <div className="mb-3">
                    <EditorTexto onEnviarImagem={enviarImagem} variant="simples" value={q.pergunta} onChange={(v) => atualizarQuestao(qi, "pergunta", v)} ariaLabel={`Pergunta da questão ${qi + 1}`} placeholder="Pergunta" />
                  </div>
                  <div className="space-y-2">
                    {q.alternativas.map((alt, ai) => (
                      <div key={ai} className="flex items-start gap-2">
                        <input type="radio" title="Marcar como resposta correta" aria-label={`Alternativa ${String.fromCharCode(65 + ai)} é a correta`} name={`correta-${qi}`} checked={q.correta === ai} onChange={() => atualizarQuestao(qi, "correta", ai)} className="mt-3.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <EditorTexto variant="inline" value={alt} onChange={(v) => atualizarAlternativa(qi, ai, v)} ariaLabel={`Alternativa ${String.fromCharCode(65 + ai)} da questão ${qi + 1}`} placeholder={`Alternativa ${String.fromCharCode(65 + ai)}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <EditorTexto onEnviarImagem={enviarImagem} variant="simples" value={q.explicacao} onChange={(v) => atualizarQuestao(qi, "explicacao", v)} ariaLabel={`Explicação da questão ${qi + 1}`} placeholder="Explicação da resposta" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {erro && <div className="rounded-xl bg-danger-500/10 p-3 text-sm font-medium text-danger-500">{erro}</div>}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onCancelar} className="rounded-xl border border-black/10 px-5 py-2.5 text-sm font-semibold dark:border-white/10 dark:text-white">Cancelar</button>
            <button disabled={salvando} type="submit" className="rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-400 disabled:opacity-50">
              {salvando ? "Salvando..." : "Salvar Nota Técnica"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
