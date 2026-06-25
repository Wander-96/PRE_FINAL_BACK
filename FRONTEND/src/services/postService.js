import ENVIRONMENT from '../config/environment.js';

const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const getFeed = async (page = 1, limit = 10) => {
    const response = await fetch(`${ENVIRONMENT.URL_API}/api/feed?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Error al obtener el feed');
    }
    return data; 
};

export const createPost = (formData, onProgress) => {
    return new Promise((resolve, reject) => {
        const token = localStorage.getItem('access_token');
        const xhr = new XMLHttpRequest();

        xhr.open('POST', `${ENVIRONMENT.URL_API}/api/posts`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        // Track upload progress
        if (onProgress && xhr.upload) {
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    onProgress(percentComplete);
                }
            };
        }

        xhr.onload = () => {
            let data;
            try {
                data = JSON.parse(xhr.responseText);
            } catch (e) {
                data = { message: 'Error de respuesta del servidor' };
            }

            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(data);
            } else {
                reject(new Error(data.message || 'Error al crear la publicación'));
            }
        };

        xhr.onerror = () => {
            reject(new Error('Error de red al crear la publicación'));
        };

        xhr.send(formData);
    });
};

export const toggleLike = async (postId) => {
    const response = await fetch(`${ENVIRONMENT.URL_API}/api/posts/${postId}/like`, {
        method: 'PATCH',
        headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Error al procesar el like');
    }
    return data;
};

export const deletePost = async (postId) => {
    const response = await fetch(`${ENVIRONMENT.URL_API}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar la publicación');
    }
    return data;
};

export const updatePost = async (postId, content) => {
    const response = await fetch(`${ENVIRONMENT.URL_API}/api/posts/${postId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar la publicación');
    }
    return data;
};
