import TextoRico from "./TextoRico";

const LETRAS = ["A", "B", "C", "D", "E", "F"];

export default function AlternativaButton({
  texto,
  letra,
  selecionada,
  respondido,
  ehCorreta,
  onSelecionar,
}) {
  // Define o estilo conforme o estado da questão
  let estilo =
    "border-black/10 bg-white hover:border-primary-400/50 hover:bg-primary-50/60 dark:border-white/10 dark:bg-ink-700/30 dark:hover:bg-white/5";
  let marcador =
    "border-black/20 text-ink-500 dark:border-white/20 dark:text-ink-300";

  if (respondido) {
    if (ehCorreta) {
      estilo = "border-success-500/50 bg-success-500/10";
      marcador = "border-success-500 bg-success-500 text-white";
    } else if (selecionada && !ehCorreta) {
      estilo = "border-danger-500/50 bg-danger-500/10";
      marcador = "border-danger-500 bg-danger-500 text-white";
    } else {
      estilo = "border-black/10 opacity-60 dark:border-white/10";
    }
  } else if (selecionada) {
    estilo = "border-primary-500 bg-primary-50 dark:bg-primary-500/15 dark:border-primary-400";
    marcador = "border-primary-500 bg-primary-500 text-white dark:border-primary-400 dark:bg-primary-400";
  }

 return (
  <button
    type="button"
    data-testid={`alternativa-${LETRAS[letra]}`}
    disabled={respondido}
    onClick={onSelecionar}
    className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm transition-colors ${
      respondido ? "cursor-default" : "cursor-pointer"
    } ${estilo}`}
  >
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${marcador}`}
    >
      {LETRAS[letra]}
    </span>

    <TextoRico inline html={texto} className="min-w-0 text-ink-900 dark:text-white" />
  </button>
);
}
