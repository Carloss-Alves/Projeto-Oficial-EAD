import { useMemo } from "react";
import { limparHtml } from "../lib/html";
import { CLASSES_CONTEUDO } from "./classesConteudo";

export default function ConteudoNota({ html }) {
  const seguro = useMemo(() => limparHtml(html), [html]);

  return (
    <div
      className={CLASSES_CONTEUDO}
      dangerouslySetInnerHTML={{ __html: seguro }}
    />
  );
}
