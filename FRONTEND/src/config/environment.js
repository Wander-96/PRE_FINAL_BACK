const ENVIRONMENT = {
    // Si en producción existe VITE_URL_API la usa, si no asume que el backend está corriendo en local en el 3000
    URL_API: import.meta.env.VITE_URL_API || 'http://localhost:3000'
};

export default ENVIRONMENT;
