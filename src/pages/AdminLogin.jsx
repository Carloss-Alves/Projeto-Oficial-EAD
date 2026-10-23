import { useState } from "react";

export default function AdminLogin({ onLogin, onVoltar }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const submeter = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    const resultado = await onLogin(email, senha);
    setCarregando(false);
    if (!resultado?.ok) {
      setErro(resultado?.mensagem || "E-mail ou senha inválidos.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8] px-6 dark:bg-[#0d1520]">
      <form onSubmit={submeter} className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-ink-700/30">
        <div className="dossie-clip mb-5 flex h-11 w-11 items-center justify-center bg-primary-500 text-sm font-bold text-accent-300">NT</div>
        <h1 className="font-display mb-1 text-xl font-bold text-ink-900 dark:text-white">Área Administrativa</h1>
        <p className="mb-6 text-sm text-ink-500 dark:text-ink-300">Entre para gerenciar as Notas Técnicas.</p>

        <label className="mb-1 block text-xs font-semibold text-ink-700 dark:text-white">E-mail</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-400/15 dark:border-white/10 dark:bg-white/5 dark:text-white" autoFocus />

        <label className="mb-1 block text-xs font-semibold text-ink-700 dark:text-white">Senha</label>
        <input type="password" required value={senha} onChange={(e) => setSenha(e.target.value)}
          className="mb-2 w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-400/15 dark:border-white/10 dark:bg-white/5 dark:text-white" />

        {erro && <p className="mb-2 text-xs font-medium text-danger-500">{erro}</p>}

        <button disabled={carregando} type="submit" className="mt-4 w-full rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-400 disabled:opacity-50">
          {carregando ? "Entrando..." : "Entrar"}
        </button>
        <button type="button" onClick={onVoltar} className="mt-3 w-full text-center text-xs font-medium text-ink-500 hover:text-primary-500">
          Voltar ao site
        </button>
      </form>
    </div>
  );
}
