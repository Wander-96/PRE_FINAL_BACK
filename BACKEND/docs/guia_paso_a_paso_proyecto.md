# 📖 Guía Paso a Paso: Construcción del Proyecto Full Stack

Esta guía documenta el proceso completo de creación de nuestro clon de Slack, desde la inicialización hasta la funcionalidad de recuperación de contraseñas, cubriendo cada decisión de código.

## 1. Inicialización del Proyecto (Backend y Frontend)
El proyecto se dividió en dos carpetas principales para mantener una arquitectura limpia: `BACKEND` y `FRONTEND`.

- **Backend**: Se inicializó un proyecto Node.js (`npm init -y`). Se instalaron dependencias clave como `express` (para el servidor HTTP), `mongoose` (para la base de datos MongoDB), `jsonwebtoken` (para autenticación), `bcrypt` (seguridad de contraseñas), `cors` (para permitir la comunicación con el frontend) y `nodemailer` (para enviar correos electrónicos).
- **Frontend**: Se inicializó usando **Vite** con React (`npm create vite@latest`). Se instaló `react-router` para manejar el enrutamiento de las distintas pantallas (Home, Login, Register).

## 2. Configuración del Servidor (Backend)
- **`.env`**: Archivo crítico donde guardamos secretos (URL de MongoDB, JWT Secret, credenciales de Gmail, puerto). **Decisión:** Nunca se sube a GitHub para evitar robo de credenciales.
- **`src/main.js`**: El corazón o "Restaurante". Configura Express, habilita CORS, permite que el servidor entienda JSON (`express.json()`), y monta los enrutadores principales (`/api/auth` y `/api/workspace`).

## 3. Arquitectura de Capas (Backend)
Implementamos el **Patrón de Repositorio (Repository Pattern)** y una variante de **MVC**.

- **Modelos (`src/models`)**: Definimos los esquemas de Mongoose (`user.model.js`, `workspace.model.js`). Representan la estructura exacta de las colecciones en la base de datos.
- **Repositorios (`src/repositories`)**: Es la única capa autorizada para interactuar directamente con la Base de Datos. Aísla toda la lógica de Mongoose del resto de la aplicación.
- **Controladores (`src/controllers`)**: Los "Chefs". Reciben la petición del cliente, aplican lógica de negocio pura (validar formatos, verificar correos, hashear contraseñas) y delegan el guardado o búsqueda a los Repositorios. 
- **Rutas (`src/routes`)**: Los "Meseros". Reciben las peticiones HTTP (GET, POST, PUT, DELETE) en URLs específicas y las dirigen al Controlador adecuado.

## 4. Funcionalidad de Espacios de Trabajo (Workspaces)
- Desarrollamos el CRUD básico (Crear, Obtener, Actualizar, Borrar).
- **Middlewares Mutantes**: Creamos `workspaceMiddleware` que actúa como "Guardia de Seguridad Inteligente". Recibe por parámetro qué roles están permitidos (ej. `[OWNER, ADMIN]`). Este middleware busca en la base de datos los permisos del usuario *antes* de dejarlo llegar al Controlador. **Decisión:** Esto limpia los controladores y centraliza la seguridad.

## 5. El Flujo de Recuperación de Contraseña
Este fue el hito de seguridad más importante, dividido entre el Backend y el Frontend.

### Backend (Paso 1: Solicitud del Reseteo)
- Ruta: `POST /api/auth/reset-password-request`.
- Se busca al usuario. **Decisión Senior:** Si el usuario no existe, devolvemos un éxito genérico ("Si existe, te llegará un correo") para evitar "Ataques de Enumeración" por parte de hackers.
- Se genera un **JWT Dinámico** firmándolo con el `JWT_SECRET` global + el hash de la contraseña *actual* del usuario.
- Se envía el enlace por email usando `nodemailer`.

### Backend (Paso 2: Cambio de Contraseña)
- Ruta: `PUT /api/auth/reset-password`.
- **Decisión:** Se usa `jwt.decode` sin verificar primero la firma, solo para saber a quién le pertenece el token.
- Se busca al usuario en la BD, se reconstruye el "Secreto Dinámico" y se verifica la firma (`jwt.verify`). 
- **Decisión:** Como la firma requiere la contraseña actual, apenas la contraseña se actualiza, la firma queda inválida. Esto crea matemáticamente un token de un solo uso sin necesidad de guardar nada en la BD.
- Se hashea la nueva contraseña (`bcrypt.hash(password, 12)`) y se guarda.

### Frontend (Conexión y UI)
- **Servicios (`src/services/authService.js`)**: **Decisión:** Centralizamos todas las llamadas a la API (`fetch`) fuera de los componentes visuales.
- **Custom Hooks (`useForm`)**: Reutilizamos la lógica del manejo del estado de los formularios para escribir menos código.
- **`ForgotPasswordScreen.jsx`**: Formulario que solicita el correo electrónico.
- **`ResetPasswordScreen.jsx`**: Usa el hook `useSearchParams` de React Router para "atrapar" automáticamente el parámetro `?token=` de la URL generada por el correo. Una vez reseteado con éxito, se redirige al usuario (`useNavigate`) al Login.
