# Contexto del Proyecto: MIB (Music Is Better)

## 1. Visión General
Este repositorio contiene el trabajo integrador final Full-Stack. Originalmente concebido como un "Clon de Slack", ha pivoteado a **MIB (Music Is Better)**: una red social/plataforma colaborativa orientada a músicos.
En esta plataforma, los músicos (Usuarios) pueden crear y unirse a Bandas/Proyectos de grabación (Projects), y dentro de ellos tener Muros/Canales de debate (Channels) y Publicaciones (Messages).

## 2. Estado del Backend (`/BACKEND`)
El backend cuenta con una arquitectura robusta, limpia y altamente desacoplada (`Routes -> Controllers -> Services -> Repositories`).
- **Completado:** 
  - CRUD de Usuarios y Autenticación completa (Registro, Login, Reseteo de contraseñas con JWT y Bcrypt).
  - Integración de `Nodemailer` para envíos de correo.
  - CRUD de Proyectos Musicales (`project.model.js`).
  - Lógica estricta de invitaciones: Se pueden invitar músicos a los proyectos mediante tokens JWT temporales enviados por correo.
  - Middlewares de seguridad (CORS, JWT validación, control de permisos dentro de un proyecto).
- **Pendiente:**
  - Crear el CRUD de "Muros/Canales" asociados a un Proyecto.
  - Crear el CRUD de "Publicaciones/Mensajes" asociados a un Canal.
  - Agregar "Verificación de Email de Cuenta" en el momento del registro (actualmente el registro crea la cuenta directamente).

## 3. Estado del Frontend (`/FRONTEND-1`)
El frontend (React) está siendo construido con patrones de diseño de nivel Senior.
- **Completado:**
  - Configuración de enrutamiento base.
  - **Patrón de Custom Hooks:** Implementación de `useRequest` (para aislar estados de loading/error de la API) y `useForm` (para capturar inputs).
  - **Contexto Global:** `AuthContext` leyendo el JWT desde el localStorage usando `jwt-decode`.
  - Pantalla de Login construida, con total desacoplamiento de la petición (usando `authService.js`) y redirección inteligente mediante `useEffect`.
- **Pendiente:**
  - Integrar el Registro con validaciones.
  - Consumir el CRUD de Proyectos Musicales (Listado, Creación, Detalles).

## 4. Próximos Pasos (Hoja de Ruta para la próxima sesión)
Para el agente de la próxima sesión en la MacBook:
1. Leer el archivo `INSTRUCCIONES_IA.md` para adoptar la misma personalidad pedagógica y rigurosa.
2. Iniciar la sesión preguntando al usuario si quiere enfocarse en terminar de conectar el Registro del Frontend, o si prefiere saltar al Backend para programar los Modelos/Rutas de los "Canales" y "Mensajes" de MIB.
