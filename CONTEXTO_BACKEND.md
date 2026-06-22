# Contexto y Arquitectura Backend (Módulo Social MIB)

Este documento detalla el diseño de las entidades sociales prioritarias para el Trabajo Final Integrador, transformando a los Usuarios en verdaderos perfiles musicales interactivos (estilo Facebook/Twitter).

## Diagrama de Entidades y Relaciones

El núcleo de la aplicación girará en torno a la entidad **USUARIOS**, la cual se relacionará con las siguientes ramas:

### 1. Ecosistema de Publicaciones (POSTS)
- **POST:** 
  - `contenido` (String)
  - `fk_id_usuario` (Referencia al autor del post)
  - `republicado_desde` (Referencia opcional a otro `fk_post_id` para simular un "Share" o "Retweet")
  - `fecha` (Date)
- **LIKES (Me Gusta):**
  - `fk_id_post` (Referencia al post likeado)
  - `fk_id_usuario` (Referencia a quién dio el like)
  - `fecha` (Date)
- **COMENTARIOS:**
  - `fk_id_post` (Referencia al post donde se comenta)
  - `fk_id_usuario` (Referencia al autor del comentario) *[Corregido del diagrama original]*
  - `contenido` (String)
  - `fecha` (Date)

### 2. Ecosistema de Seguidores (FOLLOWS)
- **FOLLOWS:**
  - `fk_id_usuario` (El seguidor)
  - `fk_id_sigue_a` (El perfil que está siendo seguido)
  - `fecha` (Date)

### 3. Ecosistema de Mensajería Privada
- **CONTACTOS (Conversaciones Activas):**
  - `fk_id_usuario_A` y `fk_id_usuario_B` (Para registrar que dos personas tienen un chat abierto)
  - `fecha_ultimo_mensaje` (Date)
- **MENSAJES DIRECTOS:**
  - `contenido` (String)
  - `fk_id_emisor` (Quién lo envía)
  - `fk_id_receptor` (A quién va dirigido)
  - `fecha` (Date)

---

## Análisis y Mejoras Arquitectónicas (A tener en cuenta)

Para garantizar que esta estructura sea **robusta y escalable** (nuestra máxima prioridad), debemos aplicar las siguientes mejoras respecto al diagrama original:

1. **Autoría en los Comentarios:** El diagrama original omitió quién escribe el comentario. Es imperativo agregar `fk_id_usuario` en la entidad `Comentarios`, de lo contrario tendríamos comentarios anónimos.
2. **Optimizaciones de Lectura (Patrón Contador):** Para no tener que contar cuántos "Likes" o "Comentarios" tiene un Post haciendo una consulta pesada a la base de datos en cada petición, agregaremos campos virtuales o contadores cacheados en el modelo `POST` (ej. `likesCount`, `commentsCount`).
3. **Redundancia en Contactos:** En lugar de llamar "Contactos" a una relación abstracta, la trataremos como una entidad `Conversation` (Conversación). Una conversación une a dos usuarios, y los `Mensajes_Directos` apuntarán a esa `Conversation`. Esto hace que el Frontend pueda cargar la "Lista de Chats" muy rápidamente, tal como en WhatsApp.
4. **Seguridad (Peso Lógico):** 
   - Nadie podrá dar "Like" dos veces al mismo post (validación de unicidad `[fk_id_post, fk_id_usuario]`).
   - Nadie podrá editar un Post o Comentario que no sea suyo (validación `req.user.id === post.fk_id_usuario`).
   - Un usuario no puede seguirse a sí mismo.

**Conclusión:** La estructura es brillante, cumple de sobra con la consigna del trabajo final (entidades relacionadas + CRUD complejo) y nos da pie a usar `.populate()` masivamente en Mongoose para traer los perfiles de los usuarios junto con sus posts.
