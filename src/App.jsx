import { useState } from "react";
import Home from "./pages/Home";
import NotaTecnica from "./pages/NotaTecnica";
import Exercicio from "./pages/Exercicio";
import Conclusao from "./pages/Conclusao";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminForm from "./pages/AdminForm";
import { useAdminAuth } from "./hooks/useAdminAuth";

const PAGINAS_ADMIN = ["admin-login", "admin-dashboard", "admin-form"];

export default function App() {
  const [pagina, setPagina] = useState("home");
  const [notaSelecionada, setNotaSelecionada] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [notaEmEdicao, setNotaEmEdicao] = useState(null);
  const { autenticado, carregando: carregandoAuth, login, logout } = useAdminAuth();

  const acessarNota = (id) => { setNotaSelecionada(id); setPagina("nota"); };
  const voltarHome = () => { setNotaSelecionada(null); setResultado(null); setPagina("home"); };
  const iniciarExercicio = (id) => { setNotaSelecionada(id); setPagina("exercicio"); };
  const finalizarExercicio = (id, resultadoFinal) => {
    setNotaSelecionada(id); setResultado(resultadoFinal); setPagina("conclusao");
  };

  const abrirAdmin = () => setPagina(autenticado ? "admin-dashboard" : "admin-login");

  const tentarLogin = async (email, senha) => {
    const resultadoLogin = await login(email, senha);
    if (resultadoLogin.ok) setPagina("admin-dashboard");
    return resultadoLogin;
  };

  const abrirNovaNota = () => { setNotaEmEdicao(null); setPagina("admin-form"); };
  const abrirEdicaoNota = (id) => { setNotaEmEdicao(id); setPagina("admin-form"); };

  if (carregandoAuth) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8] text-sm text-ink-500">Carregando...</div>;
  }

  let conteudo;
  if (pagina === "home") conteudo = <Home onAcessarNota={acessarNota} />;
  else if (pagina === "nota") conteudo = <NotaTecnica notaId={notaSelecionada} onVoltar={voltarHome} onIniciarExercicio={iniciarExercicio} />;
  else if (pagina === "exercicio") conteudo = <Exercicio notaId={notaSelecionada} onFinalizar={finalizarExercicio} />;
  else if (pagina === "conclusao") conteudo = <Conclusao notaId={notaSelecionada} resultado={resultado} onVoltar={voltarHome} />;
  else if (pagina === "admin-login") conteudo = <AdminLogin onLogin={tentarLogin} onVoltar={voltarHome} />;
  else if (pagina === "admin-dashboard") {
    conteudo = autenticado
      ? <AdminDashboard onNovaNota={abrirNovaNota} onEditarNota={abrirEdicaoNota} onVoltarSite={voltarHome} onLogout={async () => { await logout(); voltarHome(); }} />
      : <AdminLogin onLogin={tentarLogin} onVoltar={voltarHome} />;
  } else if (pagina === "admin-form") {
    conteudo = autenticado
      ? <AdminForm notaId={notaEmEdicao} onSalvar={() => setPagina("admin-dashboard")} onCancelar={() => setPagina("admin-dashboard")} />
      : <AdminLogin onLogin={tentarLogin} onVoltar={voltarHome} />;
  }

  return (
    <>
      {conteudo}
      {!PAGINAS_ADMIN.includes(pagina) && (
        <button onClick={abrirAdmin} title="Área administrativa"
          className="fixed bottom-5 right-5 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-ink-500 shadow-md transition hover:border-primary-400/40 hover:text-primary-500 dark:border-white/10 dark:bg-ink-700 dark:text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33 2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
          </svg>
        </button>
      )}
    </>
  );
}
