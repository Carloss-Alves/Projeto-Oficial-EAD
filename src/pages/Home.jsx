import { useMemo, useState } from "react";
import { useNotas } from "../data/useNotas";
import Navbar from "../components/Navbar";
import NotaCard from "../components/NotaCard";
import { useProgress } from "../hooks/useProgress";

export default function Home({ onAcessarNota }) {
  const [search, setSearch] = useState("");
  const { notas, loading, error } = useNotas();
  const {
    getStatus,
    getResultado,
    getAcesso,
    loading: loadingProgresso,
  } = useProgress();

  const notasFiltradas = useMemo(() => {
    const termo = search.trim().toLowerCase();
    if (!termo) return notas;
    return notas.filter(
      (n) =>
        n.titulo.toLowerCase().includes(termo) ||
        n.descricao.toLowerCase().includes(termo)
    );
  }, [search, notas]);

  const totalConcluidas = notas.filter(
    (n) => getStatus(n.id) === "concluida"
  ).length;

  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-[#0d1520]">
      <Navbar search={search} onSearchChange={setSearch} />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
            Acervo de treinamento interno
          </p>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white sm:text-3xl">
            Notas Técnicas
          </h1>
          <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-300">
            {totalConcluidas} de {notas.length} concluídas · Leia o conteúdo e
            responda o exercício de fixação.
          </p>
        </div>

        {loading || loadingProgresso ? (
          <div className="rounded-2xl border border-black/10 bg-white py-16 text-center text-sm text-ink-500 dark:border-white/10 dark:bg-white/5 dark:text-ink-300">
            Carregando Notas Técnicas...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-danger-500/20 bg-danger-500/10 py-10 text-center text-sm text-danger-500">
            Não foi possível carregar as Notas Técnicas: {error}
          </div>
        ) : notasFiltradas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 bg-white/50 py-16 text-center dark:border-white/10 dark:bg-white/5">
            <p className="text-sm text-ink-500 dark:text-ink-300">
              Nenhuma nota técnica encontrada para "{search}".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {notasFiltradas.map((nota) => (
              <NotaCard
                key={nota.id}
                nota={nota}
                status={getStatus(nota.id)}
                resultado={getResultado(nota.id)}
                acesso={getAcesso(nota.id, nota.versao)}
                onAcessar={onAcessarNota}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
