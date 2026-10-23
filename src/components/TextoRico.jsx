import { useMemo } from "react";
import { limparHtml } from "../lib/html";

/**
 * Exibe texto formatado (perguntas, alternativas, explicações) gerado pelo
 * editor. Também aceita textos antigos, sem formatação.
 *
 * - `inline`: renderiza em <span> (usado dentro de botões e frases).
 * - padrão: renderiza em <div>, com parágrafos, listas, etc.
 */
export default function TextoRico({ html, inline = false, className = "" }) {
  const seguro = useMemo(() => limparHtml(html, { inline }), [html, inline]);
  const Tag = inline ? "span" : "div";

  return (
    <Tag
      className={`rte-content ${className}`}
      dangerouslySetInnerHTML={{ __html: seguro }}
    />
  );
}
