# Despliegue en Vercel (modo SPA estática)

Este proyecto está construido con TanStack Start, pero para Vercel se publica
como **SPA estática** (sin SSR ni server functions de TanStack).

## 1. Conectar el repo de GitHub a Vercel

1. Entra a https://vercel.com/new
2. Importa el repositorio de GitHub donde está sincronizado este proyecto.
3. Cuando Vercel pregunte el framework, deja **"Other"** (lee la config de `vercel.json`).
4. **NO** modifiques los campos Build/Output. Ya están definidos en `vercel.json`:
   - Build Command: `vite build`
   - Output Directory: `dist/client`

## 2. Variables de entorno en Vercel

En **Project Settings → Environment Variables** agrega estas
(márcalas para Production, Preview y Development):

| Nombre                          | Valor                                                                |
|---------------------------------|----------------------------------------------------------------------|
| `VITE_SUPABASE_URL`             | `https://rlqnbzwrecjzppatqfil.supabase.co`                           |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | (la encuentras en el archivo `.env` del proyecto, empieza con `eyJ`) |
| `VITE_SUPABASE_PROJECT_ID`      | `rlqnbzwrecjzppatqfil`                                               |

> ⚠️ **NO agregues** `SUPABASE_SERVICE_ROLE_KEY` ni secretos en Vercel.
> En modo SPA estática no hay backend en Vercel; esas claves viven solo en
> Lovable Cloud, donde corren los edge functions.

## 3. Deploy

Vercel hace deploy automático en cada push a `main`. Primer build: 2-3 min.

## 4. Limitaciones de la SPA estática (lo que NO funcionará en Vercel)

- ❌ `/sitemap.xml` dinámico
- ❌ `/api/public/image-proxy`
- ❌ SSR / meta tags por ruta en el HTML inicial (se inyectan en cliente)
- ✅ Login, carrito, admin, productos, checkout, favoritos → todo funciona

## 5. Si te sale 404 en refresh

Verifica que `vercel.json` esté en la raíz del repo y que Vercel lo lea
(en el log del deploy aparece "Detected vercel.json"). El rewrite a
`/index.html` es lo que evita el 404 en TanStack Router del lado cliente.

## 6. Edge Functions de Supabase

Siguen funcionando porque están desplegadas en Lovable Cloud (Supabase),
no en Vercel. El frontend en Vercel las llama vía el cliente Supabase
normalmente.
