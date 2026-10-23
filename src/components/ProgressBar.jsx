export default function ProgressBar({ atual, total }) {
  const percentual = Math.round((atual / total) * 100);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-ink-500 dark:text-ink-300">
        <span>
          Questão {atual} de {total}
        </span>
        <span>{percentual}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-accent-500 transition-all duration-500 ease-out"
          style={{ width: `${percentual}%` }}
        />
      </div>
    </div>
  );
}
