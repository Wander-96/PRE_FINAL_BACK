# Guía Definitiva: Replicación del Backend (Clase 20)

Esta guía te llevará paso a paso desde un proyecto vacío hasta tener tu propia Arquitectura en Capas (Patrón Repositorio) utilizando Node.js, Express y MongoDB, basándonos estrictamente en la metodología de la clase 20.

---

## Fase 1: Inicialización y Dependencias

### Pseudocódigo (Lo que queremos lograr)
1. Iniciar un proyecto de Node vacío.
2. Instalar las herramientas necesarias (servidor, base de datos, seguridad, correos, etc).
3. Configurar el proyecto para usar la sintaxis moderna de JS (ES Modules) y preparar comandos rápidos.

### Paso a paso en Terminal
1. Inicializamos el proyecto:
```bash
npm init -y
```

2. Instalamos todas las dependencias juntas:
```bash
npm install express mongoose jsonwebtoken bcrypt cors dotenv nodemailer
```
* **Por qué elegimos esto:** `express` es nuestro servidor web, `mongoose` para interactuar con MongoDB, `jsonwebtoken` para sesiones, `bcrypt` para encriptar contraseñas, `cors` para permitir llamadas desde el frontend, `dotenv` para variables de entorno y `nodemailer` para envío de emails.

3. Editamos nuestro `package.json`:
```json
{
  "name": "repaso",
  "version": "1.0.0",
  "main": "./src/main.js",
  "type": "module", 
  "scripts": {
    "start": "node ./src/main.js",
    "dev": "node --watch ./src/main.js"
  },
  "dependencies": { ... }
}
```
* **Por qué elegimos esto:** Agregar `"type": "module"` nos permite usar `import/export` en lugar del antiguo `require()`.

---

## Fase 2: Configuración Inicial (Variables de Entorno y Conexión)

### Pseudocódigo
1. Crear un archivo para ocultar contraseñas y configuraciones sensibles.
2. Crear un archivo de configuración en JS que lea esas variables y las exporte de forma limpia.
3. Crear un archivo que se conecte a la base de datos de MongoDB utilizando la conexión secreta.

### Archivo: `.env` (En la raíz del proyecto)
```env
PORT=3000
MODE=development
MONGO_DB_CONNECTION_STRING=mongodb://localhost:27017
MONGO_DB_NAME=repaso_db
JWT_SECRET=supersecret123
```

### Archivo: `src/config/environment.config.js`
```javascript
import dotenv from 'dotenv'

// Carga las variables del archivo .env a la memoria del sistema (process.env)
dotenv.config()

// Agrupamos las variables en un objeto para importarlas fácilmente en todo el proyecto
const ENVIRONMENT = {
    MONGO_DB_CONNECTION_STRING: process.env.MONGO_DB_CONNECTION_STRING,
    MONGO_DB_NAME: process.env.MONGO_DB_NAME,
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET
}

export default ENVIRONMENT
```

### Archivo: `src/config/mongodb.config.js`
```javascript
import mongoose from "mongoose";
import ENVIRONMENT from "./environment.config.js";

// Función asíncrona para conectarnos a la BD
const connectMongoDB = async () => {
    try {
        // Conectamos indicando la URI y el nombre de la BD
        const response = await mongoose.connect(ENVIRONMENT.MONGO_DB_CONNECTION_STRING, {
            dbName: ENVIRONMENT.MONGO_DB_NAME
        });
        console.log('La conexion con MongoDB funciona');
    } catch (error) {
        console.error('Error de conexion a MONGODB', error);
    }
}

export default connectMongoDB;
```
* **Por qué elegimos esto:** Separar la configuración en la capa `config` nos permite cambiar de base de datos o entorno sin tocar la lógica principal de la aplicación.

---

## Fase 3: Capa de Datos (Modelos)

### Pseudocódigo
1. Crear un esquema ("molde") de cómo debe lucir un Usuario en la base de datos.
2. Definir campos obligatorios, contraseñas y otros datos.

### Archivo: `src/models/user.model.js`
```javascript
import mongoose from "mongoose";

// Definimos las reglas que debe cumplir un documento "Usuario"
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verificationToken: { type: String },
    isVerified: { type: Boolean, default: false }
}, { 
    timestamps: true // Esto agrega createdAt y updatedAt automáticamente
});

// Creamos el modelo a partir del esquema y lo exportamos
const User = mongoose.model("User", userSchema);
export default User;
```

