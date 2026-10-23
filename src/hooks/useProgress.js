import { useCallback, useEffect, useState } from "react";
import { supabase, garantirUsuarioAnonimo } from "../lib/supabase";

export const STATUS = {
  NAO_INICIADA: "nao_iniciada",
  EM_ANDAMENTO: "em_andamento",
  CONCLUIDA: "concluida",
};

// Motivos usados pela tela para decidir o que mostrar.
export const ACESSO = {
  NAO_INICIADA: "nao_iniciada",
  EM_ANDAMENTO: "em_andamento",
  BLOQUEADA: "bloqueada",
  NOVA_VERSAO: "nova_versao",
};

function transformarResultado(item) {
  return {
    acertos: item.acertos ?? 0,
    total: item.total_questoes ?? 0,
    nota: Number(item.nota ?? 0),
    tempo: formatarTempo(item.tempo_segundos ?? 0),
    tempoSegundos: item.tempo_segundos ?? 0,
    nome: item.nome ?? "",
    dataRealizacao: item.data_realizacao ?? "",
  };
}

// =====================================================================
// participante_id (sistema legado)
// =====================================================================
//
// A coluna `progresso.participante_id` é `uuid NOT NULL` na tabela
// real e o restante do sistema (e o Apps Script) ainda depende dela.
// Não removemos essa lógica: continuamos gerando/reaproveitando um
// UUID salvo no navegador e o enviamos em TODO INSERT/UPSERT, junto
// com o novo `user_id` (sessão anônima do Supabase Auth).
// =====================================================================
function obterParticipanteId() {
  let participanteId = localStorage.getItem("participante_id");

  if (!participanteId) {
    participanteId = crypto.randomUUID();
    localStorage.setItem("participante_id", participanteId);
  }

  return participanteId;
}

