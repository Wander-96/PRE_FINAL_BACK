import ENVIRONMENT from '../config/environment.js';

const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const getMyNotifications = async (limit = 20) => {
    const response = await fetch(`${ENVIRONMENT.URL_API}/api/notifications?limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    
    const data = await response.json();
    return data;
};

export const markAllAsRead = async () => {
    const response = await fetch(`${ENVIRONMENT.URL_API}/api/notifications/read`, {
        method: 'PUT',
        headers: getAuthHeaders()
    });
    
    const data = await response.json();
    return data;
};
