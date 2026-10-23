import { useEffect } from "react";

/**
 * Modo escuro desativado a pedido do cliente — o sistema permanece
 * sempre no tema claro. Mantido como stub para não quebrar as
 * chamadas já existentes nas páginas.
 */
export function useDarkMode() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  return { isDark: false, toggleDark: () => {} };
}
