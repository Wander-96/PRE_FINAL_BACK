import { io } from 'socket.io-client';
import ENVIRONMENT from './environment.js';

let socket = null;

export const connectSocket = () => {
    if (socket) return socket;

    const token = localStorage.getItem('access_token');
    if (!token) return null;

    socket = io(ENVIRONMENT.URL_API, {
        auth: {
            token: token
        }
    });

    socket.on('connect', () => {
        console.log('Socket conectado:', socket.id);
    });

    socket.on('disconnect', () => {
        console.log('Socket desconectado');
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
