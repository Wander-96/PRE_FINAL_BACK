import ENVIRONMENT from '../config/environment.js';

const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const getCommentsByPost = async (postId, page = 1, limit = 10) => {
    const response = await fetch(`${ENVIRONMENT.URL_API}/api/comments/post/${postId}?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Error al obtener comentarios');
    }
    return data;
};

export const createComment = async (postId, content) => {
    const response = await fetch(`${ENVIRONMENT.URL_API}/api/comments/post/${postId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Error al publicar comentario');
    }
    return data;
};

export const deleteComment = async (commentId) => {
    const response = await fetch(`${ENVIRONMENT.URL_API}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar comentario');
    }
    return data;
};

export const updateComment = async (commentId, content) => {
    const response = await fetch(`${ENVIRONMENT.URL_API}/api/comments/${commentId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar comentario');
    }
    return data;
};
