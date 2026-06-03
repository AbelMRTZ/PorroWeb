# La Revolución del Porro — Web Portal

Portal oficial del grupo. Construido con **React 18 + Vite**.

---

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- npm (incluido con Node.js)

Comprueba tu versión con:
```bash
node -v   # debe ser >= 18
npm -v
```

---

## Instalación y desarrollo local

```bash
# 1. Entra en el directorio del proyecto
cd PorroWeb

# 2. Instala las dependencias
npm install

# 3. Lanza el servidor de desarrollo
npm run dev
```

La web estará disponible en **http://localhost:3000**

El servidor de desarrollo tiene recarga automática: cualquier cambio en el código
se refleja instantáneamente en el navegador sin necesidad de reiniciar.

---

## Compilar para producción

```bash
npm run build
```

Genera la carpeta `dist/` con los archivos estáticos optimizados listos para servir.

Para probar el build de producción en local:
```bash
npm run preview
```

Disponible en **http://localhost:4173**

---

## Despliegue en el servidor (IP: 91.99.101.2)

### Opción A — Servidor de preview de Vite (sencillo)

```bash
# En el servidor
npm install
npm run build
npm run preview   # escucha en 0.0.0.0:4173
```

Accede desde fuera vía **http://91.99.101.2:4173**

Si quieres que arranque al iniciar el sistema, usa PM2:
```bash
npm install -g pm2
pm2 start "npm run preview" --name porro-web
pm2 save
pm2 startup
```

### Opción B — Nginx (recomendado para producción)

1. Compila el proyecto:
   ```bash
   npm run build
   ```

2. Copia `dist/` al servidor (por ejemplo a `/var/www/porro-web`).

3. Configura Nginx (`/etc/nginx/sites-available/porro-web`):
   ```nginx
   server {
       listen 80;
       server_name 91.99.101.2;
       root /var/www/porro-web;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```
   El bloque `try_files` es esencial para que el router de React funcione correctamente.

4. Activa el sitio y recarga Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/porro-web /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

Accede vía **http://91.99.101.2**

---

## Estructura del proyecto

```
PorroWeb/
├── index.html               # Punto de entrada HTML
├── package.json
├── vite.config.js           # Config de Vite (host/puerto)
│
└── src/
    ├── main.jsx             # Arranque de React
    ├── App.jsx              # Rutas principales
    ├── index.css            # Estilos globales y variables CSS
    │
    ├── components/
    │   ├── Navbar.jsx/css   # Barra de navegación (fija, responsive)
    │   ├── Footer.jsx/css   # Pie de página
    │   └── ComingSoon.jsx/css  # Componente "Próximamente" reutilizable
    │
    ├── pages/
    │   ├── Home.jsx/css         # Inicio con pestañas y widgets
    │   ├── Porrolimpiadas.jsx   # Próximamente
    │   ├── PremiosPorro.jsx/css # Premios con selector de año y estadísticas
    │   ├── Fantasy.jsx          # Próximamente
    │   └── Galeria.jsx/css      # Galería con lightbox
    │
    └── data/
        ├── premiosData.js   # Datos de los Premios Porro (4 ediciones)
        └── galeriaData.js   # Datos de la galería (5 viajes)
```

---

## Secciones de la web

| Ruta | Sección | Estado |
|------|---------|--------|
| `/` | Home | ✅ Activo |
| `/porrolimpiadas` | Porrolimpiadas | 🔜 Próximamente |
| `/premios-porro` | Premios Porro | ✅ Activo |
| `/fantasy` | Fantasy | 🔜 Próximamente |
| `/galeria/:viaje` | Galería | ✅ Activo |

---

## Cómo añadir contenido

### Añadir una categoría a los Premios Porro

Edita `src/data/premiosData.js` y añade un objeto a la lista `categorias` del año correspondiente:

```js
{ nombre: "Categoría 8", ganador: "Miembro 2", nominados: ["Miembro 1", "Miembro 2", "Miembro 4"] }
```

### Añadir un viaje a la Galería

Edita `src/data/galeriaData.js` y añade una entrada a `galeriaData`:

```js
{
  slug: "viaje-6",
  nombre: "Viaje 6",
  año: 2026,
  descripcion: "Descripción del viaje.",
  fotos: generatePhotos(12, 5),   // (número de fotos, índice para colores)
}
```

Para usar **fotos reales** en lugar de placeholders, sustituye el array `fotos` por:

```js
fotos: [
  { id: 1, alt: "Foto 1", src: "/fotos/viaje-6/foto1.jpg" },
  // ...
]
```

Y actualiza el componente `Galeria.jsx` para renderizar `<img src={foto.src} alt={foto.alt} />`
dentro de `.foto-thumb` en lugar del fondo degradado.

### Añadir una nueva sección al menú

1. Crea el componente en `src/pages/NuevaPagina.jsx`
2. Añade la ruta en `src/App.jsx`:
   ```jsx
   <Route path="/nueva-pagina" element={<NuevaPagina />} />
   ```
3. Añade el enlace en `src/components/Navbar.jsx` (array `navLinks`)

---

## Variables de entorno

No son necesarias por defecto. Si en el futuro se conecta a una API o base de datos,
crea un archivo `.env` en la raíz:

```
VITE_API_URL=http://91.99.101.2:3001
```

Las variables deben empezar por `VITE_` para ser accesibles desde React.

---

## Notas técnicas

- React Router v6 gestiona la navegación en cliente (SPA). El servidor debe redirigir
  todas las rutas a `index.html` (el bloque `try_files` de Nginx lo hace automáticamente).
- Las fuentes (Cinzel, Inter) se cargan desde Google Fonts. En entornos sin internet,
  descárgalas y sírvelas localmente desde `public/fonts/`.
- El servidor de desarrollo (`npm run dev`) escucha en `0.0.0.0:3000`, accesible
  desde la red local sin configuración adicional.
