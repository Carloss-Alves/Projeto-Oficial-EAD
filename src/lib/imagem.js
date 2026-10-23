// Reduz imagens grandes antes do envio (fotos de celular chegam a 5–10 MB).
const LARGURA_MAX = 1600;
const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const TAMANHO_MAX_IMAGEM = 5 * 1024 * 1024;

export async function prepararImagem(file) {
  if (!file || !TIPOS.includes(file.type)) {
    throw new Error("Use uma imagem JPG, PNG, WEBP ou GIF.");
  }

  // GIF pode ser animado: não mexemos.
  let saida = file;

  if (file.type !== "image/gif") {
    try {
      const bitmap = await createImageBitmap(file);
      const escala = Math.min(1, LARGURA_MAX / bitmap.width);
      if (escala < 1 || file.size > 1024 * 1024) {
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(bitmap.width * escala);
        canvas.height = Math.round(bitmap.height * escala);
        canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        // PNG pode ter transparência: mantém PNG; fotos viram WEBP.
        const tipo = file.type === "image/png" ? "image/png" : "image/webp";
        const blob = await new Promise((ok) => canvas.toBlob(ok, tipo, 0.85));
        if (blob && blob.size < file.size) {
          saida = new File([blob], file.name, { type: tipo });
        }
      }
      bitmap.close?.();
    } catch {
      /* se não der para reduzir, envia o original */
    }
  }

  if (saida.size > TAMANHO_MAX_IMAGEM) {
    throw new Error("A imagem deve ter no máximo 5 MB.");
  }
  return saida;
}