export function useProgress() {
  const [progresso, setProgresso] = useState({});
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregarProgresso = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Garante uma sessão anônima válida do Supabase Auth (para
      // preencher `user_id`) e reaproveita o `participante_id` do
      // sistema legado — ambos identificam o mesmo participante.
      const usuario = await garantirUsuarioAnonimo();
      setUserId(usuario.id);

      const participanteId = obterParticipanteId();

      const { data, error: progressoError } = await supabase
        .from("progresso")
        .select("*")
        .eq("participante_id", participanteId);

      if (progressoError) {
        throw progressoError;
      }

      const mapa = {};

      for (const item of data ?? []) {
        mapa[item.nota_id] = {
          status: item.status,
          versaoConcluida: item.versao_concluida ?? null,
          resultado: transformarResultado(item),
        };
      }

      setProgresso(mapa);
    } catch (err) {
      console.error("Erro ao carregar progresso:", err);
      setError(
        err?.message ||
          "Não foi possível carregar seu progresso. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarProgresso();
  }, [carregarProgresso]);

  const getStatus = useCallback(
    (notaId) => progresso[notaId]?.status ?? STATUS.NAO_INICIADA,
    [progresso]
  );

  const getResultado = useCallback(
    (notaId) => progresso[notaId]?.resultado ?? null,
    [progresso]
  );

  // ===================================================================
  // CONTROLE DE ACESSO INDIVIDUAL POR VERSÃO
  // ===================================================================
  //
  //  - nunca iniciou                                -> ACESSAR
  //  - em andamento                                  -> CONTINUAR
  //  - concluída e versao_concluida === versao atual -> BLOQUEADA
  //  - concluída e versao_concluida <  versao atual  -> NOVA VERSÃO
  //
  // O bloqueio é sempre individual (por user_id + nota_id) e nunca
  // depende de quantos outros participantes já concluíram a nota.
  // ===================================================================
  const getAcesso = useCallback(
    (notaId, versaoAtual) => {
      const item = progresso[notaId];

      if (!item || item.status !== STATUS.CONCLUIDA) {
        return {
          tipo:
            item?.status === STATUS.EM_ANDAMENTO
              ? ACESSO.EM_ANDAMENTO
              : ACESSO.NAO_INICIADA,
          bloqueada: false,
        };
      }

      const versaoConcluida = item.versaoConcluida ?? 1;
      const versaoNota = versaoAtual ?? 1;

      if (versaoConcluida < versaoNota) {
        return { tipo: ACESSO.NOVA_VERSAO, bloqueada: false };
      }

      return { tipo: ACESSO.BLOQUEADA, bloqueada: true };
    },
    [progresso]
  );

  const marcarEmAndamento = useCallback(async (notaId, participante) => {
    try {
      setError(null);

      const usuario = await garantirUsuarioAnonimo();
      const participanteId = obterParticipanteId();

      const payload = {
        participante_id: participanteId,
        user_id: usuario.id,
        nota_id: notaId,
        nome: participante?.nome ?? "",
        data_realizacao: participante?.dataRealizacao ?? null,
        status: STATUS.EM_ANDAMENTO,
        // Estas colunas são NOT NULL na tabela real. No INSERT inicial
        // (primeira vez que o participante abre a nota) ainda não há
        // resultado, então mandamos os mesmos zeros que o sistema já
        // usava antes — evita violar as constraints NOT NULL.
        acertos: 0,
        total_questoes: 0,
        nota: 0,
        tempo_segundos: 0,
      };

      const { data, error: upsertError } = await supabase
        .from("progresso")
        .upsert(payload, { onConflict: "participante_id,nota_id" })
        .select()
        .single();

      if (upsertError) {
        throw upsertError;
      }

      setProgresso((prev) => ({
        ...prev,
        [notaId]: {
          status: data.status,
          versaoConcluida: data.versao_concluida ?? null,
          resultado: transformarResultado(data),
        },
      }));

      return data;
    } catch (err) {
      console.error("Erro ao iniciar exercício:", err);
      setError(err?.message || "Não foi possível iniciar o exercício.");
      throw err;
    }
  }, []);

  const marcarConcluida = useCallback(
    async (notaId, resultado, participante, versaoAtual) => {
      try {
        setError(null);

        const usuario = await garantirUsuarioAnonimo();
        const participanteId = obterParticipanteId();

        const payload = {
          participante_id: participanteId,
          user_id: usuario.id,
          nota_id: notaId,
          nome: participante?.nome ?? "",
          data_realizacao: participante?.dataRealizacao ?? null,
          status: STATUS.CONCLUIDA,
          acertos: resultado.acertos,
          total_questoes: resultado.total,
          nota: resultado.nota,
          tempo_segundos: resultado.tempoSegundos,
          versao_concluida: versaoAtual ?? 1,
        };

        const { data, error: upsertError } = await supabase
          .from("progresso")
          .upsert(payload, { onConflict: "participante_id,nota_id" })
          .select()
          .single();

        if (upsertError) {
          throw upsertError;
        }

        const resultadoBanco = transformarResultado(data);

        setProgresso((prev) => ({
          ...prev,
          [notaId]: {
            status: STATUS.CONCLUIDA,
            versaoConcluida: data.versao_concluida ?? versaoAtual ?? 1,
            resultado: resultadoBanco,
          },
        }));

        return resultadoBanco;
      } catch (err) {
        console.error("Erro ao salvar resultado:", err);
        setError(
          err?.message ||
            "Não foi possível salvar o resultado. Tente novamente."
        );
        throw err;
      }
    },
    []
  );

  return {
    progresso,
    userId,
    loading,
    error,
    getStatus,
    getResultado,
    getAcesso,
    marcarEmAndamento,
    marcarConcluida,
    recarregar: carregarProgresso,
  };
}

function formatarTempo(segundosTotais) {
  const min = Math.floor(segundosTotais / 60);
  const seg = segundosTotais % 60;

  return `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
}
