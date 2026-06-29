import { getAuthenticatedHeaders } from './authService.js';
import ENVIRONMENT from '../config/environment.js';

const API_URL = ENVIRONMENT.API_URL + '/connections';

export const sendConnectionRequest = async (recipientId) => {
    try {
        const response = await fetch(`${API_URL}/request/${recipientId}`, {
            method: 'POST',
            headers: getAuthenticatedHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    } catch (error) {
        throw error;
    }
};

export const acceptConnectionRequest = async (connectionId) => {
    try {
        const response = await fetch(`${API_URL}/accept/${connectionId}`, {
            method: 'PUT',
            headers: getAuthenticatedHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    } catch (error) {
        throw error;
    }
};

export const removeConnection = async (connectionId) => {
    try {
        const response = await fetch(`${API_URL}/${connectionId}`, {
            method: 'DELETE',
            headers: getAuthenticatedHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    } catch (error) {
        throw error;
    }
};

export const getPendingConnections = async () => {
    try {
        const response = await fetch(`${API_URL}/pending`, {
            method: 'GET',
            headers: getAuthenticatedHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data.data;
    } catch (error) {
        throw error;
    }
};

export const getUserConnections = async (userId) => {
    try {
        const response = await fetch(`${API_URL}/user/${userId}`, {
            method: 'GET',
            headers: getAuthenticatedHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data.data;
    } catch (error) {
        throw error;
    }
};

export const getConnectionStatus = async (targetUserId) => {
    try {
        const response = await fetch(`${API_URL}/status/${targetUserId}`, {
            method: 'GET',
            headers: getAuthenticatedHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data.data;
    } catch (error) {
        throw error;
    }
};
