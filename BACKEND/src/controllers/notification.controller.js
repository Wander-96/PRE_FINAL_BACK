import notificationRepository from "../repositories/notification.repository.js";
import ServerError from "../helpers/serverError.helper.js";

class NotificationController {
    async getMyNotifications(req, res) {
        try {
            const userId = req.user.id;
            const limit = parseInt(req.query.limit) || 20;

            const notifications = await notificationRepository.getUserNotifications(userId, limit);
            const unreadCount = await notificationRepository.getUnreadCount(userId);

            return res.status(200).json({
                ok: true,
                status: 200,
                message: "Notificaciones obtenidas con éxito",
                data: {
                    notifications,
                    unreadCount
                }
            });
        } catch (error) {
            console.error("Error en getMyNotifications:", error);
            const status = error.status || 500;
            return res.status(status).json({
                ok: false,
                status,
                message: error.message || "Error interno del servidor"
            });
        }
    }

    async markAllAsRead(req, res) {
        try {
            const userId = req.user.id;
            await notificationRepository.markAllAsRead(userId);

            return res.status(200).json({
                ok: true,
                status: 200,
                message: "Notificaciones marcadas como leídas"
            });
        } catch (error) {
            console.error("Error en markAllAsRead:", error);
            const status = error.status || 500;
            return res.status(status).json({
                ok: false,
                status,
                message: error.message || "Error interno del servidor"
            });
        }
    }
}

export default new NotificationController();
