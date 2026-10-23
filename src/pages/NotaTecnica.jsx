import { useNotas } from "../data/useNotas";
import ConteudoNota from "../components/ConteudoNota";
import { useDarkMode } from "../hooks/useDarkMode";
import { useProgress, ACESSO } from "../hooks/useProgress";

const numero = (valor) => String(valor).padStart(3, "0");

export default function NotaTecnica({
  notaId,
  onVoltar,
  onIniciarExercicio,
}) {
  const { notas, loading, error } = useNotas();

  const nota = notas.find((n) => n.id === notaId);

  useDarkMode();

  const { loading: loadingProgresso, getAcesso } = useProgress();

  if (loading || loadingProgresso) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8] dark:bg-[#0d1520]">
        <p className="text-sm text-ink-500 dark:text-ink-300">
          Carregando Nota Técnica...
        </p>
      </div>
    );
  }

  if (error || !nota) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8] dark:bg-[#0d1520]">
        <div className="max-w-md px-6 text-center">
          <p className="text-sm text-ink-500 dark:text-ink-300">
            {error
              ? `Não foi possível carregar a Nota Técnica: ${error}`
              : "Nota técnica não encontrada."}
          </p>

          <button
            onClick={onVoltar}
            className="mt-4 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  const acesso = getAcesso(nota.id, nota.versao);
  const bloqueada = acesso.bloqueada;
  const novaVersao = acesso.tipo === ACESSO.NOVA_VERSAO;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f6f8] dark:bg-[#0d1520]">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-20 border-b border-black/5 bg-white/80 backdrop-blur-md dark:border-white/5 dark:bg-[#0d1520]/80">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4 sm:px-6">
          <button
            onClick={onVoltar}
            aria-label="Voltar ao início"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-black/10 text-ink-700 transition hover:border-primary-400/40 hover:text-primary-500 dark:border-white/10 dark:text-white"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-[18px] w-[18px]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 6l-6 6 6 6"
              />
            </svg>
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-ink-300">
              Notas Técnicas / NT-{numero(nota.numero)}
            </p>

            <p className="truncate text-sm font-semibold text-ink-900 dark:text-white">
              {nota.titulo}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <article className="w-full overflow-hidden rounded-2xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-ink-700/30 sm:p-10">
          {/* Número da Nota Técnica */}
          <p className="mb-2 font-mono text-xs font-semibold tracking-wider text-accent-600 dark:text-accent-400">
            NT-{numero(nota.numero)}
          </p>

          {/* Título */}
          <h1 className="font-display mb-1 break-words text-2xl font-bold text-ink-900 dark:text-white sm:text-3xl">
            {nota.titulo}
          </h1>

          {/* Descrição */}
          <p className="mb-8 break-words text-sm text-ink-500 dark:text-ink-300">
            {nota.descricao}
          </p>

          {/* Conteúdo */}
          <div className="min-w-0">
            <ConteudoNota html={nota.conteudo} />
          </div>

          {/* PDF */}
          {nota.pdf && (
            <div className="mt-8 w-full min-w-0">
              <p className="mb-2 text-sm font-semibold text-ink-900 dark:text-white">
                Documento anexo
              </p>

              <div className="w-full max-w-full overflow-hidden rounded-xl border border-black/10 bg-white dark:border-white/10">
                <iframe
                  src={nota.pdf}
                  title={`PDF - ${nota.titulo}`}
                  className="block h-[70vh] min-h-[380px] w-full max-w-full border-0 sm:h-[480px]"
                  loading="lazy"
                />
              </div>

              {/* Botão para abrir PDF completo no celular */}
              <div className="mt-3 sm:hidden">
                <a
                  href={nota.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-400 active:scale-[0.98]"
                >
                  <span aria-hidden="true">📄</span>
                  Abrir PDF completo
                </a>

                <p className="mt-2 text-center text-xs leading-relaxed text-ink-400 dark:text-ink-300">
                  Se o PDF não aparecer corretamente acima, toque no botão
                  para abrir o documento completo no navegador.
                </p>
              </div>
            </div>
          )}

          {/* Vídeo */}
          {nota.video && (
            <div className="mt-8 w-full min-w-0">
              <p className="mb-2 text-sm font-semibold text-ink-900 dark:text-white">
                Vídeo complementar
              </p>

              <video
                src={nota.video}
                controls
                className="block w-full max-w-full rounded-xl border border-black/10 dark:border-white/10"
              />
            </div>
          )}
        </article>

        {/* Botão do exercício */}
        <div className="mt-8 flex flex-col items-center gap-3 px-2">
          {bloqueada && (
            <div className="flex w-full max-w-sm flex-col items-center gap-1 rounded-xl border border-success-500/30 bg-success-500/10 px-4 py-3 text-center">
              <p className="text-sm font-semibold text-success-600 dark:text-success-400">
                🔒 Nota Técnica concluída
              </p>
              <p className="text-xs text-ink-500 dark:text-ink-300">
                Você já concluiu esta Nota Técnica.
              </p>
            </div>
          )}

          {novaVersao && (
            <div className="flex w-full max-w-sm flex-col items-center gap-1 rounded-xl border border-accent-400/30 bg-accent-400/10 px-4 py-3 text-center">
              <p className="text-sm font-semibold text-accent-600 dark:text-accent-300">
                🔄 Nova versão disponível
              </p>
            </div>
          )}

          <button
            onClick={() => !bloqueada && onIniciarExercicio(nota.id)}
            disabled={bloqueada}
            aria-disabled={bloqueada}
            className={`inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold shadow-sm transition-colors sm:w-auto ${
              bloqueada
                ? "cursor-not-allowed bg-ink-300/40 text-ink-500 dark:bg-white/10 dark:text-ink-300"
                : "bg-primary-500 text-white hover:bg-primary-400 dark:bg-primary-400 dark:hover:bg-primary-500"
            }`}
          >
            {bloqueada
              ? "Indisponível"
              : novaVersao
                ? "Acessar novamente"
                : acesso.tipo === ACESSO.EM_ANDAMENTO
                  ? "Continuar Exercício"
                  : "Iniciar Exercício"}

            {!bloqueada && (
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
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
