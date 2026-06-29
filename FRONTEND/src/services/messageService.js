import ENVIRONMENT from '../config/environment.js';

const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const getConversations = async () => {
    const response = await fetch(`${ENVIRONMENT.URL_API}/api/messages/conversations`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!data.ok) throw new Error(data.message);
    return data;
};

export const getMessages = async (conversationId) => {
    const response = await fetch(`${ENVIRONMENT.URL_API}/api/messages/${conversationId}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!data.ok) throw new Error(data.message);
    return data;
};

export const createOrGetConversation = async (recipientId) => {
    const response = await fetch(`${ENVIRONMENT.URL_API}/api/messages/conversations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ recipientId })
    });
    const data = await response.json();
    if (!data.ok) throw new Error(data.message);
    return data;
};
