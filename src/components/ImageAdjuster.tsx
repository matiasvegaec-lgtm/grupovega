import { useEffect, useRef, useState } from "react";
import { X, Loader2, ZoomIn, ZoomOut, RotateCcw, Check } from "lucide-react";

type Props = {
  /** Imagen fuente: URL pública, data URL o object URL */
  src: string;
  /** Tamaño final en píxeles del cuadrado exportado */
  outputSize?: number;
  /** Color del fondo del lienzo (para imágenes con transparencia) */
  backgroundColor?: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => Promise<void> | void;
};

/**
 * Editor manual de imagen: permite ajustar zoom y posición sobre un lienzo
 * cuadrado y exportar el recorte como PNG listo para el catálogo.
 */
export function ImageAdjuster({ src, outputSize = 1000, backgroundColor = "#FFFFFF", onCancel, onConfirm }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [scale, setScale] = useState(1); // multiplicador sobre el "fit"
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // px en el lienzo
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [saving, setSaving] = useState(false);

  // Tamaño del lienzo de previsualización (cuadrado)
  const PREVIEW = 320;

  // Escala base "contain": ajusta la imagen completa dentro del cuadrado
  const baseScale = naturalSize.w && naturalSize.h
    ? Math.min(PREVIEW / naturalSize.w, PREVIEW / naturalSize.h)
    : 1;

  const drawW = naturalSize.w * baseScale * scale;
  const drawH = naturalSize.h * baseScale * scale;

  const reset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    setImgLoaded(false);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      setImgLoaded(true);
    };
    img.onerror = () => {
      // Reintentar sin crossOrigin si falla por CORS
      const img2 = new Image();
      img2.onload = () => {
        imgRef.current = img2;
        setNaturalSize({ w: img2.naturalWidth, h: img2.naturalHeight });
        setImgLoaded(true);
      };
      img2.src = src;
    };
    img.src = src;

    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [src]);

  // Pointer handlers (mouse + touch unificados)
  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy });
  };
  const onPointerUp = () => {
    setDragging(false);
    dragStart.current = null;
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setScale((s) => Math.max(0.2, Math.min(5, s + delta)));
  };

  const handleConfirm = async () => {
    if (!imgRef.current || !naturalSize.w) return;
    setSaving(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas no disponible");

      // Fondo
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, outputSize, outputSize);

      // Escalar la transformación de previsualización a la salida real
      const ratio = outputSize / PREVIEW;
      const finalDrawW = drawW * ratio;
      const finalDrawH = drawH * ratio;
      const cx = outputSize / 2 + offset.x * ratio;
      const cy = outputSize / 2 + offset.y * ratio;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(imgRef.current, cx - finalDrawW / 2, cy - finalDrawH / 2, finalDrawW, finalDrawH);

      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo generar la imagen"))), "image/png", 0.95);
      });
      const previewUrl = URL.createObjectURL(blob);
      objectUrlRef.current = previewUrl;
      imgRef.current = null;
      setImgLoaded(false);
      await onConfirm(blob);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-card rounded-2xl p-4 md:p-6 max-w-md w-full shadow-elegant" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-navy-deep">Ajustar imagen</h3>
          <button type="button" onClick={onCancel} aria-label="Cerrar"><X className="w-5 h-5" /></button>
        </div>

        <p className="text-xs text-muted-foreground mb-3">
          Arrastra para mover, usa el control de zoom o la rueda del mouse para acercar.
        </p>

        <div
          ref={containerRef}
          className="relative mx-auto rounded-xl overflow-hidden border border-border touch-none select-none"
          style={{ width: PREVIEW, height: PREVIEW, background: backgroundColor, cursor: dragging ? "grabbing" : "grab" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
        >
          {imgLoaded && naturalSize.w > 0 && (
            <img
              src={src}
              alt="Ajustar"
              draggable={false}
              style={{
                position: "absolute",
                width: drawW,
                height: drawH,
                left: PREVIEW / 2 - drawW / 2 + offset.x,
                top: PREVIEW / 2 - drawH / 2 + offset.y,
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
          )}
          {!imgLoaded && (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-ocean" />
            </div>
          )}
          {/* Marco guía */}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-ocean/30" />
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button type="button" onClick={() => setScale((s) => Math.max(0.2, s - 0.1))} className="p-2 rounded-lg bg-foam text-navy-deep" aria-label="Alejar">
            <ZoomOut className="w-4 h-4" />
          </button>
          <input
            type="range"
            min={0.2}
            max={5}
            step={0.01}
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="flex-1 accent-ocean"
          />
          <button type="button" onClick={() => setScale((s) => Math.min(5, s + 0.1))} className="p-2 rounded-lg bg-foam text-navy-deep" aria-label="Acercar">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button type="button" onClick={reset} className="p-2 rounded-lg bg-foam text-navy-deep" aria-label="Restablecer" title="Restablecer">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-border text-sm font-semibold">Cancelar</button>
          <button type="button" disabled={saving || !imgLoaded} onClick={handleConfirm} className="px-5 py-2 rounded-lg gradient-wave text-white text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}