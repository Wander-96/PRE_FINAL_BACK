import ENVIRONMENT from '../config/environment.js';

const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const globalSearch = async (query, type = 'all', page = 1, limit = 10) => {
    const response = await fetch(`${ENVIRONMENT.URL_API}/api/search?q=${encodeURIComponent(query)}&type=${type}&page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Error al realizar la búsqueda');
    }
    return data;
};
