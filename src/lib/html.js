import DOMPurify from "dompurify";

// =====================================================================
// Utilitários de HTML para o editor de texto rico
// =====================================================================

const TAGS_BLOCO = [
  "p", "br", "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "hr",
  "table", "thead", "tbody", "tr", "th", "td", "div",
];
const TAGS_INLINE = [
  "strong", "b", "em", "i", "u", "s", "strike", "sub", "sup", "span", "a", "mark",
];

// Perfis de sanitização
const PERFIL_COMPLETO = {
  ALLOWED_TAGS: [...TAGS_BLOCO, ...TAGS_INLINE, "img"],
  ALLOWED_ATTR: ["href", "target", "rel", "style", "colspan", "rowspan", "src", "alt"],
};
const PERFIL_INLINE = {
  ALLOWED_TAGS: ["br", ...TAGS_INLINE],
  ALLOWED_ATTR: ["href", "target", "rel", "style"],
};
const PERFIL_COLAR = {
  ALLOWED_TAGS: [...TAGS_BLOCO.filter((t) => t !== "div"), ...TAGS_INLINE.filter((t) => t !== "span" && t !== "mark"), "img"],
  ALLOWED_ATTR: ["href", "colspan", "rowspan", "src", "alt"],
};

// Links abertos sempre em nova aba, de forma segura
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
});

// Só mantém no atributo style o que o editor realmente gera
const ESTILOS_PERMITIDOS = {
  color: (v) => /^(inherit|#[0-9a-f]{3,8}|rgba?\([\d\s,.%]+\)|[a-z]+)$/i.test(v),
  "background-color": (v) => /^(transparent|#[0-9a-f]{3,8}|rgba?\([\d\s,.%]+\)|[a-z]+)$/i.test(v),
  "text-align": (v) => /^(left|right|center|justify)$/i.test(v),
  "text-decoration": (v) => /^(underline|line-through|none)( solid)?$/i.test(v),
  // Imagens
  width: (v) => /^\d{1,3}(\.\d+)?%$/.test(v),
  display: (v) => v === "block",
  "margin-left": (v) => v === "auto",
  "margin-right": (v) => v === "auto",
};
DOMPurify.addHook("uponSanitizeAttribute", (_node, data) => {
  if (data.attrName !== "style") return;
  const limpo = String(data.attrValue)
    .split(";")
    .map((p) => p.trim())
    .filter((p) => {
      const [prop, ...resto] = p.split(":");
      const valida = ESTILOS_PERMITIDOS[prop.trim().toLowerCase()];
      return valida ? valida(resto.join(":").trim()) : false;
    })
    .join("; ");
  data.attrValue = limpo;
  if (!limpo) data.keepAttr = false;
});

/** Texto puro (sem tags) que parece não ter HTML nenhum? */
function ehTextoPuro(valor) {
  return !/<\/?[a-z][\s\S]*>/i.test(valor);
}

function escaparHtml(texto) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Converte valores antigos (texto simples, com quebras de linha) em HTML,
 * para que perguntas já cadastradas continuem aparecendo corretamente.
 */
export function paraHtml(valor) {
  const texto = String(valor ?? "");
  if (!texto) return "";
  if (ehTextoPuro(texto)) {
    return escaparHtml(texto).replace(/\r?\n/g, "<br>");
  }
  return texto;
}

/** Sanitiza HTML para exibição/salvamento. */
export function limparHtml(valor, { inline = false } = {}) {
  return DOMPurify.sanitize(paraHtml(valor), inline ? PERFIL_INLINE : PERFIL_COMPLETO);
}

/** O HTML não tem texto nem elementos visuais (tabela, imagem, linha)? */
export function htmlVazio(valor) {
  const html = String(valor ?? "");
  if (/<(img|table|hr)\b/i.test(html)) return false;
  const texto = html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
  return texto.length === 0;
}

/**
 * Limpa conteúdo colado (principalmente do Word): remove classes, estilos
 * e tags de layout, mas preserva negrito, itálico, sublinhado, listas,
 * títulos e tabelas.
 */
export function limparColagem(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");

  // Converte estilos inline do Word (span com font-weight etc.) em tags reais
  doc.body.querySelectorAll("span[style]").forEach((el) => {
    const estilo = (el.getAttribute("style") || "").toLowerCase();
    let atual = el;
    const envolver = (tag) => {
      const novo = doc.createElement(tag);
      atual.parentNode.replaceChild(novo, atual);
      novo.appendChild(atual);
      atual = novo;
    };
    if (/font-weight:\s*(bold|[6-9]00)/.test(estilo)) envolver("strong");
    if (/font-style:\s*italic/.test(estilo)) envolver("em");
    if (/text-decoration[^;]*underline/.test(estilo)) envolver("u");
  });

  // Remove comentários condicionais e blocos do Office
  doc.body.querySelectorAll("o\\:p, style, meta, link, xml, img").forEach((el) => el.remove());

  return DOMPurify.sanitize(doc.body.innerHTML, PERFIL_COLAR);
}
