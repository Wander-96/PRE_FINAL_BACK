# 🚨 Análisis de Riesgos en Producción: Sistema de Notificaciones

Este documento (`CRITIC.md`) detalla los posibles puntos de fallo críticos, cuellos de botella y problemas arquitectónicos que nuestro Sistema de Notificaciones podría enfrentar al ser desplegado en un entorno de **Producción** con tráfico real y alto volumen de usuarios.

---

## 1. Problemas de Escalabilidad de Base de Datos (Falta de Índices)

### El Problema
En `notification.model.js` no hemos definido **índices de base de datos** para los campos que usamos constantemente. 
Las consultas actuales en `notification.repository.js` son:
- `Notification.find({ recipient: userId }).sort({ created_at: -1 })`
- `Notification.countDocuments({ recipient: userId, is_read: false })`
- `Notification.updateMany({ recipient: userId, is_read: false }, ...)`

### Por qué fallará en Producción
A medida que la aplicación crezca, la colección `Notification` tendrá millones de registros. Sin un índice en `recipient` (y un índice compuesto en `recipient` + `is_read` + `created_at`), MongoDB tendrá que hacer un **Collection Scan** (escanear cada documento de la base de datos) por cada vez que un usuario entre a la app o abra el menú. 
Esto provocará un uso del CPU del 100% en la base de datos y la caída del servicio (Timeouts).

> [!CAUTION]
> **Solución urgente:** Añadir `notificationSchema.index({ recipient: 1, created_at: -1 });` y `notificationSchema.index({ recipient: 1, is_read: 1 });` al modelo.

---

## 2. WebSockets y Escalamiento Horizontal (El síndrome del Servidor A y B)

### El Problema
Nuestra configuración actual en `socket.config.js` usa la memoria RAM de la instancia de Node.js actual para guardar qué usuario está conectado.

### Por qué fallará en Producción
En un entorno de producción real (como AWS ECS, Kubernetes o un clúster), la aplicación no correrá en un solo servidor, sino en múltiples (Instancia A, Instancia B, Instancia C). 
Si el **Usuario 1** (conectado a la Instancia A) le da Like al **Usuario 2** (conectado a la Instancia B), el backend de la Instancia A intentará emitir la notificación (`io.to(user2).emit(...)`), pero como el Usuario 2 está físicamente conectado a la Instancia B, **la notificación nunca llegará en tiempo real**.

> [!WARNING]
> **Solución:** Implementar un adaptador de Redis (`@socket.io/redis-adapter`) en `socket.config.js` para que todos los servidores compartan el estado de los sockets.

---

## 3. Crecimiento Infinito de Datos (Falta de TTL / Purga)

### El Problema
Actualmente, creamos una notificación por cada interacción (`LIKE`, `COMMENT`, etc.), pero no hay ninguna rutina que las elimine. 

### Por qué fallará en Producción
En redes sociales, los usuarios activos pueden recibir cientos de notificaciones al día. Guardar el historial completo e infinito de "a Juan le gustó tu foto hace 5 años" es un desperdicio de almacenamiento en MongoDB (costos elevados) y ralentiza los respaldos (backups).

> [!TIP]
> **Solución:** Implementar un índice TTL (Time-To-Live) en `created_at` para eliminar automáticamente las notificaciones leídas después de 30 o 60 días, o crear un *cron job* de archivado.

---

## 4. Consistencia de Datos (Condiciones de Carrera sin Transacciones)

### El Problema
En servicios como `like.service.js`, estamos haciendo dos cosas que mutan la base de datos de forma separada:
1. `post.likesCount += 1; await post.save();`
2. `await notificationRepository.create(...)`

### Por qué fallará en Producción
Si MongoDB guarda el *Like* exitosamente, pero por una falla de red de microsegundos la creación de la *Notificación* falla, la base de datos queda en un estado **inconsistente**. El usuario tendrá un like, pero el dueño del post nunca será notificado. Y al revés, si falla el decremento de likes al quitarlo.

> [!NOTE]
> **Solución:** Utilizar Sesiones y Transacciones de MongoDB (`session.startTransaction()`) para asegurar que todo el bloque se ejecute correctamente (Atomicidad), o falle todo junto (Rollback).

---

## 5. Orfandad de Referencias (Usuarios Eliminados)

### El Problema
Usamos `populate('sender', 'name last_name avatar')`. ¿Qué pasa si el `sender` (quien dio el like) elimina permanentemente su cuenta de la plataforma?

### Por qué fallará en Producción
El campo `sender` en la notificación quedará huérfano. Mongoose devolverá `sender: null`. Nuestro Frontend utiliza *Optional Chaining* (`sender?.name`), lo cual previene que React explote con la pantalla blanca de la muerte, **pero** el menú mostrará algo como:
*"undefined undefined interactuó contigo"*.

> [!IMPORTANT]
> **Solución:** Filtrar en el Frontend las notificaciones cuyo `sender` sea null, o enganchar el borrado de la cuenta de un usuario para que elimine (o anonimice) todas sus notificaciones generadas ("Usuario Eliminado").
