import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Devuelve la URL de fondo del hero para una página dada.
 * Si no hay registro activo en `page_heroes`, retorna `fallback`.
 */
export function usePageHero(pageKey: string, fallback?: string): string | undefined {
  const [url, setUrl] = useState<string | undefined>(fallback);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("page_heroes")
      .select("image_url, active")
      .eq("page_key", pageKey)
      .eq("active", true)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.image_url) setUrl(data.image_url);
      });
    return () => { cancelled = true; };
  }, [pageKey]);

  return url;
}