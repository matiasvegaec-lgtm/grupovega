import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    const KEY = "gv_sid";
    let sid = sessionStorage.getItem(KEY);
    if (!sid) {
      sid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(KEY, sid);
    }
    return sid;
  } catch {
    return `anon-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function detectDevice(ua: string): string {
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  return "desktop";
}

function detectBrowser(ua: string): string {
  if (/Edg\//i.test(ua)) return "Edge";
  if (/OPR\/|Opera/i.test(ua)) return "Opera";
  if (/Chrome\//i.test(ua) && !/Edg|OPR/i.test(ua)) return "Chrome";
  if (/Firefox\//i.test(ua)) return "Firefox";
  if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) return "Safari";
  return "Otro";
}

export function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const path = location.pathname;
    // No registrar visitas del panel administrativo ni de auth
    if (path.startsWith("/admin") || path.startsWith("/auth")) return;

    const ua = navigator.userAgent || "";
    const payload = {
      path,
      referrer: document.referrer ? document.referrer.slice(0, 500) : null,
      session_id: getOrCreateSessionId(),
      device: detectDevice(ua),
      browser: detectBrowser(ua),
      country: (navigator.language || "").split("-")[1] || null,
      user_agent: ua.slice(0, 500),
    };

    // Fire-and-forget; no awaiting render
    supabase
      .from("page_views")
      .insert(payload)
      .then(() => {})
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .then(undefined, () => {});
  }, [location.pathname]);

  return null;
}