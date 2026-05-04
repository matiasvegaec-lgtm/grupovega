import { createFileRoute } from "@tanstack/react-router";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const isBlockedHostname = (hostname: string) => {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return true;
  if (["::1", "0.0.0.0"].includes(host)) return true;

  const parts = host.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return false;

  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
};

export const Route = createFileRoute("/api/public/image-proxy")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const rawUrl = new URL(request.url).searchParams.get("url");
        if (!rawUrl) return new Response("Missing url", { status: 400 });

        let imageUrl: URL;
        try {
          imageUrl = new URL(rawUrl);
        } catch {
          return new Response("Invalid url", { status: 400 });
        }

        if (
          !["http:", "https:"].includes(imageUrl.protocol) ||
          isBlockedHostname(imageUrl.hostname)
        ) {
          return new Response("Unsupported image url", { status: 400 });
        }

        const imageResponse = await fetch(imageUrl, { headers: { accept: "image/*" } });
        if (!imageResponse.ok) return new Response("Image unavailable", { status: 502 });

        const contentType = imageResponse.headers.get("content-type") ?? "";
        if (!contentType.startsWith("image/")) return new Response("Not an image", { status: 415 });

        const contentLength = Number(imageResponse.headers.get("content-length") ?? 0);
        if (contentLength > MAX_IMAGE_BYTES)
          return new Response("Image too large", { status: 413 });

        const body = await imageResponse.arrayBuffer();
        if (body.byteLength > MAX_IMAGE_BYTES)
          return new Response("Image too large", { status: 413 });

        return new Response(body, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=3600",
            "Content-Type": contentType,
          },
        });
      },
    },
  },
});
