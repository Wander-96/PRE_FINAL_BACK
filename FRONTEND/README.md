# MIB (Music Is Better) - Frontend 🎸

Bienvenido al repositorio Frontend de **MIB**, una red social diseñada exclusivamente para músicos, productores y profesionales de la industria musical.

## 🌐 Despliegue en Vivo
- **URL de la Web (Frontend):** https://mib-lemon.vercel.app/
- **URL de la API (Backend):** https://mib-backend-w7ti.onrender.com

## 🛠️ Tecnologías Utilizadas
- **React.js** (Vite)
- **CSS3** Puro (con diseño Responsive y Glassmorphism)
- **Context API** para el manejo de estado global
- **Socket.io-client** para mensajería en tiempo real
- **React Router Dom** para la navegación

## 🚀 Instalación Local

1. Clona este repositorio.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` en la raíz de la carpeta `FRONTEND` y configura tu variable de entorno:
   ```env
   VITE_API_URL=http://localhost:3000
   ```
4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 🌟 Características Principales
- **Autenticación completa:** Registro, Login y persistencia de sesión mediante JWT.
- **Feed de Publicaciones:** Muro interactivo donde se pueden crear posts (texto e imágenes) y dar "Likes" en tiempo real.
- **Buscador Global:** Motor de búsqueda inteligente para encontrar músicos por nombre, instrumento o contenido de publicación.
- **Sistema de Conexiones:** Solicitudes de conexión (estilo LinkedIn) para crear tu red de contactos.
- **Perfil Personalizable:** Avatares y fotos de portada integrados con Cloudinary.

## 🚧 En Construcción / Próximamente
Actualmente la aplicación se encuentra en desarrollo activo. Las siguientes características **aún no están implementadas**:
- **Mensajería en Tiempo Real:** La interfaz de chat flotante está diseñada, pero los WebSockets (Socket.io) para mensajería instantánea están en proceso de integración.
- **Espacio "Proyectos":** La sección dedicada a la gestión de bandas y proyectos musicales se encuentra en construcción.
- **Autenticación Social:** El inicio de sesión con cuentas de Google y Apple estará disponible en futuras versiones.

## 📱 Diseño Responsivo
La aplicación ha sido rigurosamente diseñada para adaptarse de forma fluida a dispositivos desde 320px (móviles pequeños) hasta 2000px (pantallas ultra-anchas).
