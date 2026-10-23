import { useState } from "react";

function obterDataAtual() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

export default function IdentificacaoParticipante({ onIniciar }) {
  const [nome, setNome] = useState("");
  const [data, setData] = useState(obterDataAtual());
  const [erro, setErro] = useState("");

  const iniciar = (event) => {
    event.preventDefault();

    const nomeLimpo = nome.trim();

    if (!nomeLimpo) {
      setErro("Digite o nome do participante.");
      return;
    }

    if (!data) {
      setErro("Informe a data da realização.");
      return;
    }

    setErro("");

    onIniciar({
      nome: nomeLimpo,
      dataRealizacao: data,
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] px-6 py-10 dark:bg-[#0d1520]">
      <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
        <div className="w-full rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-ink-700/30 sm:p-8">
          <div className="mb-8">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-primary-500">
              Identificação
            </p>

            <h1 className="font-display text-2xl font-semibold text-ink-900 dark:text-white">
              Identifique-se para iniciar
            </h1>

            <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">
              Preencha seus dados antes de começar o exercício.
            </p>
          </div>

          <form onSubmit={iniciar} className="space-y-5">
            <div>
              <label
                htmlFor="nome"
                className="mb-2 block text-sm font-medium text-ink-700 dark:text-white"
              >
                Nome completo
              </label>

              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Digite seu nome"
                autoComplete="name"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-400/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="data"
                className="mb-2 block text-sm font-medium text-ink-700 dark:text-white"
              >
                Data da realização
              </label>

              <input
                id="data"
                type="date"
                value={data}
                onChange={(event) => setData(event.target.value)}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-400/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>

            {erro && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
                {erro}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-400 dark:bg-primary-400 dark:hover:bg-primary-500"
            >
              Iniciar Exercício
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}