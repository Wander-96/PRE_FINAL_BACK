/*
Esta clase hereda ("extends") del Error nativo de JavaScript.
Le agregamos la propiedad 'status' para poder manejar los códigos HTTP fácilmente.
*/

class ServerError extends Error {
    constructor(message, status) {
        super(message)
        this.status = status
    }
}

export default ServerError