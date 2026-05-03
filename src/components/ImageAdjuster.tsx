import { useEffect, useRef, useState } from "react";
import { X, Loader2, ZoomIn, ZoomOut, RotateCcw, Check } from "lucide-react";
import { toast } from "sonner";

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
export function ImageAdjuster({
  src,
  outputSize = 1000,
  backgroundColor = "#FFFFFF",
  onCancel,
  onConfirm,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [displaySrc, setDisplaySrc] = useState(src);
  const [loadError, setLoadError] = useState<string | null>(null);
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
  const baseScale =
    naturalSize.w && naturalSize.h ? Math.min(PREVIEW / naturalSize.w, PREVIEW / naturalSize.h) : 1;

  const drawW = naturalSize.w * baseScale * scale;
  const drawH = naturalSize.h * baseScale * scale;

  const reset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    setImgLoaded(false);
    setLoadError(null);
    setDisplaySrc(src);
    let cancelled = false;
    let localObjectUrl: string | null = null;

    const loadFromUrl = (url: string, isObjectUrl: boolean) => {
      const img = new Image();
      // Sólo aplicamos crossOrigin a URLs http(s) reales para que el canvas no quede "tainted"
      if (!isObjectUrl && /^https?:/i.test(url)) {
        img.crossOrigin = "anonymous";
      }
      img.onload = () => {
        if (cancelled) return;
        imgRef.current = img;
        setDisplaySrc(url);
        setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
        setImgLoaded(true);
      };
      img.onerror = () => {
        if (cancelled) return;
        // Último recurso: cargar sin CORS (no se podrá exportar pero al menos se ve)
        const fallback = new Image();
        fallback.onload = () => {
          if (cancelled) return;
          imgRef.current = fallback;
          setDisplaySrc(url);
          setNaturalSize({ w: fallback.naturalWidth, h: fallback.naturalHeight });
          setImgLoaded(true);
        };
        fallback.onerror = () => {
          if (cancelled) return;
          setLoadError("No se pudo cargar esta imagen. Intenta volver a subirla.");
        };
        fallback.src = url;
      };
      img.src = url;
    };

    // Estrategia robusta: descargar como blob y usar object URL.
    // Esto evita el problema de "canvas tainted" al exportar imágenes
    // que vienen de otro origen (Supabase storage) cuando CORS no responde
    // con los headers esperados.
    if (/^https?:/i.test(src)) {
      fetch(src, { mode: "cors", cache: "no-cache" })
        .then((r) => {
          if (!r.ok) throw new Error("No se pudo descargar la imagen");
          return r.blob();
        })
        .then((blob) => {
          if (cancelled) return;
          localObjectUrl = URL.createObjectURL(blob);
          objectUrlRef.current = localObjectUrl;
          loadFromUrl(localObjectUrl, true);
        })
        .catch(() => {
          if (cancelled) return;
          // Si falla el fetch, intentamos cargar la URL directa con crossOrigin
          loadFromUrl(src, false);
        });
    } else {
      loadFromUrl(src, false);
    }

    return () => {
      cancelled = true;
      if (localObjectUrl) {
        URL.revokeObjectURL(localObjectUrl);
        if (objectUrlRef.current === localObjectUrl) objectUrlRef.current = null;
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
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setScale((s) => Math.max(0.2, Math.min(5, s + delta)));
  };

  const handleConfirm = async () => {
    if (saving) return;
    if (!imgRef.current || !naturalSize.w) {
      toast.error(loadError ?? "Espera a que la imagen termine de cargar antes de aplicar.");
      return;
    }
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
      ctx.drawImage(
        imgRef.current,
        cx - finalDrawW / 2,
        cy - finalDrawH / 2,
        finalDrawW,
        finalDrawH,
      );

      let blob: Blob | null = null;
      try {
        blob = await new Promise<Blob | null>((resolve) => {
          try {
            canvas.toBlob((b) => resolve(b), "image/png", 0.95);
          } catch {
            resolve(null);
          }
        });
      } catch {
        blob = null;
      }
      if (!blob) {
        throw new Error(
          "No se pudo exportar la imagen ajustada. Vuelve a subir la imagen original e inténtalo de nuevo.",
        );
      }
      await onConfirm(blob);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "No se pudo aplicar el ajuste de imagen");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-card rounded-2xl p-4 md:p-6 max-w-md w-full shadow-elegant"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-navy-deep">Ajustar imagen</h3>
          <button type="button" onClick={onCancel} aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-3">
          Arrastra para mover, usa el control de zoom o la rueda del mouse para acercar.
        </p>

        <div
          ref={containerRef}
          className="relative mx-auto rounded-xl overflow-hidden border border-border touch-none select-none"
          style={{
            width: PREVIEW,
            height: PREVIEW,
            background: backgroundColor,
            cursor: dragging ? "grabbing" : "grab",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
        >
          {imgLoaded && naturalSize.w > 0 && (
            <img
              src={displaySrc}
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
              {loadError ? (
                <span className="px-6 text-center text-xs font-semibold text-destructive">
                  {loadError}
                </span>
              ) : (
                <Loader2 className="w-6 h-6 animate-spin text-ocean" />
              )}
            </div>
          )}
          {/* Marco guía */}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-ocean/30" />
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.2, s - 0.1))}
            className="p-2 rounded-lg bg-foam text-navy-deep"
            aria-label="Alejar"
          >
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
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(5, s + 0.1))}
            className="p-2 rounded-lg bg-foam text-navy-deep"
            aria-label="Acercar"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={reset}
            className="p-2 rounded-lg bg-foam text-navy-deep"
            aria-label="Restablecer"
            title="Restablecer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-border text-sm font-semibold"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving || !imgLoaded}
            onClick={handleConfirm}
            className="px-5 py-2 rounded-lg gradient-wave text-white text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}{" "}
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
