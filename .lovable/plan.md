## Objetivo

Añadir en el formulario de edición de productos (sección **Imagen**) un nuevo botón **Quitar fondo** que use la IA para eliminar el fondo de la imagen actual. Antes de procesar, se preguntará si el resultado debe quedar:

1. **Transparente** (PNG con alfa)
2. **Fondo blanco sólido** (sin cuadrícula gris al previsualizar)

Y además se cambiará la previsualización para que las imágenes transparentes ya no muestren la típica cuadrícula gris, sino un fondo blanco limpio.

## Cambios

### 1. `src/routes/admin.productos.tsx`
- Junto a "Subir imagen" y "Reajustar actual", añadir un tercer botón **Quitar fondo** (icono `Eraser` o `Wand2`), visible solo si ya existe `form.image_url`.
- Al pulsarlo, abrir un mini diálogo con dos opciones: **Transparente** y **Fondo blanco**.
- Tras elegir:
  1. Descargar la imagen actual (vía `/api/public/image-proxy` para evitar CORS).
  2. Convertir a base64 e invocar la edge function `process-product-image` con un nuevo parámetro `background: "transparent" | "white"`.
  3. Subir el PNG resultante al bucket `product-images` y actualizar `form.image_url` (y la fila del producto si está en edición), igual que ya hace el flujo de `ImageAdjuster`.
- Mostrar toasts de progreso / éxito / error reutilizando el patrón existente.
- Cambiar el contenedor de la miniatura (`form.image_url` preview en la línea 471) para que tenga `bg-white` en lugar del fondo por defecto, de modo que un PNG transparente no muestre cuadrícula.

### 2. `supabase/functions/process-product-image/index.ts`
- Aceptar un parámetro opcional `background` (`"transparent"` por defecto, o `"white"`).
- Cuando sea `"white"`, cambiar el prompt para pedir a Gemini un fondo **blanco sólido** en vez de transparente, manteniendo el producto centrado en cuadrado 1:1.
- Cuando sea `"transparent"`, conservar el prompt actual de fondo transparente.
- No cambia la autenticación ni el formato de respuesta (`imageDataUrl`).

### 3. `src/components/ImageAdjuster.tsx` (ajuste menor)
- Permitir que el `backgroundColor` del lienzo de previsualización pueda ser `"transparent"`. Cuando lo sea, exportar el PNG sin rellenar el fondo, para mantener la transparencia al reajustar una imagen ya sin fondo.
- Esto evita que al "Reajustar actual" sobre una imagen transparente se le vuelva a pintar blanco encima.

## Resultado esperado

- En el modal de edición de producto aparece el botón **Quitar fondo** con dos opciones (transparente o blanco).
- La miniatura de la imagen del producto se ve sobre fondo blanco, sin la cuadrícula gris de transparencia.
- El flujo de subir, reajustar y guardar productos sigue funcionando igual.
