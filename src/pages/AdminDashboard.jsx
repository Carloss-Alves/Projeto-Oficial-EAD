import { useState } from "react";
import { useNotas } from "../data/useNotas";

const numero = (numeroNota) => String(numeroNota).padStart(3, "0");

export default function AdminDashboard({ onNovaNota, onEditarNota, onVoltarSite, onLogout }) {
  const { notas, loading, error, excluirNota, liberarNovamente } = useNotas();
  const [liberando, setLiberando] = useState(null);
  const [mensagem, setMensagem] = useState(null);

  const excluir = async (nota) => {
    if (!confirm(`Excluir "${nota.titulo}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await excluirNota(nota.id);
    } catch (e) {
      alert(`Não foi possível excluir: ${e.message}`);
    }
  };

  const liberar = async (nota) => {
    if (
      !confirm(
        `Liberar novamente "${nota.titulo}"?\n\n` +
          "Todos os participantes que já concluíram esta Nota Técnica " +
          "poderão acessá-la novamente. O histórico e os resultados " +
          "anteriores NÃO serão apagados."
      )
    ) {
      return;
    }

    try {
      setLiberando(nota.id);
      setMensagem(null);
      const novaVersao = await liberarNovamente(nota.id);
      setMensagem({
        tipo: "sucesso",
        texto: `Nota Técnica ${numero(nota.numero)} liberada novamente (versão ${novaVersao}).`,
      });
    } catch (e) {
      setMensagem({
        tipo: "erro",
        texto: `Não foi possível liberar novamente: ${e.message}`,
      });
    } finally {
      setLiberando(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-[#0d1520]">
      <header className="border-b border-black/5 bg-white dark:border-white/10 dark:bg-[#101b28]">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <div className="dossie-clip flex h-9 w-9 items-center justify-center bg-primary-500 text-xs font-bold text-accent-300">NT</div>
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold text-ink-900 dark:text-white">Painel Administrativo</p>
            <p className="text-xs text-ink-300">Notas Técnicas</p>
          </div>
          <div className="ml-auto flex gap-2">
            <button onClick={onVoltarSite} className="rounded-xl border border-black/10 px-3.5 py-2 text-xs font-semibold text-ink-700 hover:border-primary-400/40 dark:border-white/10 dark:text-white">Voltar ao site</button>
            <button onClick={onLogout} className="rounded-xl border border-black/10 px-3.5 py-2 text-xs font-semibold text-ink-700 hover:border-danger-500/40 hover:text-danger-500 dark:border-white/10 dark:text-white">Sair</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-ink-900 dark:text-white">Notas Técnicas ({notas.length})</h1>
            <p className="mt-1 text-xs text-ink-500 dark:text-ink-300">Conteúdo salvo diretamente no Supabase.</p>
          </div>
          <button onClick={onNovaNota} className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-400">+ Nova Nota Técnica</button>
        </div>

        {loading && <div className="rounded-2xl bg-white p-10 text-center text-sm text-ink-500">Carregando...</div>}
        {error && <div className="mb-4 rounded-xl border border-danger-500/20 bg-danger-500/10 p-4 text-sm text-danger-500">{error}</div>}
        {mensagem && (
          <div
            className={`mb-4 rounded-xl border p-4 text-sm ${
              mensagem.tipo === "sucesso"
                ? "border-success-500/20 bg-success-500/10 text-success-600"
                : "border-danger-500/20 bg-danger-500/10 text-danger-500"
            }`}
          >
            {mensagem.texto}
          </div>
        )}

        {!loading && (
          <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-ink-700/30">
            {notas.length === 0 ? (
              <p className="p-8 text-center text-sm text-ink-500 dark:text-ink-300">Nenhuma nota técnica cadastrada.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead><tr className="border-b border-black/5 bg-[#f5f6f8] text-xs uppercase tracking-wide text-ink-300 dark:border-white/10 dark:bg-white/5">
                    <th className="px-5 py-3">Código</th><th className="px-5 py-3">Título</th><th className="px-5 py-3">Versão</th><th className="px-5 py-3">Questões</th><th className="px-5 py-3">PDF</th><th className="px-5 py-3 text-right">Ações</th>
                  </tr></thead>
                  <tbody>
                    {notas.map((nota) => (
                      <tr key={nota.id} className="border-b border-black/5 last:border-0 dark:border-white/10">
                        <td className="px-5 py-3 font-mono text-xs text-accent-600">NT-{numero(nota.numero)}</td>
                        <td className="px-5 py-3"><p className="font-medium text-ink-900 dark:text-white">{nota.titulo}</p><p className="text-xs text-ink-300">{nota.descricao}</p></td>
                        <td className="px-5 py-3 text-ink-500">v{nota.versao ?? 1}</td>
                        <td className="px-5 py-3 text-ink-500">{nota.questoes?.length ?? 0}</td>
                        <td className="px-5 py-3">{nota.pdf ? <span className="rounded-full bg-success-500/10 px-2.5 py-1 text-xs font-semibold text-success-600">Anexado</span> : <span className="text-xs text-ink-300">—</span>}</td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => onEditarNota(nota.id)} className="mr-2 rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:text-primary-500 dark:border-white/10 dark:text-white">Editar</button>
                          <button
                            onClick={() => liberar(nota)}
                            disabled={liberando === nota.id}
                            title="Aumenta a versão da Nota Técnica: quem já concluiu a versão anterior fica liberado novamente, sem apagar histórico."
                            className="mr-2 rounded-lg border border-accent-400/40 px-3 py-1.5 text-xs font-semibold text-accent-600 hover:bg-accent-400/10 disabled:cursor-not-allowed disabled:opacity-50 dark:text-accent-300"
                          >
                            {liberando === nota.id ? "Liberando..." : "🔓 Liberar novamente"}
                          </button>
                          <button onClick={() => excluir(nota)} className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:text-danger-500 dark:border-white/10 dark:text-white">Excluir</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
