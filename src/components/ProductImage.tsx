import { ImgHTMLAttributes, useEffect, useState } from "react";

type ProductImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  cleanupBackground?: boolean;
};

const processedCache = new Map<string, string>();

const isRemovableBackground = (r: number, g: number, b: number, a: number) => {
  if (a < 12) return true;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const avg = (r + g + b) / 3;
  return avg > 178 && max - min < 38;
};

const cleanImageBackground = async (src: string) => {
  if (processedCache.has(src)) return processedCache.get(src)!;

  const imageBlob = await fetch(
    /^https?:/i.test(src) ? `/api/public/image-proxy?url=${encodeURIComponent(src)}` : src,
    { cache: "force-cache" },
  ).then((response) => {
    if (!response.ok) throw new Error("No se pudo procesar la imagen");
    return response.blob();
  });

  const objectUrl = URL.createObjectURL(imageBlob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = objectUrl;
    });

    const maxSide = 1400;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Canvas no disponible");

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const { data } = imageData;
    const total = width * height;
    const visited = new Uint8Array(total);
    const queue = new Int32Array(total);
    let head = 0;
    let tail = 0;

    const enqueueIfBackground = (index: number) => {
      if (visited[index]) return;
      const offset = index * 4;
      if (!isRemovableBackground(data[offset], data[offset + 1], data[offset + 2], data[offset + 3])) return;
      visited[index] = 1;
      queue[tail++] = index;
    };

    for (let x = 0; x < width; x += 1) {
      enqueueIfBackground(x);
      enqueueIfBackground((height - 1) * width + x);
    }
    for (let y = 1; y < height - 1; y += 1) {
      enqueueIfBackground(y * width);
      enqueueIfBackground(y * width + width - 1);
    }

    while (head < tail) {
      const index = queue[head++];
      const offset = index * 4;
      data[offset + 3] = 0;
      const x = index % width;
      if (x > 0) enqueueIfBackground(index - 1);
      if (x < width - 1) enqueueIfBackground(index + 1);
      if (index >= width) enqueueIfBackground(index - width);
      if (index < total - width) enqueueIfBackground(index + width);
    }

    ctx.putImageData(imageData, 0, 0);
    const cleanedBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!cleanedBlob) throw new Error("No se pudo exportar la imagen");
    const cleanedUrl = URL.createObjectURL(cleanedBlob);
    processedCache.set(src, cleanedUrl);
    return cleanedUrl;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

export function ProductImage({ src, cleanupBackground = true, ...props }: ProductImageProps) {
  const [displaySrc, setDisplaySrc] = useState(src);

  useEffect(() => {
    let cancelled = false;
    setDisplaySrc(src);
    if (!cleanupBackground || !src || typeof window === "undefined") return;

    cleanImageBackground(src)
      .then((url) => {
        if (!cancelled) setDisplaySrc(url);
      })
      .catch(() => {
        if (!cancelled) setDisplaySrc(src);
      });

    return () => {
      cancelled = true;
    };
  }, [cleanupBackground, src]);

  return <img {...props} src={displaySrc} />;
}