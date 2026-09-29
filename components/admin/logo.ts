// Normaliza cualquier imagen (PNG, JPG, SVG, WebP) a un PNG de máximo 800 px,
// recortando los márgenes transparentes, para que todos los logos se vean parejos.
const MAX = 800;

function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo leer la imagen"));
    img.src = url;
  });
}

function trimTransparent(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext("2d")!;
  const { width: w, height: h } = canvas;
  const px = ctx.getImageData(0, 0, w, h).data;
  let top = h, left = w, right = -1, bottom = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (px[(y * w + x) * 4 + 3] > 8) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  if (right < 0) return canvas;
  const out = document.createElement("canvas");
  out.width = right - left + 1;
  out.height = bottom - top + 1;
  out.getContext("2d")!.drawImage(canvas, left, top, out.width, out.height, 0, 0, out.width, out.height);
  return out;
}

/** true si el logo es mayormente claro (blanco, amarillo, lima…) y se lee mejor sobre fondo oscuro. */
function isLightLogo(canvas: HTMLCanvasElement): boolean {
  const px = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data;
  let sum = 0, n = 0;
  for (let i = 0; i < px.length; i += 16) {
    if (px[i + 3] < 128) continue;
    sum += (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255;
    n++;
  }
  // Un logo con fondo blanco sólido cuenta como "oscuro sobre blanco": no necesita fondo oscuro
  const opaqueShare = n / (px.length / 16);
  return n > 0 && opaqueShare < 0.9 && sum / n > 0.72;
}

export async function normalizeLogo(blob: Blob): Promise<{ png: Blob; light: boolean }> {
  const img = await loadImage(blob);
  // Los SVG sin width/height reportan 0: se les da un tamaño base
  const w0 = img.naturalWidth || MAX;
  const h0 = img.naturalHeight || MAX / 2;
  // Los vectores se escalan a MAX; los bitmaps solo se reducen, nunca se agrandan
  const fit = MAX / Math.max(w0, h0);
  const k = blob.type === "image/svg+xml" ? fit : Math.min(1, fit);

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w0 * k);
  canvas.height = Math.round(h0 * k);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(img.src);

  const trimmed = trimTransparent(canvas);
  const light = isLightLogo(trimmed);
  const png = await new Promise<Blob>((resolve, reject) =>
    trimmed.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo convertir el logo"))), "image/png"),
  );
  return { png, light };
}
