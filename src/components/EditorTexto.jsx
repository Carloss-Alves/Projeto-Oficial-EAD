import { useCallback, useEffect, useRef, useState } from "react";
import { htmlVazio, limparColagem, limparHtml, paraHtml } from "../lib/html";
import { CLASSES_CONTEUDO } from "./classesConteudo";

// =====================================================================
// EditorTexto — editor de texto com barra de formatação (estilo Word)
//
// variant:
//   "completo" → conteúdo da Nota Técnica (títulos, listas, tabelas, HTML)
//   "simples"  → pergunta e explicação (formatação, listas, alinhamento)
//   "inline"   → alternativas (negrito, itálico, cor... sem blocos)
// =====================================================================

const CORES_TEXTO = [
  "#cc4a44", "#e07a2f", "#c89a3e", "#1f8a5f", "#2c5282", "#1b3a5c",
  "#6b46c1", "#d53f8c", "#4a5c6b", "#8393a1",
];
const CORES_MARCA = [
  "#fff3b0", "#ffe0b2", "#ffcdd2", "#c8e6c9", "#bbdefb", "#e1bee7",
  "#d7ccc8", "#cfd8dc",
];

const ALTURA_MIN = { completo: "16rem", simples: "5.5rem", inline: "2.75rem" };

// ---------------------------------------------------------------------
// Ícones
// ---------------------------------------------------------------------
function Icone({ children }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      {children}
    </svg>
  );
}

const ICONES = {
  desfazer: <Icone><path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></Icone>,
  refazer: <Icone><path d="m15 14 5-5-5-5" /><path d="M20 9H10a6 6 0 0 0 0 12h3" /></Icone>,
  listaPonto: <Icone><path d="M9 6h12M9 12h12M9 18h12" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></Icone>,
  listaNumero: <Icone><path d="M10 6h11M10 12h11M10 18h11" /><path d="M3.5 4.5 5 4v4M3.5 14h3L3.5 17.5h3" /></Icone>,
  esquerda: <Icone><path d="M4 6h16M4 10h10M4 14h16M4 18h10" /></Icone>,
  centro: <Icone><path d="M4 6h16M7 10h10M4 14h16M7 18h10" /></Icone>,
  direita: <Icone><path d="M4 6h16M10 10h10M4 14h16M10 18h10" /></Icone>,
  justificar: <Icone><path d="M4 6h16M4 10h16M4 14h16M4 18h16" /></Icone>,
  recuoMais: <Icone><path d="M3 6h18M11 10h10M11 14h10M3 18h18" /><path d="m3 9 3 3-3 3" /></Icone>,
  recuoMenos: <Icone><path d="M3 6h18M11 10h10M11 14h10M3 18h18" /><path d="m6 9-3 3 3 3" /></Icone>,
  link: <Icone><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></Icone>,
  tabela: <Icone><rect x="3" y="4" width="18" height="16" rx="1" /><path d="M3 10h18M3 15h18M9 4v16M15 4v16" /></Icone>,
  limpar: <Icone><path d="m7 21-4-4 11-11 6 6-7 7" /><path d="M14 21h7" /><path d="m6.5 12.5 5 5" /></Icone>,
  imagem: <Icone><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="m21 16-5-5-8 8" /></Icone>,
  codigo: <Icone><path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" /></Icone>,
};

