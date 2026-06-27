# 📋 Reporte de Sesión - Agente Anterior (Windows)

¡Hola, colega agente! Si estás leyendo esto, es porque el usuario se ha trasladado a su entorno en Mac y tú continuarás con el desarrollo de **MIB (Red Social)**.

## 🎯 Lo que abordamos y completamos en la sesión anterior:
1. **Despliegue a Producción:** Dejamos la aplicación 100% funcional y conectada. El Frontend está en **Vercel** (`https://mib-lemon.vercel.app`) y el Backend en **Railway** (`https://prefinalback-production.up.railway.app`). Configurada la validación de CORS en el Backend para permitir solicitudes de Vercel de forma segura.
2. **Sistema de Enrutamiento (React Router v7):** Creamos el archivo `vercel.json` con una regla de "rewrites" para manejar correctamente las rutas SPA y evitar errores 404 al refrescar las pantallas.
3. **Flujo de Recuperación de Contraseña:** 
   - Se crearon los endpoints correspondientes en `auth.controller.js` (Backend).
   - Se conectó `authService.js` (Frontend).
   - Se diseñaron e implementaron dos nuevas interfaces gráficas reutilizando estilos del Login: `ForgotPasswordScreen.jsx` y `ResetPasswordScreen.jsx`. 
4. **Refinamiento de UX/UI Visual:** 
   - Se reparó un *bug* visual en el botón flotante de cambiar foto de perfil en `ProfileScreen.css` (el botón se recortaba por el `overflow: hidden` del contenedor del avatar; lo corregimos aplicando el border-radius directo al `img`).
   - Se actualizó el feed (`PostCard.jsx`) para mostrar la foto de perfil real del usuario que crea el post o comenta.
   - El widget de crear publicación (`CreatePostWidget.jsx`) ahora muestra dinámicamente la foto de perfil del usuario logueado en lugar de un círculo predeterminado.
   - **IMPORTANTE:** Se añadió navegación directa (`Link`) en las fotos de perfil y nombres de usuario de todos los posts y comentarios para que, al darles clic, dirijan directamente a `/profile/:userId`.

## ⚠️ Dificultades, Contratiempos y Consideraciones Importantes:
1. **Versiones de Librerías:** 
   - El proyecto utiliza **React Router v7**. Es vital importar hooks como `Link`, `useNavigate` o `useSearchParams` directamente de `'react-router'`, NO de `'react-router-dom'`, ya que la v7 unificó el paquete y causará errores de construcción (Rolldown error) al intentar compilar en Vercel si usas `react-router-dom`.
2. **Errores de Sintaxis Inesperados (Fantasmas):**
   - Tuvimos un error momentáneo durante el desarrollo debido a la recarga en caliente (Vite HMR). Si Vite falla repentinamente alegando un token inesperado (`catch`, `}`), verifica si estás a la mitad de una refactorización de bloques `try/catch`. 
3. **Manejo de Rutas de Imágenes Local vs Cloudinary:**
   - La lógica para mostrar un avatar evalúa si es una ruta absoluta (`startsWith('http')`) de Cloudinary o una ruta relativa local que requiere prependar `ENVIRONMENT.URL_API`. 
   - Ten cuidado siempre con el renderizado condicional de los avatares. Revisa `PostCard.jsx` o `CreatePostWidget.jsx` para copiar la forma correcta y robusta de validarlos y proporcionar un avatar por defecto usando la API `ui-avatars.com` si la imagen falla o no existe.

## 🚀 Siguientes Pasos (Próximo Sprint):
1. **Mensajes Privados (WebSockets):** Es prioridad configurar e integrar `Socket.io`.
2. **Notificaciones Push/Internas:** Para comentarios y likes.
3. **Terceros (Opcional):** Autenticación con Google y Apple.

¡Mucho éxito con el código desde el entorno Mac! El usuario tiene un gran proyecto entre manos.
