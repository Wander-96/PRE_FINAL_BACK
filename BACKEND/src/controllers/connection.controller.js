import mongoose from 'mongoose';
import Connection from '../models/connection.model.js';
import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';

class ConnectionController {
    // Enviar solicitud de conexión (o conectar directamente si queremos saltarnos el pending)
    async sendRequest(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const requesterId = req.user.id;
            const { recipientId } = req.params;

            if (requesterId === recipientId) {
                return res.status(400).json({ ok: false, message: "No puedes conectar contigo mismo" });
            }

            // Verificar si ya existe una conexión o solicitud previa
            const existingConnection = await Connection.findOne({
                $or: [
                    { requester: requesterId, recipient: recipientId },
                    { requester: recipientId, recipient: requesterId }
                ]
            });

            if (existingConnection) {
                return res.status(400).json({ ok: false, message: "Ya existe una conexión o solicitud pendiente con este usuario" });
            }

            // Crear la conexión con estado pending
            const newConnection = new Connection({
                requester: requesterId,
                recipient: recipientId,
                status: 'pending'
            });

            await newConnection.save({ session });

            // Crear notificación
            const notification = new Notification({
                recipient: recipientId,
                sender: requesterId,
                type: 'CONNECTION',
                related_entity: newConnection._id
            });

            await notification.save({ session });

            await session.commitTransaction();

            res.status(201).json({
                ok: true,
                message: "Solicitud de conexión enviada con éxito",
                data: newConnection
            });
        } catch (error) {
            await session.abortTransaction();
            console.error("Error al enviar solicitud:", error);
            res.status(500).json({ ok: false, message: error.message || "Error interno del servidor" });
        } finally {
            session.endSession();
        }
    }

    // Aceptar solicitud
    async acceptRequest(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const userId = req.user.id;
            const { connectionId } = req.params;

            const connection = await Connection.findOne({ _id: connectionId, recipient: userId, status: 'pending' });
            
            if (!connection) {
                return res.status(404).json({ ok: false, message: "Solicitud no encontrada o no autorizada" });
            }

            connection.status = 'accepted';
            await connection.save({ session });

            // Notificar al que envió la solicitud original que fue aceptada
            const notification = new Notification({
                recipient: connection.requester,
                sender: userId,
                type: 'CONNECTION_ACCEPTED',
                related_entity: connection._id
            });

            await notification.save({ session });

            await session.commitTransaction();

            res.status(200).json({
                ok: true,
                message: "Conexión aceptada exitosamente",
                data: connection
            });
        } catch (error) {
            await session.abortTransaction();
            console.error("Error al aceptar conexión:", error);
            res.status(500).json({ ok: false, message: error.message || "Error interno del servidor" });
        } finally {
            session.endSession();
        }
    }

    // Rechazar solicitud o eliminar conexión existente
    async removeConnection(req, res) {
        try {
            const userId = req.user.id;
            const { connectionId } = req.params;

            const connection = await Connection.findOneAndDelete({
                _id: connectionId,
                $or: [{ requester: userId }, { recipient: userId }]
            });

            if (!connection) {
                return res.status(404).json({ ok: false, message: "Conexión no encontrada" });
            }

            res.status(200).json({ ok: true, message: "Conexión eliminada correctamente" });
        } catch (error) {
            console.error("Error al eliminar conexión:", error);
            res.status(500).json({ ok: false, message: error.message || "Error interno del servidor" });
        }
    }

    // Obtener amigos (conexiones aceptadas) de un usuario
    async getConnections(req, res) {
        try {
            const { userId } = req.params;
            
            const connections = await Connection.find({
                $or: [{ requester: userId }, { recipient: userId }],
                status: 'accepted'
            }).populate('requester recipient', 'name last_name avatar bio instruments country');

            // Filtrar para devolver solo los datos del "otro" usuario, no del que consultamos
            const friends = connections.map(conn => {
                const isRequester = conn.requester._id.toString() === userId.toString();
                const friend = isRequester ? conn.recipient : conn.requester;
                return {
                    connectionId: conn._id,
                    ...friend.toObject() // Retorna los datos limpios del usuario
                };
            });

            res.status(200).json({ ok: true, data: friends });
        } catch (error) {
            console.error("Error al obtener conexiones:", error);
            res.status(500).json({ ok: false, message: error.message || "Error interno del servidor" });
        }
    }

    // Obtener solicitudes pendientes HACIA mi
    async getPendingRequests(req, res) {
        try {
            const userId = req.user.id;
            
            const pending = await Connection.find({
                recipient: userId,
                status: 'pending'
            }).populate('requester', 'name last_name avatar bio instruments');

            res.status(200).json({ ok: true, data: pending });
        } catch (error) {
            console.error("Error al obtener pendientes:", error);
            res.status(500).json({ ok: false, message: error.message || "Error interno del servidor" });
        }
    }

    // Obtener el estado de conexión entre el usuario logueado y el perfil que está viendo
    async getConnectionStatus(req, res) {
        try {
            const loggedInUserId = req.user.id;
            const { targetUserId } = req.params;

            if (loggedInUserId === targetUserId) {
                return res.status(200).json({ ok: true, data: { status: 'self' } });
            }

            const connection = await Connection.findOne({
                $or: [
                    { requester: loggedInUserId, recipient: targetUserId },
                    { requester: targetUserId, recipient: loggedInUserId }
                ]
            });

            if (!connection) {
                return res.status(200).json({ ok: true, data: { status: 'none' } });
            }

            res.status(200).json({ 
                ok: true, 
                data: { 
                    status: connection.status,
                    connectionId: connection._id,
                    isRequester: connection.requester.toString() === loggedInUserId.toString()
                } 
            });

        } catch (error) {
            console.error("Error al obtener estado:", error);
            res.status(500).json({ ok: false, message: error.message });
        }
    }
}

export default new ConnectionController();