// ---------------------------------------------------------------------
// Botão da barra (não rouba o foco do texto)
// ---------------------------------------------------------------------
function Botao({ titulo, onClick, ativo = false, desabilitado = false, children, className = "" }) {
  return (
    <button
      type="button"
      title={titulo}
      aria-label={titulo}
      aria-pressed={ativo}
      disabled={desabilitado}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-sm text-ink-700 transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 dark:text-white dark:hover:bg-white/10 ${
        ativo ? "bg-primary-100 text-primary-600 dark:bg-white/15 dark:text-accent-300" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}

function Separador() {
  return <span className="mx-1 h-5 w-px self-center bg-black/10 dark:bg-white/15" aria-hidden="true" />;
}

// ---------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------
export default function EditorTexto({
  value,
  onChange,
  variant = "simples",
  placeholder = "",
  ariaLabel,
  onEnviarImagem, // async (file) => url ; se ausente, o botão de imagem some
}) {
  const completo = variant === "completo";
  const inline = variant === "inline";

  const wrapperRef = useRef(null);
  const editorRef = useRef(null);
  const ultimoEmitido = useRef(null);
  const selecaoSalva = useRef(null);

  const [ativos, setAtivos] = useState({});
  const [bloco, setBloco] = useState("p");
  const [popover, setPopover] = useState(null); // "cor" | "marca" | "link" | "tabela"
  const [urlLink, setUrlLink] = useState("");
  const [tabelaLinhas, setTabelaLinhas] = useState(3);
  const [tabelaColunas, setTabelaColunas] = useState(3);
  const [emTabela, setEmTabela] = useState(false);
  const [modoHtml, setModoHtml] = useState(false);
  const [vazio, setVazio] = useState(htmlVazio(value));
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState("");
  const [imagemSel, setImagemSel] = useState(null);
  const inputArquivoRef = useRef(null);
  const podeImagem = Boolean(onEnviarImagem) && !inline;

  // ---- Sincroniza o valor vindo de fora (ex.: carregar nota existente) ----
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (value === ultimoEmitido.current) return;
    el.innerHTML = limparHtml(paraHtml(value), { inline });
    ultimoEmitido.current = value;
    setVazio(htmlVazio(value));
  }, [value, inline]);

  useEffect(() => {
    try {
      document.execCommand("defaultParagraphSeparator", false, "p");
    } catch {
      /* navegadores antigos: ignora */
    }
  }, []);

  // ---- Envia alterações para o formulário ----
  const emitir = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML;
    const vazioAgora = htmlVazio(html);
    const saida = vazioAgora ? "" : html;
    ultimoEmitido.current = saida;
    setVazio(vazioAgora);
    onChange(saida);
  }, [onChange]);

  // ---- Estado dos botões conforme a posição do cursor ----
  const atualizarEstado = useCallback(() => {
    const el = editorRef.current;
    const sel = window.getSelection();
    if (!el || !sel || !sel.rangeCount || !el.contains(sel.anchorNode)) return;

    const cmds = ["bold", "italic", "underline", "strikeThrough", "subscript", "superscript",
      "insertUnorderedList", "insertOrderedList", "justifyLeft", "justifyCenter", "justifyRight", "justifyFull"];
    const novo = {};
    cmds.forEach((c) => {
      try { novo[c] = document.queryCommandState(c); } catch { novo[c] = false; }
    });
    setAtivos(novo);

    if (completo) {
      let valor = "p";
      try { valor = (document.queryCommandValue("formatBlock") || "p").toLowerCase().replace(/[<>]/g, ""); } catch { /* ignora */ }
      setBloco(["h2", "h3", "h4", "blockquote"].includes(valor) ? valor : "p");

      const no = sel.anchorNode?.nodeType === 1 ? sel.anchorNode : sel.anchorNode?.parentElement;
      setEmTabela(Boolean(no?.closest("td, th")));
    }
  }, [completo]);

  useEffect(() => {
    const handler = () => atualizarEstado();
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
  }, [atualizarEstado]);

  // ---- Fecha popovers ao clicar fora ----
  useEffect(() => {
    if (!popover) return;
    const fora = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setPopover(null);
    };
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, [popover]);

  // ---- Seleção (precisa ser guardada ao abrir popovers com inputs) ----
  const guardarSelecao = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && editorRef.current?.contains(sel.anchorNode)) {
      selecaoSalva.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restaurarSelecao = () => {
    editorRef.current?.focus();
    let range = selecaoSalva.current;
    if (!range || !editorRef.current.contains(range.startContainer)) {
      range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
    }
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };

  // ---- Executa um comando de formatação ----
  const exec = (comando, valor = null, { css = false } = {}) => {
    editorRef.current?.focus();
    try {
      document.execCommand("styleWithCSS", false, css);
      document.execCommand(comando, false, valor);
    } catch {
      /* comando não suportado */
    }
    emitir();
    atualizarEstado();
  };

  const abrirPopover = (nome) => {
    if (popover === nome) return setPopover(null);
    guardarSelecao();
    setPopover(nome);
  };

  const aplicarCor = (cor, tipo) => {
    restaurarSelecao();
    if (tipo === "marca") exec("hiliteColor", cor ?? "transparent", { css: true });
    else exec("foreColor", cor ?? "inherit", { css: true }); // null = cor automática
    setPopover(null);
  };

  const aplicarLink = (e) => {
    e.preventDefault();
    let url = urlLink.trim();
    if (!url) return;
    if (!/^(https?:\/\/|mailto:|\/|#)/i.test(url)) url = `https://${url}`;
    restaurarSelecao();
    const sel = window.getSelection();
    if (sel && sel.isCollapsed) {
      exec("insertHTML", `<a href="${url.replace(/"/g, "&quot;")}">${url.replace(/</g, "&lt;")}</a>`);
    } else {
      exec("createLink", url);
    }
    setUrlLink("");
    setPopover(null);
  };

  const inserirTabela = (e) => {
    e.preventDefault();
    const linhas = Math.min(20, Math.max(1, Number(tabelaLinhas) || 1));
    const colunas = Math.min(8, Math.max(1, Number(tabelaColunas) || 1));
    const cab = `<tr>${"<th>Título</th>".repeat(colunas)}</tr>`;
    const corpo = `<tr>${"<td><br></td>".repeat(colunas)}</tr>`.repeat(Math.max(0, linhas - 1));
    restaurarSelecao();
    exec("insertHTML", `<table><thead>${cab}</thead><tbody>${corpo}</tbody></table><p><br></p>`);
    setPopover(null);
  };

  // ---- Edição de tabela (linha/coluna) ----
  const celulaAtual = () => {
    const sel = window.getSelection();
    const no = sel?.anchorNode?.nodeType === 1 ? sel.anchorNode : sel?.anchorNode?.parentElement;
    return no?.closest("td, th") ?? null;
  };

  const novaCelula = (tag = "td") => {
    const c = document.createElement(tag);
    c.innerHTML = "<br>";
    return c;
  };

  const editarTabela = (acao) => {
    const cel = celulaAtual();
    if (!cel || !editorRef.current?.contains(cel)) return;
    const linha = cel.parentElement;
    const tabela = cel.closest("table");
    const idx = cel.cellIndex;

    if (acao === "linhaMais") {
      const nova = document.createElement("tr");
      for (let i = 0; i < linha.cells.length; i++) nova.appendChild(novaCelula("td"));
      // Linha do cabeçalho: a nova linha vai para o início do corpo
      if (linha.parentElement.tagName === "THEAD") {
        const corpo = tabela.tBodies[0] ?? tabela.appendChild(document.createElement("tbody"));
        corpo.insertBefore(nova, corpo.firstChild);
      } else {
        linha.after(nova);
      }
    } else if (acao === "linhaMenos") {
      if (tabela.rows.length <= 1) tabela.remove();
      else linha.remove();
    } else if (acao === "colunaMais") {
      [...tabela.rows].forEach((r) => {
        const ref = r.cells[idx];
        const nova = novaCelula(r.parentElement.tagName === "THEAD" ? "th" : "td");
        if (ref) ref.after(nova); else r.appendChild(nova);
      });
    } else if (acao === "colunaMenos") {
      if (linha.cells.length <= 1) tabela.remove();
      else [...tabela.rows].forEach((r) => r.cells[idx]?.remove());
    } else if (acao === "excluir") {
      tabela.remove();
    }

    setEmTabela(false);
    emitir();
  };

  // ---- Imagens ----
  const desmarcarImagem = useCallback(() => {
    setImagemSel((img) => {
      if (img) img.style.outline = "";
      return null;
    });
  }, []);

  const inserirImagem = async (file) => {
    if (!podeImagem || !file) return;
    setAviso("");
    setEnviando(true);
    try {
      const url = await onEnviarImagem(file);
      restaurarSelecao();
      exec("insertHTML", `<img src="${url}" alt=""><p><br></p>`);
    } catch (err) {
      setAviso(err?.message || "Não foi possível enviar a imagem.");
    } finally {
      setEnviando(false);
    }
  };

  const aoEscolherArquivo = (e) => {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    inserirImagem(arquivo);
  };

  const aoSoltar = (e) => {
    const arquivo = [...(e.dataTransfer?.files ?? [])].find((f) => f.type.startsWith("image/"));
    if (!arquivo || !podeImagem) return;
    e.preventDefault();
    // Coloca o cursor onde a imagem foi solta
    const pos = document.caretRangeFromPoint?.(e.clientX, e.clientY);
    if (pos && editorRef.current.contains(pos.startContainer)) selecaoSalva.current = pos;
    inserirImagem(arquivo);
  };

  const aoClicarNoEditor = (e) => {
    if (e.target.tagName === "IMG" && podeImagem) {
      desmarcarImagem();
      e.target.style.outline = "3px solid var(--color-accent-500)";
      setImagemSel(e.target);
    } else {
      desmarcarImagem();
    }
    atualizarEstado();
  };

  const ajustarImagem = (acao, valor) => {
    const img = imagemSel;
    if (!img || !editorRef.current?.contains(img)) return;
    if (acao === "largura") img.style.width = valor;
    if (acao === "esquerda") {
      img.style.display = "";
      img.style.marginLeft = "";
      img.style.marginRight = "";
    }
    if (acao === "centro") {
      img.style.display = "block";
      img.style.marginLeft = "auto";
      img.style.marginRight = "auto";
    }
    if (acao === "excluir") {
      img.remove();
      setImagemSel(null);
    }
    emitir();
  };

  // ---- Teclado ----
  const aoTeclar = (e) => {
    // Alternativas: Enter vira quebra de linha (sem criar blocos)
    if (inline && e.key === "Enter") {
      e.preventDefault();
      document.execCommand("insertLineBreak");
      emitir();
      return;
    }

    if (imagemSel && (e.key === "Delete" || e.key === "Backspace")) {
      e.preventDefault();
      ajustarImagem("excluir");
      return;
    }

    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    const k = e.key.toLowerCase();
    if (k === "k" && !inline) {
      e.preventDefault();
      guardarSelecao();
      setPopover("link");
    }
  };

  // ---- Colar (principalmente do Word) ----
  const aoColar = (e) => {
    const html = e.clipboardData.getData("text/html");
    const texto = e.clipboardData.getData("text/plain");
    e.preventDefault();

    // Print de tela / imagem copiada (sem texto junto): envia como imagem
    const imagem = [...e.clipboardData.files].find((f) => f.type.startsWith("image/"));
    if (imagem && !texto && podeImagem) {
      guardarSelecao();
      inserirImagem(imagem);
      return;
    }

    if (html && !inline) {
      document.execCommand("insertHTML", false, limparColagem(html));
    } else {
      // Alternativas: só texto puro, mantendo as quebras de linha
      const linhas = texto.replace(/\r/g, "").split("\n");
      const seguro = linhas
        .map((l) => l.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"))
        .join("<br>");
      document.execCommand("insertHTML", false, seguro);
    }
    emitir();
  };

  // ---- Modo HTML (código-fonte) ----
  const alternarHtml = () => {
    setPopover(null);
    setModoHtml((v) => !v);
  };

  // ---------------------------------------------------------------
  // Barra de ferramentas
  // ---------------------------------------------------------------
  const barra = (
    <div
      role="toolbar"
      aria-label="Formatação de texto"
      className={`flex flex-wrap items-center gap-0.5 border-b border-black/10 bg-[#f3f5f8] px-2 py-1.5 dark:border-white/10 dark:bg-white/5 ${
        inline ? "hidden group-focus-within:flex" : ""
      }`}
    >
      {!inline && (
        <>
          <Botao titulo="Desfazer (Ctrl+Z)" onClick={() => exec("undo")}>{ICONES.desfazer}</Botao>
          <Botao titulo="Refazer (Ctrl+Y)" onClick={() => exec("redo")}>{ICONES.refazer}</Botao>
          <Separador />
        </>
      )}

      {completo && (
        <>
          <select
            aria-label="Estilo do parágrafo"
            title="Estilo do parágrafo"
            value={bloco}
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => exec("formatBlock", `<${e.target.value}>`)}
            className="h-8 rounded-md border border-black/10 bg-white px-2 text-xs font-medium text-ink-700 dark:border-white/10 dark:bg-ink-900 dark:text-white"
          >
            <option value="p">Parágrafo</option>
            <option value="h2">Título</option>
            <option value="h3">Subtítulo</option>
            <option value="h4">Subtítulo menor</option>
            <option value="blockquote">Citação</option>
          </select>
          <Separador />
        </>
      )}

      <Botao titulo="Negrito (Ctrl+B)" ativo={ativos.bold} onClick={() => exec("bold")}><span className="font-bold">B</span></Botao>
      <Botao titulo="Itálico (Ctrl+I)" ativo={ativos.italic} onClick={() => exec("italic")}><span className="font-serif italic">I</span></Botao>
      <Botao titulo="Sublinhado (Ctrl+U)" ativo={ativos.underline} onClick={() => exec("underline")}><span className="underline">U</span></Botao>
      <Botao titulo="Tachado" ativo={ativos.strikeThrough} onClick={() => exec("strikeThrough")}><span className="line-through">S</span></Botao>
      <Botao titulo="Subscrito" ativo={ativos.subscript} onClick={() => exec("subscript")}><span className="text-xs">x<sub>2</sub></span></Botao>
      <Botao titulo="Sobrescrito" ativo={ativos.superscript} onClick={() => exec("superscript")}><span className="text-xs">x<sup>2</sup></span></Botao>

      <Separador />

      {/* Cor do texto */}
      <div className="relative">
        <Botao titulo="Cor do texto" ativo={popover === "cor"} onClick={() => abrirPopover("cor")}>
          <span className="flex flex-col items-center leading-none">
            <span className="font-bold">A</span>
            <span className="mt-0.5 h-0.5 w-3.5 rounded bg-danger-500" />
          </span>
        </Botao>
        {popover === "cor" && (
          <Paleta titulo="Cor do texto" cores={CORES_TEXTO} onEscolher={(c) => aplicarCor(c, "texto")} rotuloLimpar="Automática" />
        )}
      </div>

      {/* Marca-texto */}
      <div className="relative">
        <Botao titulo="Cor de destaque" ativo={popover === "marca"} onClick={() => abrirPopover("marca")}>
          <span className="flex flex-col items-center leading-none">
            <span className="text-xs font-bold">ab</span>
            <span className="mt-0.5 h-0.5 w-3.5 rounded bg-yellow-300" />
          </span>
        </Botao>
        {popover === "marca" && (
          <Paleta titulo="Cor de destaque" cores={CORES_MARCA} onEscolher={(c) => aplicarCor(c, "marca")} rotuloLimpar="Sem destaque" />
        )}
      </div>

      {!inline && (
        <>
          <Separador />
          <Botao titulo="Lista com marcadores" ativo={ativos.insertUnorderedList} onClick={() => exec("insertUnorderedList")}>{ICONES.listaPonto}</Botao>
          <Botao titulo="Lista numerada" ativo={ativos.insertOrderedList} onClick={() => exec("insertOrderedList")}>{ICONES.listaNumero}</Botao>
          {completo && (
            <>
              <Botao titulo="Diminuir recuo" onClick={() => exec("outdent")}>{ICONES.recuoMenos}</Botao>
              <Botao titulo="Aumentar recuo" onClick={() => exec("indent")}>{ICONES.recuoMais}</Botao>
            </>
          )}
          <Separador />
          <Botao titulo="Alinhar à esquerda" ativo={ativos.justifyLeft} onClick={() => exec("justifyLeft", null, { css: true })}>{ICONES.esquerda}</Botao>
          <Botao titulo="Centralizar" ativo={ativos.justifyCenter} onClick={() => exec("justifyCenter", null, { css: true })}>{ICONES.centro}</Botao>
          <Botao titulo="Alinhar à direita" ativo={ativos.justifyRight} onClick={() => exec("justifyRight", null, { css: true })}>{ICONES.direita}</Botao>
          <Botao titulo="Justificar" ativo={ativos.justifyFull} onClick={() => exec("justifyFull", null, { css: true })}>{ICONES.justificar}</Botao>

          <Separador />

          {/* Link */}
          <div className="relative">
            <Botao titulo="Inserir link (Ctrl+K)" ativo={popover === "link"} onClick={() => abrirPopover("link")}>{ICONES.link}</Botao>
            {popover === "link" && (
              <form onSubmit={aplicarLink} className="absolute left-0 top-full z-30 mt-1 flex w-72 gap-2 rounded-xl border border-black/10 bg-white p-2 shadow-lg dark:border-white/10 dark:bg-ink-900">
                <input
                  autoFocus
                  value={urlLink}
                  onChange={(e) => setUrlLink(e.target.value)}
                  placeholder="https://..."
                  className="min-w-0 flex-1 rounded-lg border border-black/10 px-2.5 py-1.5 text-xs dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
                <button type="submit" className="rounded-lg bg-primary-500 px-3 text-xs font-semibold text-white hover:bg-primary-400">OK</button>
              </form>
            )}
          </div>

          {podeImagem && (
            <Botao titulo="Inserir imagem" desabilitado={enviando} onClick={() => { guardarSelecao(); inputArquivoRef.current?.click(); }}>{ICONES.imagem}</Botao>
          )}

          {completo && (
            <div className="relative">
              <Botao titulo="Inserir tabela" ativo={popover === "tabela"} onClick={() => abrirPopover("tabela")}>{ICONES.tabela}</Botao>
              {popover === "tabela" && (
                <form onSubmit={inserirTabela} className="absolute left-0 top-full z-30 mt-1 w-56 rounded-xl border border-black/10 bg-white p-3 shadow-lg dark:border-white/10 dark:bg-ink-900">
                  <div className="mb-3 grid grid-cols-2 gap-2 text-xs text-ink-700 dark:text-white">
                    <label className="space-y-1">
                      <span className="block font-semibold">Linhas</span>
                      <input type="number" min="1" max="20" value={tabelaLinhas} onChange={(e) => setTabelaLinhas(e.target.value)} className="w-full rounded-lg border border-black/10 px-2 py-1.5 dark:border-white/10 dark:bg-white/5" />
                    </label>
                    <label className="space-y-1">
                      <span className="block font-semibold">Colunas</span>
                      <input type="number" min="1" max="8" value={tabelaColunas} onChange={(e) => setTabelaColunas(e.target.value)} className="w-full rounded-lg border border-black/10 px-2 py-1.5 dark:border-white/10 dark:bg-white/5" />
                    </label>
                  </div>
                  <button type="submit" className="w-full rounded-lg bg-primary-500 py-1.5 text-xs font-semibold text-white hover:bg-primary-400">Inserir tabela</button>
                </form>
              )}
            </div>
          )}
        </>
      )}

      <Separador />
      <Botao titulo="Limpar formatação" onClick={() => exec("removeFormat")}>{ICONES.limpar}</Botao>

      {completo && (
        <Botao titulo="Editar código HTML" ativo={modoHtml} onClick={alternarHtml} className="ml-auto">{ICONES.codigo}</Botao>
      )}
    </div>
  );

  // Barra extra que aparece quando o cursor está dentro de uma tabela
  const barraTabela = completo && emTabela && !modoHtml && (
    <div className="flex flex-wrap items-center gap-1 border-b border-black/10 bg-primary-50 px-2 py-1 text-xs dark:border-white/10 dark:bg-primary-500/20">
      <span className="mr-1 font-semibold text-primary-600 dark:text-accent-300">Tabela:</span>
      {[
        ["linhaMais", "+ Linha"],
        ["linhaMenos", "− Linha"],
        ["colunaMais", "+ Coluna"],
        ["colunaMenos", "− Coluna"],
        ["excluir", "Excluir tabela"],
      ].map(([acao, rotulo]) => (
        <button
          key={acao}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editarTabela(acao)}
          className={`rounded-md border border-black/10 bg-white px-2 py-1 font-semibold hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 ${
            acao === "excluir" ? "text-danger-500" : "text-ink-700"
          }`}
        >
          {rotulo}
        </button>
      ))}
    </div>
  );

  const barraImagem = imagemSel && !modoHtml && (
    <div className="flex flex-wrap items-center gap-1 border-b border-black/10 bg-accent-300/20 px-2 py-1 text-xs dark:border-white/10 dark:bg-accent-500/10">
      <span className="mr-1 font-semibold text-primary-600 dark:text-accent-300">Imagem:</span>
      {["25%", "50%", "75%", "100%"].map((w) => (
        <button key={w} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => ajustarImagem("largura", w)}
          className="rounded-md border border-black/10 bg-white px-2 py-1 font-semibold text-ink-700 hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">
          {w}
        </button>
      ))}
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => ajustarImagem("esquerda")} className="rounded-md border border-black/10 bg-white px-2 py-1 font-semibold text-ink-700 hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-white">Esquerda</button>
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => ajustarImagem("centro")} className="rounded-md border border-black/10 bg-white px-2 py-1 font-semibold text-ink-700 hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-white">Centro</button>
      <input
        key={imagemSel.src}
        aria-label="Descrição da imagem"
        defaultValue={imagemSel.getAttribute("alt") ?? ""}
        onChange={(e) => { imagemSel.setAttribute("alt", e.target.value); emitir(); }}
        placeholder="Descrição (acessibilidade)"
        className="min-w-0 flex-1 rounded-md border border-black/10 bg-white px-2 py-1 dark:border-white/10 dark:bg-white/5 dark:text-white"
      />
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => ajustarImagem("excluir")} className="rounded-md border border-black/10 bg-white px-2 py-1 font-semibold text-danger-500 hover:bg-black/5 dark:border-white/10 dark:bg-white/5">Excluir</button>
    </div>
  );

  const classeEdicao = completo
    ? CLASSES_CONTEUDO
    : "rte-content";

  return (
    <div
      ref={wrapperRef}
      className="group rounded-xl border border-black/10 bg-white focus-within:border-primary-400 focus-within:ring-4 focus-within:ring-primary-400/15 dark:border-white/10 dark:bg-white/5"
    >
      <div className="overflow-visible rounded-t-xl">{barra}</div>
      {barraTabela}
      {barraImagem}
      {podeImagem && (
        <input ref={inputArquivoRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={aoEscolherArquivo} className="hidden" />
      )}
      {(enviando || aviso) && (
        <div className={`border-b px-3 py-1.5 text-xs font-medium ${aviso ? "border-danger-500/20 bg-danger-500/10 text-danger-500" : "border-black/10 bg-primary-50 text-primary-600 dark:border-white/10 dark:bg-white/5 dark:text-accent-300"}`}>
          {enviando ? "Enviando imagem..." : aviso}
        </div>
      )}

      <div className="relative">
        {vazio && !modoHtml && placeholder && (
          <div className="pointer-events-none absolute left-3.5 top-2.5 text-sm text-ink-300">{placeholder}</div>
        )}

        <div
          ref={editorRef}
          role="textbox"
          aria-multiline="true"
          aria-label={ariaLabel}
          contentEditable
          suppressContentEditableWarning
          spellCheck
          onInput={emitir}
          onKeyDown={aoTeclar}
          onPaste={aoColar}
          onKeyUp={atualizarEstado}
          onClick={aoClicarNoEditor}
          onDrop={aoSoltar}
          onBlur={emitir}
          style={{ minHeight: ALTURA_MIN[variant] }}
          className={`rte-editavel ${classeEdicao} ${modoHtml ? "hidden" : ""} break-words px-3.5 py-2.5 text-sm text-ink-900 outline-none dark:text-white ${
            completo ? "max-h-[32rem] overflow-y-auto" : ""
          }`}
        />

        {modoHtml && (
          <textarea
            aria-label="Código HTML"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            style={{ minHeight: ALTURA_MIN[variant] }}
            className="block w-full resize-y rounded-b-xl bg-transparent px-3.5 py-2.5 font-mono text-xs text-ink-900 outline-none dark:text-white"
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Paleta de cores
// ---------------------------------------------------------------------
function Paleta({ titulo, cores, onEscolher, rotuloLimpar }) {
  return (
    <div className="absolute left-0 top-full z-30 mt-1 w-48 rounded-xl border border-black/10 bg-white p-3 shadow-lg dark:border-white/10 dark:bg-ink-900">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-300">{titulo}</p>
      <div className="grid grid-cols-5 gap-1.5">
        {cores.map((cor) => (
          <button
            key={cor}
            type="button"
            title={cor}
            aria-label={`${titulo} ${cor}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onEscolher(cor)}
            className="h-7 w-7 rounded-md border border-black/10 transition-transform hover:scale-110 dark:border-white/20"
            style={{ backgroundColor: cor }}
          />
        ))}
      </div>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onEscolher(null)}
        className="mt-2 w-full rounded-lg border border-black/10 py-1 text-xs font-semibold text-ink-700 hover:bg-black/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
      >
        {rotuloLimpar}
      </button>
    </div>
  );
}
