import { useNotas } from "../data/useNotas";
import { useDarkMode } from "../hooks/useDarkMode";

const numero = (valor) => String(valor).padStart(3, "0");

export default function Conclusao({ notaId, resultado, onVoltar }) {
  const { notas } = useNotas();
  const nota = notas.find((n) => n.id === notaId);
  useDarkMode();

  if (!nota || !resultado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8] dark:bg-[#0d1520]">
        <div className="text-center">
          <p className="text-sm text-ink-500 dark:text-ink-300">
            Resultado não encontrado.
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

  const aprovado = resultado.nota >= 70;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8] px-6 py-10 dark:bg-[#0d1520]">
      <div className="w-full max-w-md rounded-2xl border border-black/5 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-ink-700/30 sm:p-10">
        <div className="dossie-clip selo-concluido mx-auto mb-6 flex h-16 w-16 items-center justify-center bg-success-500/15 text-3xl">
          🎉
        </div>

        <p className="mb-1 font-mono text-xs font-semibold tracking-wider text-accent-600 dark:text-accent-400">
          NT-{numero(nota.numero)} concluída
        </p>
        <h1 className="font-display mb-2 text-2xl font-bold text-ink-900 dark:text-white">
          Parabéns!
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
          Você concluiu a nota técnica <strong className="text-ink-900 dark:text-white">{nota.titulo}</strong>.
        </p>

        <div className="mb-8 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-black/5 bg-[#f5f6f8] p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xl font-bold text-ink-900 dark:text-white">
              {resultado.acertos}/{resultado.total}
            </p>
            <p className="mt-0.5 text-[11px] uppercase tracking-wide text-ink-300">
              Acertos
            </p>
          </div>
          <div
            className={`rounded-xl border p-4 ${
              aprovado
                ? "border-success-500/30 bg-success-500/10"
                : "border-danger-500/30 bg-danger-500/10"
            }`}
          >
            <p
              className={`text-xl font-bold ${
                aprovado ? "text-success-600 dark:text-success-400" : "text-danger-500"
              }`}
            >
              {resultado.nota}%
            </p>
            <p className="mt-0.5 text-[11px] uppercase tracking-wide text-ink-300">
              Nota
            </p>
          </div>
          <div className="rounded-xl border border-black/5 bg-[#f5f6f8] p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xl font-bold text-ink-900 dark:text-white">
              {resultado.tempo}
            </p>
            <p className="mt-0.5 text-[11px] uppercase tracking-wide text-ink-300">
              Tempo
            </p>
          </div>
        </div>

        <button
          onClick={onVoltar}
          className="w-full rounded-xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-400 dark:bg-primary-400 dark:hover:bg-primary-500"
        >
          Voltar ao início
        </button>
      </div>
    </div>
  );
}
