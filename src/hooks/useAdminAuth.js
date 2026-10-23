import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useAdminAuth() {
  const [sessao, setSessao] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(false);

  const verificarAdmin = useCallback(async (session) => {
    if (!session?.user?.id) {
      setIsAdmin(false);
      return false;
    }

    const { data, error } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle();

    const autorizado = !error && Boolean(data);
    setIsAdmin(autorizado);
    return autorizado;
  }, []);

  useEffect(() => {
    let ativo = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!ativo) return;
      const session = data.session ?? null;
      setSessao(session);
      if (session) await verificarAdmin(session);
      else setIsAdmin(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!ativo) return;
      setSessao(session ?? null);
    });

    return () => {
      ativo = false;
      listener.subscription.unsubscribe();
    };
  }, [verificarAdmin]);

  useEffect(() => {
    if (sessao) verificarAdmin(sessao);
    else setIsAdmin(false);
  }, [sessao, verificarAdmin]);

  const login = useCallback(async (email, senha) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    if (error) {
      const mensagens = {
        invalid_credentials: "E-mail ou senha inválidos.",
        email_not_confirmed: "Confirme o e-mail da conta antes de entrar.",
        user_not_found: "E-mail ou senha inválidos.",
      };
      return {
        ok: false,
        mensagem: mensagens[error.code] || error.message || "Não foi possível entrar.",
      };
    }

    const autorizado = await verificarAdmin(data.session);
    if (!autorizado) {
      await supabase.auth.signOut();
      setSessao(null);
      return {
        ok: false,
        mensagem: "Este usuário não possui acesso ao painel administrativo.",
      };
    }

    setSessao(data.session ?? null);
    return { ok: true };
  }, [verificarAdmin]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSessao(null);
    setIsAdmin(false);
  }, []);

  return {
    autenticado: Boolean(sessao) && isAdmin,
    carregando: sessao === undefined,
    usuario: sessao?.user ?? null,
    login,
    logout,
  };
}
