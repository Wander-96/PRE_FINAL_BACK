# 🛡️ Defensa de la Arquitectura del Proyecto

Este documento justifica y defiende las decisiones técnicas, patrones de diseño y estrategias de ciberseguridad implementadas en el desarrollo de la aplicación. Es el tipo de material que usarías para defender tu código en una entrevista técnica, ante un líder técnico o un arquitecto de software.

## 1. El Patrón Repositorio (Repository Pattern)
**¿Qué hicimos?** 
Separamos completamente las consultas de Mongoose (como `User.find` o `Workspace.create`) en archivos independientes (ej: `user.repository.js`) en lugar de escribirlas directamente en los Controladores.

**Defensa Técnica:**
- **Principio de Responsabilidad Única (SOLID):** El Controlador no debe saber *cómo* se guardan los datos, solo *qué* datos procesar. 
- **Alta Mantenibilidad y Agnosticismo:** Si el día de mañana la empresa decide migrar de MongoDB a PostgreSQL (SQL), no tenemos que tocar ni una sola línea de los Controladores. Solo cambiamos la sintaxis interna del Repositorio. El resto del sistema ni se entera del cambio.

## 2. Middlewares Avanzados (Funciones de Fábrica / Closures)
**¿Qué hicimos?** 
En lugar de crear middlewares rígidos, implementamos "Middlewares Mutantes" o Closures (ej: `workspaceMiddleware([ROLES])`), que son funciones que retornan el middleware real configurado según los parámetros.

**Defensa Técnica:**
- **Reutilización Extrema (Principio DRY):** En lugar de crear un middleware `soloDueños`, otro `dueñosYAdmins`, y otro `todosLosMiembros`, creamos un único núcleo dinámico.
- **Controladores Delgados (Thin Controllers):** Al delegar la verificación de roles y membresías al middleware, los Controladores quedan extremadamente limpios. El controlador que borra un espacio asume que, si el código llegó hasta ahí, es porque el usuario tiene el permiso de dueño. Esto reduce drásticamente el código repetido y las ramificaciones `if/else`.

## 3. Seguridad: Prevención de Enumeración de Usuarios
**¿Qué hicimos?** 
En el endpoint de "Olvidé mi contraseña", si el cliente envía un correo que no existe en nuestra base de datos, el servidor responde con un éxito simulado (`status 200`) y el mensaje *"Si el correo existe, recibirás un mail"* en lugar de devolver un error 404 ("No encontrado").

**Defensa Técnica:**
- **Mitigación de OSINT / Fuerza Bruta:** Si devolviéramos un error 404, un atacante o bot automatizado podría hacer miles de peticiones probando correos al azar para mapear exactamente cuáles tienen cuenta en nuestra aplicación. Al responder siempre de forma homogénea, "cegamos" al atacante. Este es un estándar crítico recomendado por OWASP.

## 4. Seguridad: JWT Stateless y "Single-Use" Dinámico
**¿Qué hicimos?** 
Para la recuperación de contraseñas, no guardamos un "código de reseteo" en la base de datos. En su lugar, firmamos un JWT usando un secreto compuesto dinámicamente: `JWT_SECRET_GLOBAL + user.password_hash`.

**Defensa Técnica:**
- **Respeto por la Naturaleza Stateless:** Las APIs RESTful modernas deben ser "sin estado". Guardar tokens temporales en la base de datos rompe este paradigma y sobrecarga la BD con datos efímeros que requieren limpieza (cron jobs).
- **Garantía Criptográfica Inmediata:** Al atar la firma del token al hash *actual* de la contraseña, logramos invalidación en tiempo real sin usar listas negras (blacklists). En el instante en que el usuario cambia su contraseña, su hash cambia. Cualquier intento posterior de reusar el mismo JWT fallará matemáticamente en la verificación porque la "llave" que se usó para firmarlo ya no existe. Es una solución elegante, ultrarrápida y 100% segura.

## 5. Criptografía: Salt Rounds en Bcrypt
**¿Qué hicimos?** 
Aumentamos el costo del algoritmo de hasheo en Bcrypt pasando de 10 a 12 `salt rounds`.

**Defensa Técnica:**
- **Defensa contra Hardware Moderno:** Cada incremento en el "Salt Round" duplica el tiempo de procesamiento necesario para generar un hash. Al subirlo a 12, hacemos que los ataques de diccionario y de fuerza bruta (incluso usando tarjetas gráficas modernas) sean exponencialmente más costosos y lentos para un atacante en caso de una filtración de base de datos, sin afectar negativamente la experiencia de inicio de sesión del usuario.

## 6. Separación de Responsabilidades en el Frontend
**¿Qué hicimos?** 
Extraer absolutamente todos los `fetch` (llamadas HTTP a la API) a la carpeta `services/authService.js` en lugar de ejecutarlos directamente adentro de los componentes de React (`onClick` o `useEffect`).

**Defensa Técnica:**
- **Desacoplamiento de UI y Lógica de Red:** Los componentes de React (Vistas) solo deben preocuparse por la experiencia de usuario (dibujar inputs, capturar texto, mostrar alertas). 
- **Escalabilidad Inmediata:** Si el día de mañana la URL del backend cambia, o si el equipo decide reemplazar `fetch` nativo por librerías más potentes como `Axios`, el desarrollador solo necesita modificar **un único archivo** (`authService.js`). Si las llamadas estuvieran incrustadas en los componentes, habría que cazar y refactorizar decenas de archivos esparcidos por todo el proyecto.
