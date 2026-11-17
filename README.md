# Narcizo's Coffee-Bar · Carta digital

Menú web responsive, sin frameworks ni proceso de build. Los productos de respaldo están en `data/menu.csv`; al publicar una planilla, la carta intenta leer su CSV y vuelve a ese archivo local si la carga falla.

## Publicar y conectar Google Sheets

1. Abrí una Google Sheet nueva y copiá en la primera fila estos encabezados, en este orden: `categoria,nombre,descripcion,precio,mas_pedido,disponible,orden`.
2. Pegá los productos de `data/menu.csv` en la planilla. Conservá los nombres de categoría para que se agrupen correctamente. Usá precios numéricos (por ejemplo, `4000`), `SI` o `NO` para `mas_pedido` y `disponible`, y un número en `orden`.
3. En Sheets, elegí **Archivo → Compartir → Publicar en la web**. Seleccioná la hoja y **Valores separados por comas (.csv)**, y publicala.
4. Copiá la URL CSV publicada. En `app.js`, pegala en `SHEET_CSV_URL`. La URL es pública: no uses una planilla con datos privados.
5. Para configurar WhatsApp, reemplazá `WHATSAPP_NUMBER` en `app.js` por el número del local con código de país y área, sin `+`, espacios ni guiones. Por ejemplo, `549358XXXXXXXX` es solo un formato de referencia.
6. La carta oculta automáticamente filas con `disponible` igual a `NO`. Para actualizar los productos, editá la planilla y mantené los encabezados.

Si todavía no configuraste una planilla, la web usa directamente `data/menu.csv`. Si la URL publicada falla, usa ese mismo respaldo.

## Desplegar

La carpeta es estática; no necesita instalar dependencias ni ejecutar un build.

### Vercel

1. Subí los archivos a un repositorio Git o importá el proyecto desde la carpeta.
2. En Vercel, creá un proyecto nuevo e indicá la carpeta raíz.
3. Dejá vacío el comando de build. Usá la carpeta raíz como directorio de salida.
4. Publicá. El archivo `index.html` se sirve como página principal.

### Netlify

1. Arrastrá la carpeta del proyecto a Netlify o conectá el repositorio.
2. Dejá vacío el comando de build y establecé `.` como directorio de publicación.
3. Publicá el sitio.

## Generar el QR

1. Publicá la web y copiá la URL pública final.
2. Generá un código QR de tipo **URL** con esa dirección en el generador de QR que prefieras.
3. Descargalo en SVG o PNG, probalo con un teléfono y colocá el código en la mesa, vidriera o carta impresa.

## Datos del PDF para revisar con el dueño

- **Mocha frío: $4.000.** Se conservó el importe que aparece en el PDF, aunque es menor que el Mocha caliente ($7.000).

## Notas de edición

- Los nombres y descripciones se normalizaron para corregir tildes y errores tipográficos evidentes del PDF, sin agregar productos.
- Instagram y la dirección se tomaron de la carta: [@Narcizos_coffebar](https://www.instagram.com/Narcizos_coffebar/) · San Martín y 9 de Julio, Río Cuarto.
