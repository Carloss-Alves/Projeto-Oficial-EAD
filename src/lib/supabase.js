import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "As variáveis VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY não foram configuradas."
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);

// =====================================================================
// SESSÃO ANÔNIMA DO PARTICIPANTE
// =====================================================================
//
// Cada participante precisa de um `user_id` real e estável do Supabase
// Auth para que o controle de acesso individual das Notas Técnicas
// funcione (nunca usamos o nome digitado como identificador).
//
// O Supabase Auth já persiste a sessão no localStorage por padrão,
// então reabrir o navegador reaproveita o mesmo usuário anônimo — só
// criamos um novo quando realmente não existe nenhuma sessão salva.
// =====================================================================

let sessaoAnonimaPromise = null;

export async function garantirUsuarioAnonimo() {
  if (!sessaoAnonimaPromise) {
    sessaoAnonimaPromise = (async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      if (data.session?.user) {
        return data.session.user;
      }

      const { data: signInData, error: signInError } =
        await supabase.auth.signInAnonymously();

      if (signInError) {
        throw signInError;
      }

      if (!signInData?.user) {
        throw new Error(
          "Não foi possível iniciar a sessão do participante."
        );
      }

      return signInData.user;
    })().catch((err) => {
      // Se falhar, permite tentar novamente na próxima chamada
      // em vez de ficar travado num erro antigo.
      sessaoAnonimaPromise = null;
      throw err;
    });
  }

  return sessaoAnonimaPromise;
}