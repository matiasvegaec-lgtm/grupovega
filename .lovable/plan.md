Voy a corregir el editor de reajuste de imagen para que el botón **Aplicar** funcione de forma confiable y no se quede bloqueado.

Cambios propuestos:

1. **Separar el arrastre de la imagen de los botones**
   - El contenedor del modal actualmente puede interferir con los clics después de mover/reajustar la imagen.
   - Haré que el arrastre solo se active dentro del cuadro de previsualización de la imagen, y que al soltar el mouse/touch se cierre correctamente el estado de arrastre.

2. **Evitar que “Aplicar” dependa de una carga frágil de la imagen**
   - Ajustaré la carga de la imagen para que no quede en un estado donde se ve la imagen pero internamente el botón no puede exportarla.
   - Si la imagen viene de una URL pública, se intentará cargar de forma segura para poder convertirla en PNG sin fallar.

3. **Mejorar el botón Aplicar**
   - El botón no se deshabilitará de forma innecesaria mientras la imagen ya esté visible y lista.
   - Si hay un problema real, mostrará un mensaje claro en pantalla en vez de parecer que no hace nada.
   - Mantendré el indicador de carga mientras sube la imagen ajustada.

4. **Actualizar el flujo en productos**
   - Después de aplicar el reajuste, se subirá la nueva imagen y se actualizará el campo de imagen del producto.
   - El modal se cerrará solo cuando la imagen ajustada se haya guardado correctamente.

Archivos a modificar:

- `src/components/ImageAdjuster.tsx`
- `src/routes/admin.productos.tsx` si hace falta reforzar el guardado desde el formulario de productos.

Resultado esperado:

- Puedes mover o hacer zoom a la imagen.
- Luego puedes presionar **Aplicar** sin que el botón falle.
- Si algo impide guardar, verás un aviso claro.
- **Cancelar** seguirá funcionando igual.