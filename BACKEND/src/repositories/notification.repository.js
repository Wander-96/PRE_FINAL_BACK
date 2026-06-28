import Notification from "../models/notification.model.js";

class NotificationRepository {
    async create(notificationData) {
        // No enviarse notificaciones a uno mismo
        if (notificationData.recipient.toString() === notificationData.sender.toString()) {
            return null; 
        }
        const newNotification = new Notification(notificationData);
        return await newNotification.save();
    }

    async getUserNotifications(userId, limit = 20) {
        return await Notification.find({ recipient: userId })
            .sort({ created_at: -1 })
            .limit(limit)
            .populate('sender', 'name last_name avatar')
            .lean();
    }

    async getUnreadCount(userId) {
        return await Notification.countDocuments({ recipient: userId, is_read: false });
    }

    async markAllAsRead(userId) {
        return await Notification.updateMany(
            { recipient: userId, is_read: false },
            { $set: { is_read: true } }
        );
    }
}

export default new NotificationRepository();
