import StatusBadge from "./StatusBadge";
import { STATUS, ACESSO } from "../hooks/useProgress";

const numero = (valor) => String(valor).padStart(3, "0");

export default function NotaCard({ nota, status, resultado, acesso, onAcessar }) {
  const concluida = status === STATUS.CONCLUIDA;
  const bloqueada = acesso?.bloqueada ?? false;
  const novaVersao = acesso?.tipo === ACESSO.NOVA_VERSAO;

  // Rótulo do badge: se concluída, prioriza o estado derivado da
  // versão (bloqueada / nova versão); caso contrário usa o status.
  const badgeStatus = concluida
    ? bloqueada
      ? ACESSO.BLOQUEADA
      : novaVersao
        ? ACESSO.NOVA_VERSAO
        : status
    : status;

  return (
    <article
      className={`group dossie-clip relative flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-ink-700/30 ${
        concluida
          ? "selo-concluido border-success-500/30"
          : "border-black/5 dark:border-white/10"
      }`}
    >
      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-lg dark:bg-primary-500/15">
            📘
          </div>

          <StatusBadge status={badgeStatus} />
        </div>

        {/* Número correto da Nota Técnica */}
        <p className="mb-1 font-mono text-xs font-semibold tracking-wider text-accent-600 dark:text-accent-400">
          NT-{numero(nota.numero)}
        </p>

        <h3 className="font-display mb-1.5 break-words text-lg font-semibold leading-snug text-ink-900 dark:text-white">
          {nota.titulo}
        </h3>

        <p className="break-words text-sm leading-relaxed text-ink-500 dark:text-ink-300">
          {nota.descricao}
        </p>

        {concluida && resultado && (
          <p className="mt-3 text-xs font-medium text-success-600 dark:text-success-400">
            Nota final: {resultado.nota}% · {resultado.acertos}/
            {resultado.total} acertos
          </p>
        )}
      </div>

      <button
        onClick={() => !bloqueada && onAcessar(nota.id)}
        disabled={bloqueada}
        aria-disabled={bloqueada}
        className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
          bloqueada
            ? "cursor-not-allowed bg-ink-300/40 text-ink-500 dark:bg-white/10 dark:text-ink-300"
            : "bg-primary-500 text-white hover:bg-primary-400 dark:bg-primary-400 dark:hover:bg-primary-500"
        }`}
      >
        {bloqueada
          ? "Indisponível"
          : novaVersao
            ? "Acessar novamente"
            : concluida
              ? "Ver novamente"
              : "Acessar"}

        {!bloqueada && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12h14M13 6l6 6-6 6"
            />
          </svg>
        )}
      </button>
    </article>
  );
}