---

## Fase 4: Capa de Acceso a Datos (Repositorios)

### Pseudocódigo
1. Evitar que nuestra lógica de negocio escriba directamente en MongoDB.
2. Crear una clase que sirva como "puente" y tenga métodos específicos (ej. buscarPorEmail, crearUsuario).

### Archivo: `src/repositories/user.repository.js`
```javascript
import User from "../models/user.model.js";

class UserRepository {
    // Busca un usuario dado un email
    async findByEmail(email) {
        return await User.findOne({ email });
    }

    // Crea y guarda un usuario en la BD
    async create(userData) {
        const newUser = new User(userData);
        return await newUser.save();
    }
    
    // Busca un usuario por ID
    async findById(id) {
        return await User.findById(id);
    }
}

// Exportamos una instancia única (Singleton) para reutilizarla
export default new UserRepository();
```
* **Por qué elegimos esto:** El "Patrón Repositorio" asegura que si mañana cambiamos MongoDB por otra cosa (ej. PostgreSQL), solo debemos modificar este archivo. El resto de nuestra app no se da cuenta.

---

## Fase 5: Capa de Lógica de Negocio (Controladores)

### Pseudocódigo
1. Recibir la solicitud HTTP (req, res).
2. Validar que vengan todos los campos necesarios.
3. Pedirle al Repositorio que guarde o busque datos.
4. Enviar una respuesta (JSON) al cliente.

### Archivo: `src/controllers/auth.controller.js`
```javascript
import userRepository from "../repositories/user.repository.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ENVIRONMENT from "../config/environment.config.js";

class AuthController {
    // Maneja el proceso de Login
    async login(req, res) {
        try {
            const { email, password } = req.body;
            
            // 1. Delegar búsqueda al repositorio
            const user = await userRepository.findByEmail(email);
            if (!user) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }

            // 2. Validar la contraseña (lógica pura)
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Contraseña incorrecta" });
            }

            // 3. Generar token
            const token = jwt.sign(
                { id: user._id, email: user.email },
                ENVIRONMENT.JWT_SECRET,
                { expiresIn: "1h" }
            );

            // 4. Responder
            res.status(200).json({ message: "Login exitoso", token });
        } catch (error) {
            res.status(500).json({ message: "Error en el servidor", error: error.message });
        }
    }
}

export default new AuthController();
```
* **Por qué elegimos esto:** El controlador se concentra únicamente en reglas de negocio (bcrypt, validaciones) y HTTP (status 404, 200). Nunca hace `User.findOne(...)` directamente.

---

## Fase 6: Rutas y Middlewares

### Pseudocódigo
1. Crear un enrutador que reciba tráfico en ciertos "Endpoints" y los derive a nuestro Controlador.
2. Proteger las rutas que lo requieran para asegurar que el usuario haya iniciado sesión.

### Archivo: `src/routes/auth.router.js`
```javascript
import { Router } from "express";
import authController from "../controllers/auth.controller.js";

const authRouter = Router();

// Cuando llega un POST a /login, ejecuta el método login del controlador
authRouter.post('/login', authController.login);
// (Aquí iría también authRouter.post('/register', authController.register))

export default authRouter;
```

---

## Fase 7: El Punto de Entrada (Main)

### Pseudocódigo
1. Importar Express y nuestra configuración de BD.
2. Inyectar Cors para seguridad y JSON parser.
3. Enganchar los Enrutadores.
4. Escuchar peticiones en el puerto.

### Archivo: `src/main.js`
```javascript
import ENVIRONMENT from "./config/environment.config.js";
import connectMongoDB from "./config/mongodb.config.js";
import express from "express";
import cors from 'cors';
import authRouter from "./routes/auth.router.js";

// Inicializamos la conexión a DB
connectMongoDB();

const app = express();
const PORT = ENVIRONMENT.PORT;

// Habilitamos CORS y lectura de cuerpos JSON
app.use(cors());
app.use(express.json());

// Inyectamos nuestros módulos a la API principal
app.use('/api/auth', authRouter);
// app.use('/api/workspace', workspaceRouter);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
```

### Por qué esta estructura es superior:
Si observas bien, el flujo siempre es **Ruta -> Controlador -> Repositorio -> Modelo**. Esta arquitectura nos permite encontrar errores fácil, reutilizar código e independizar nuestras herramientas (por ejemplo, poder probar un controlador sin tener la DB prendida).
