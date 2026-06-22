/*
Diccionario central de roles. 
Si mañana queremos cambiar el rol 'dueño' por 'owner', solo lo cambiamos aquí 
y se actualiza en toda la base de datos automáticamente.
*/

export const MEMBER_PROJECT_ROLES = {
    OWNER: 'dueño',
    USER: 'usuario',
    ADMIN: 'admin'
}