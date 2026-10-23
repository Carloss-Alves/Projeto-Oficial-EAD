import TextoRico from "./TextoRico";

export default function FeedbackResposta({
  acertou,
  respostaUsuario,
  respostaCorreta,
  explicacao,
}) {
  return (
    <div
      className={`mt-5 rounded-xl border p-5 ${
        acertou
          ? "border-success-500/30 bg-success-500/10"
          : "border-danger-500/30 bg-danger-500/10"
      }`}
    >
      <p
        className={`flex items-center gap-2 text-sm font-bold ${
          acertou ? "text-success-600 dark:text-success-400" : "text-danger-500"
        }`}
      >
        {acertou ? "✔ Resposta Correta" : "✖ Resposta Incorreta"}
      </p>

      {!acertou && (
        <div className="mt-2 space-y-1 text-sm text-ink-700 dark:text-ink-300">
          <p>
            <span className="font-semibold text-ink-900 dark:text-white">Sua resposta: </span>
            <TextoRico inline html={respostaUsuario} />
          </p>
          <p>
            <span className="font-semibold text-ink-900 dark:text-white">Resposta correta: </span>
            <TextoRico inline html={respostaCorreta} />
          </p>
        </div>
      )}

      <div className="mt-3 text-sm leading-relaxed text-ink-700 dark:text-ink-300">
        <p className="mb-1 font-semibold text-ink-900 dark:text-white">Explicação:</p>
        <TextoRico html={explicacao} />
      </div>
    </div>
  );
}
