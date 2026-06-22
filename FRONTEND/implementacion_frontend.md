# Implementación Frontend: Lista de Espacios de Trabajo (Workspaces)

Este documento detalla el diseño, "shaping" (estructura de datos) y requerimientos para implementar la funcionalidad de obtener y mostrar la lista de espacios de trabajo asociados a un usuario en el frontend.

## 1. Objetivo
Permitir que un usuario autenticado pueda visualizar todos los espacios de trabajo (workspaces) a los que pertenece, ya sea como creador propietario (`OWNER`), administrador (`ADMIN`) o miembro regular (`MEMBER`).

## 2. API Endpoint a Consumir
Según la definición del backend actual, el endpoint correspondiente es:

- **Método:** `GET`
- **Ruta:** `/api/workspace/`
- **Autenticación:** Requerida. Se debe enviar el token JWT en los headers de la petición (generalmente `Authorization: Bearer <token>`).

## 3. Shaping (Estructura de Datos)

### Petición (Request)
No requiere parámetros de búsqueda (query) ni cuerpo (`body`). Solo requiere los headers de autenticación para que el backend identifique al usuario de forma segura.

### Respuesta Esperada (Response)
El frontend debe esperar un arreglo de objetos donde cada elemento representa un espacio de trabajo.

```typescript
// Interface de referencia del modelo Workspace
interface Workspace {
  _id: string;
  name: string;
  createdAt: string;
  // Opcional: Si el backend envía el rol en la lista o se obtiene en el detalle
  // role?: 'OWNER' | 'ADMIN' | 'MEMBER'; 
}

// Estructura de la respuesta esperada de la API
interface GetWorkspacesResponse {
  ok: boolean;
  message: string;
  data: Workspace[]; // Lista de espacios de trabajo
}
```

## 4. Requerimientos de Implementación

### A. Capa de Servicios (Service Layer)
- Crear una función dedicada (ej. `getWorkspaces()`) dentro de un servicio (ej. `workspace.service.js` o `.ts`).
- Asegurar que el cliente HTTP (fetch nativo, Axios, etc.) incluya automáticamente el token de autenticación del usuario en cada petición.
- Manejar respuestas de error del servidor, especialmente el código `401 Unauthorized` (para limpiar la sesión y mandar al login si el token expiró).

### B. Gestión de Estado (State Management)
Para renderizar correctamente la UI, se recomienda mantener los siguientes estados locales o globales:
- `workspaces`: El arreglo de objetos (`Workspace[]`). Inicializado en vacío.
- `isLoading`: Booleano para saber si se está haciendo la petición a la red.
- `error`: Variable para almacenar un mensaje si falla la petición.

*Recomendación:* Se puede crear un Custom Hook (ej. `useWorkspaces`) o utilizar herramientas como React Query/SWR para simplificar esta lógica, manejar el caché y la revalidación.

### C. Componentes UI (Interfaces de Usuario)
Se deben desarrollar componentes que cubran los 4 estados principales de una petición asíncrona:

1. **Estado de Carga (Loading State):** Un componente visual (Spinner, barras de progreso o Skeleton Loaders) mientras `isLoading` sea `true`.
2. **Estado Vacío (Empty State):** Un diseño ilustrativo si el usuario está activo pero el arreglo de workspaces tiene longitud 0. Debe incluir un Call to Action prominente (Botón "Crear nuevo Workspace").
3. **Estado de Error (Error State):** Un mensaje informando que hubo un problema de conexión o servidor, idealmente con un botón de "Reintentar".
4. **Estado Exitoso (Success State):** 
    - Un contenedor tipo grilla o lista (`WorkspaceList`).
    - Componentes de tarjeta (`WorkspaceCard`) individuales.
    - Cada tarjeta mostrará el nombre del Workspace y cualquier otro metadato relevante.

### D. Flujo y Navegación del Usuario
1. El usuario inicia sesión exitosamente en la plataforma.
2. Es redirigido al Dashboard o Pantalla Principal.
3. Al montar (renderizar) la vista, se dispara la petición `GET /api/workspace/`.
4. El sistema muestra el *Estado de Carga*.
5. La petición se resuelve:
   - Si no hay workspaces, se muestra el *Estado Vacío*.
   - Si hay workspaces, se muestra el *Estado Exitoso* con la grilla.
6. Al hacer clic en una tarjeta específica (`WorkspaceCard`), el usuario navega a la ruta de ese entorno de trabajo particular (ej. `/workspace/:workspace_id`).

## 5. Criterios de Aceptación
- [ ] La petición incluye el token correctamente (evitando errores 401 para usuarios válidos).
- [ ] El usuario experimenta feedback visual inmediato (Loading) al entrar a la pantalla.
- [ ] Los usuarios sin workspaces tienen un flujo fácil para crear el primero.
- [ ] Hacer clic en un workspace individual enruta correctamente al dashboard interno de ese workspace.
- [ ] En caso de que el token sea inválido o expire en medio de la petición, el usuario es devuelto al flujo de Login.
