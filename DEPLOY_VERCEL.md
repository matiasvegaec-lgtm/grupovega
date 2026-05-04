# Desplegar en Vercel (SPA estática)

Este proyecto está listo para desplegarse en Vercel como SPA estática.

## Pasos

1. Sube el repo a GitHub.
2. En Vercel → **Add New Project** → importa el repo.
3. **Framework Preset**: `Other`.
4. **Build Command**: `vite build` (ya está en `vercel.json`).
5. **Output Directory**: `dist/client` (ya está en `vercel.json`).
6. **Environment Variables** (Settings → Environment Variables):
   - `VITE_SUPABASE_URL` = `https://rlqnbzwrecjzppatqfil.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = (copia el valor de `.env`)
   - `VITE_SUPABASE_PROJECT_ID` = `rlqnbzwrecjzppatqfil`
7. Deploy.

## Cómo se evita el 404

- `vercel.json` reescribe cualquier ruta que no sea un archivo a `/index.html`,
  para que el router del cliente (TanStack Router) maneje la URL.
- `public/_redirects` hace lo mismo como respaldo (Netlify / otros).

## Limitaciones de este modo

Al ser SPA estática **no funcionan** en Vercel:
- `/sitemap.xml` dinámico (devolverá 404 — usar uno estático si lo necesitas).
- `/api/public/image-proxy` (endpoint de servidor).
- SSR / metadatos dinámicos por ruta para SEO en el primer render.

El backend (Supabase / Lovable Cloud) sigue funcionando porque las llamadas
se hacen desde el navegador con la clave pública.