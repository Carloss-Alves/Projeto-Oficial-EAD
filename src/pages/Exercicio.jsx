import { useRef, useState } from "react";
import { useNotas } from "../data/useNotas";
import ProgressBar from "../components/ProgressBar";
import AlternativaButton from "../components/AlternativaButton";
import FeedbackResposta from "../components/FeedbackResposta";
import TextoRico from "../components/TextoRico";
import { useDarkMode } from "../hooks/useDarkMode";
import { useProgress } from "../hooks/useProgress";

function formatarTempo(segundosTotais) {
  const min = Math.floor(segundosTotais / 60);
  const seg = segundosTotais % 60;

  return `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
}

export default function Exercicio({ notaId, onFinalizar }) {
  const { notas, loading, error } = useNotas();
  const nota = notas.find((n) => n.id === notaId);

  useDarkMode();

  const {
    loading: loadingProgresso,
    marcarEmAndamento,
    marcarConcluida,
    getAcesso,
  } = useProgress();

  // =====================================================
  // PARTICIPANTE
  // =====================================================

  const [participante, setParticipante] = useState({
    nome: "",
    dataRealizacao: new Date().toISOString().split("T")[0],
  });

  const [iniciado, setIniciado] = useState(false);

  // =====================================================
  // QUESTÕES
  // =====================================================

  const [indice, setIndice] = useState(0);
  const [selecionada, setSelecionada] = useState(null);
  const [respondido, setRespondido] = useState(false);
  const [acertos, setAcertos] = useState(0);

  const inicioRef = useRef(null);

  // =====================================================
  // CARREGAMENTO
  // =====================================================

  if (loading || loadingProgresso) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8] dark:bg-[#0d1520]">
        <p className="text-sm text-ink-500 dark:text-ink-300">
          Carregando exercício...
        </p>
      </div>
    );
  }

  if (error || !nota || !nota.questoes?.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8] dark:bg-[#0d1520]">
        <div className="max-w-md px-6 text-center">
          <p className="text-sm text-ink-500 dark:text-ink-300">
            {error
              ? `Não foi possível carregar o exercício: ${error}`
              : "Nenhuma questão disponível para esta nota técnica."}
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // BLOQUEIO POR VERSÃO
  // =====================================================
  //
  // Mesmo que o participante chegue direto nesta tela (ex.: link
  // salvo), nunca deixamos reiniciar uma Nota Técnica já concluída
  // na versão atual. Isso espelha o bloqueio já aplicado na tela de
  // leitura da Nota Técnica.

  const acesso = getAcesso(nota.id, nota.versao);

  if (acesso.bloqueada) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8] px-6 dark:bg-[#0d1520]">
        <div className="w-full max-w-md rounded-2xl border border-success-500/30 bg-white p-8 text-center shadow-sm dark:border-success-500/20 dark:bg-ink-700/30">
          <p className="mb-2 text-2xl">🔒</p>
          <h1 className="font-display mb-2 text-lg font-bold text-ink-900 dark:text-white">
            Nota Técnica concluída
          </h1>
          <p className="text-sm text-ink-500 dark:text-ink-300">
            Você já concluiu esta Nota Técnica. O acesso ficará
            disponível novamente apenas se uma nova versão for
            publicada.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // INICIAR EXERCÍCIO
  // =====================================================

  const iniciarExercicio = async () => {
    const nome = participante.nome.trim();

    if (!nome) {
      alert("Digite o nome do participante.");
      return;
    }

    if (!participante.dataRealizacao) {
      alert("Informe a data da realização.");
      return;
    }

    try {
      await marcarEmAndamento(nota.id, {
        nome,
        dataRealizacao: participante.dataRealizacao,
      });

      // Começa a contar o tempo somente depois
      // que o participante clicar em iniciar.
      inicioRef.current = Date.now();

      setParticipante({
        nome,
        dataRealizacao: participante.dataRealizacao,
      });

      setIniciado(true);
    } catch (err) {
      console.error("Erro ao iniciar exercício:", err);

      alert(
        err?.message ||
          "Não foi possível iniciar o exercício."
      );
    }
  };

  // =====================================================
  // TELA DE IDENTIFICAÇÃO
  // =====================================================

  if (!iniciado) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] dark:bg-[#0d1520]">
        <main className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-10">
          <div className="w-full rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-ink-700/30 sm:p-8">

            <p className="mb-2 text-sm text-ink-400 dark:text-ink-300">
              Exercício de fixação
            </p>

            <h1 className="mb-2 font-display text-2xl font-bold text-ink-900 dark:text-white">
              {nota.titulo}
            </h1>

            <p className="mb-8 text-sm text-ink-500 dark:text-ink-300">
              Preencha seus dados antes de iniciar o exercício.
            </p>

            <div className="space-y-5">

              {/* NOME */}

              <div>
                <label
                  htmlFor="nome-participante"
                  className="mb-2 block text-sm font-medium text-ink-700 dark:text-white"
                >
                  Nome
                </label>

                <input
                  id="nome-participante"
                  type="text"
                  value={participante.nome}
                  onChange={(e) =>
                    setParticipante((prev) => ({
                      ...prev,
                      nome: e.target.value,
                    }))
                  }
                  placeholder="Digite seu nome completo"
                  autoComplete="name"
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-400/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              {/* DATA */}

              <div>
                <label
                  htmlFor="data-participante"
                  className="mb-2 block text-sm font-medium text-ink-700 dark:text-white"
                >
                  Data
                </label>

                <input
                  id="data-participante"
                  type="date"
                  value={participante.dataRealizacao}
                  onChange={(e) =>
                    setParticipante((prev) => ({
                      ...prev,
                      dataRealizacao: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-400/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              {/* BOTÃO */}

              <button
                type="button"
                onClick={iniciarExercicio}
                className="w-full rounded-xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-400 active:scale-[0.99] dark:bg-primary-400 dark:hover:bg-primary-500"
              >
                Iniciar exercício
              </button>

            </div>
          </div>
        </main>
      </div>
    );
  }

  // =====================================================
  // QUESTÃO ATUAL
  // =====================================================

  const questao = nota.questoes[indice];

  const ultimaQuestao =
    indice === nota.questoes.length - 1;

  const acertou =
    respondido &&
    selecionada === questao.correta;

  // =====================================================
  // RESPONDER
  // =====================================================

  const responder = () => {
    if (selecionada === null) {
      return;
    }

    setRespondido(true);

    if (selecionada === questao.correta) {
      setAcertos((prev) => prev + 1);
    }
  };

  // =====================================================
  // PRÓXIMA / FINALIZAR
  // =====================================================

  const proximaQuestao = async () => {
  if (!respondido || selecionada === null) {
    return;
  }

  // Ainda existem questões
  if (!ultimaQuestao) {
    setIndice((prev) => prev + 1);
    setSelecionada(null);
    setRespondido(false);

    return;
  }

  // ===================================================
  // ÚLTIMA QUESTÃO
  // ===================================================

  const acertosFinal = acertos;
  const total = nota.questoes.length;

  const segundos = Math.max(
    0,
    Math.round(
      (Date.now() - (inicioRef.current ?? Date.now())) /
        1000
    )
  );

  const resultado = {
    acertos: acertosFinal,
    total,
    nota: Math.round(
      (acertosFinal / total) * 100
    ),
    tempo: formatarTempo(segundos),
    tempoSegundos: segundos,
  };

  try {
    const resultadoSalvo = await marcarConcluida(
      nota.id,
      resultado,
      participante,
      nota.versao
    );

    onFinalizar(
      nota.id,
      resultadoSalvo
    );
  } catch (err) {
    console.error(
      "Não foi possível salvar o resultado:",
      err
    );

    alert(
      err?.message ||
        "Não foi possível salvar o resultado. Tente novamente."
    );
  }
};

  // =====================================================
  // TELA DAS QUESTÕES
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-[#0d1520]">

      {/* CABEÇALHO */}

      <header className="border-b border-black/5 bg-white/80 backdrop-blur-md dark:border-white/5 dark:bg-[#0d1520]/80">
        <div className="mx-auto max-w-2xl px-6 py-4">

          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">

            <p className="text-xs text-ink-300">
              Exercício de fixação · {nota.titulo}
            </p>

            <p className="text-xs font-medium text-ink-400 dark:text-ink-300">
              {participante.nome}
            </p>

          </div>

          <ProgressBar
            atual={indice + 1}
            total={nota.questoes.length}
          />

        </div>
      </header>

      {/* QUESTÃO */}

      <main className="mx-auto max-w-2xl px-6 py-10">

        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-ink-700/30 sm:p-8">

          <div
            role="heading"
            aria-level={2}
            className="font-display mb-6 text-lg font-semibold leading-snug text-ink-900 dark:text-white"
          >
            <TextoRico html={questao.pergunta} />
          </div>

          {/* ALTERNATIVAS */}

          <div className="space-y-3">

            {questao.alternativas.map((alt, i) => (
              <AlternativaButton
                key={i}
                texto={alt}
                letra={i}
                selecionada={selecionada === i}
                respondido={respondido}
                ehCorreta={i === questao.correta}
                onSelecionar={() => {
                  if (!respondido) {
                    setSelecionada(i);
                  }
                }}
              />
            ))}

          </div>

          {/* FEEDBACK */}

          {respondido && (
            <FeedbackResposta
              acertou={acertou}
              respostaUsuario={
                questao.alternativas[selecionada]
              }
              respostaCorreta={
                questao.alternativas[
                  questao.correta
                ]
              }
              explicacao={questao.explicacao}
            />
          )}

          {/* BOTÕES */}

          <div className="mt-6 flex justify-end">

            {!respondido ? (
              <button
                type="button"
                onClick={responder}
                disabled={selecionada === null}
                className="rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-primary-400 dark:hover:bg-primary-500"
              >
                Responder
              </button>
            ) : (
              <button
                type="button"
                onClick={proximaQuestao}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-400 dark:bg-primary-400 dark:hover:bg-primary-500"
              >

                {ultimaQuestao
                  ? "Ver Resultado"
                  : "Próxima Questão"}

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12h14M13 6l6 6-6 6"
                  />
                </svg>

              </button>
            )}

          </div>

        </div>

      </main>

    </div>
);
}
