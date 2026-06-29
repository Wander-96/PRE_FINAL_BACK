import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';
import User from '../models/user.model.js';

export const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        const conversations = await Conversation.find({
            participants: { $in: [userId] }
        })
        .populate('participants', 'name last_name avatar')
        .populate('lastMessage')
        .sort({ updated_at: -1 });

        res.status(200).json({ ok: true, data: conversations });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'Error al obtener conversaciones' });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        // Verificar que el usuario pertenezca a la conversación
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ ok: false, message: 'Conversación no encontrada' });
        }
        if (!conversation.participants.includes(userId)) {
            return res.status(403).json({ ok: false, message: 'No tienes acceso a esta conversación' });
        }

        const messages = await Message.find({ conversationId })
            .populate('sender', 'name avatar')
            .sort({ created_at: 1 });

        res.status(200).json({ ok: true, data: messages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'Error al obtener mensajes' });
    }
};

export const createConversation = async (req, res) => {
    try {
        const { recipientId } = req.body;
        const userId = req.user.id;

        if (recipientId === userId) {
            return res.status(400).json({ ok: false, message: 'No puedes iniciar un chat contigo mismo' });
        }

        // Verificar si ya existe
        let conversation = await Conversation.findOne({
            participants: { $all: [userId, recipientId] }
        }).populate('participants', 'name last_name avatar').populate('lastMessage');

        if (conversation) {
            return res.status(200).json({ ok: true, data: conversation });
        }

        // Crear nueva
        conversation = new Conversation({
            participants: [userId, recipientId]
        });
        await conversation.save();
        
        conversation = await Conversation.findById(conversation._id).populate('participants', 'name last_name avatar');

        res.status(201).json({ ok: true, data: conversation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'Error al crear conversación' });
    }
};
