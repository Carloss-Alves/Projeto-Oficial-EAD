import { STATUS, ACESSO } from "../hooks/useProgress";

const CONFIG = {
  [STATUS.NAO_INICIADA]: {
    label: "Não iniciada",
    classes:
      "bg-ink-500/10 text-ink-500 dark:text-ink-300 dark:bg-white/5 ring-ink-300/40",
    dot: "bg-ink-300",
  },
  [STATUS.EM_ANDAMENTO]: {
    label: "Em andamento",
    classes:
      "bg-accent-400/15 text-accent-600 dark:text-accent-300 ring-accent-400/40",
    dot: "bg-accent-500",
  },
  [STATUS.CONCLUIDA]: {
    label: "Concluída",
    classes:
      "bg-success-500/10 text-success-600 dark:text-success-400 ring-success-500/40",
    dot: "bg-success-500",
  },
  // Pseudo-status derivados do controle de acesso por versão. Não
  // existem no banco — só mudam o rótulo mostrado no card.
  [ACESSO.BLOQUEADA]: {
    label: "🔒 Concluída",
    classes:
      "bg-success-500/10 text-success-600 dark:text-success-400 ring-success-500/40",
    dot: "bg-success-500",
  },
  [ACESSO.NOVA_VERSAO]: {
    label: "🔄 Nova versão",
    classes:
      "bg-accent-400/15 text-accent-600 dark:text-accent-300 ring-accent-400/40",
    dot: "bg-accent-500",
  },
};

export default function StatusBadge({ status }) {
  const { label, classes, dot } = CONFIG[status] ?? CONFIG[STATUS.NAO_INICIADA];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
