// Edge function: process-product-image
// Recibe una imagen base64 y devuelve la versión con fondo blanco limpio,
// producto centrado en formato cuadrado, lista para el catálogo.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ---- AuthN/AuthZ: only staff (admin/employee) can call this ----
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : "";
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isStaff, error: roleErr } = await supabase.rpc("is_staff", {
      _user_id: userData.user.id,
    });
    if (roleErr || !isStaff) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { imageBase64, mimeType, background } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "imageBase64 requerido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY no configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const dataUrl = `data:${mimeType ?? "image/png"};base64,${imageBase64}`;

    const bgMode: "transparent" | "white" = background === "white" ? "white" : "transparent";
    const promptText =
      bgMode === "white"
        ? "Remove the original background completely and replace it with a perfectly SOLID PURE WHITE background (#FFFFFF, no gradient, no shadow on the background, no texture). Keep ONLY the product, perfectly cut out with clean smooth edges (no halo or fringe). Center the product in a square 1:1 composition with about 8% padding on all sides. Preserve the product intact, sharp and well lit. Do not add any text, logos, decorations, watermarks, borders or extra objects. Output a PNG with a solid white background and only the product visible."
        : "Remove the background completely so the result has a fully TRANSPARENT background (alpha channel, no white, no color, no checkerboard). Keep ONLY the product, perfectly cut out with clean smooth edges (no white halo or fringe). Center the product in a square 1:1 composition with about 8% padding on all sides. Preserve the product intact, sharp and well lit, including its natural soft shadow if any. Do not add any text, logos, decorations, watermarks, borders or extra objects. Output a transparent PNG with only the product visible.";

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: promptText,
              },
              {
                type: "image_url",
                image_url: { url: dataUrl },
              },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de uso alcanzado, intenta en unos minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Sin créditos de IA disponibles." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: `IA falló: ${errText}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResponse.json();
    const editedUrl: string | undefined = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!editedUrl) {
      return new Response(JSON.stringify({ error: "La IA no devolvió una imagen procesada." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ imageDataUrl: editedUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
