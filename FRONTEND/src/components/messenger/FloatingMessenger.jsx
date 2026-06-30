import React, { useState, useEffect, useContext } from 'react';
import { MessageCircle, X, ChevronDown, Send } from 'lucide-react';
import { useLocation } from 'react-router';
import { AuthContext } from '../../context/AuthContext.jsx';
import { getSocket } from '../../config/socket.js';
import { getConversations, getMessages, createOrGetConversation } from '../../services/messageService.js';
import ENVIRONMENT from '../../config/environment.js';
import './FloatingMessenger.css';

export const FloatingMessenger = () => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null); // The conversation currently open in the bubble
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const location = useLocation();

    const socket = getSocket();

    // No renderizar si estamos en la ruta /messages (pantalla dedicada)
    if (location.pathname === '/messages') return null;

    // Load conversations when opened
    useEffect(() => {
        if (isOpen && user) {
            fetchConversations();
        }
    }, [isOpen, user]);

    // Escuchar evento global desde Navbar
    useEffect(() => {
        const handleToggle = () => setIsOpen(prev => !prev);
        window.addEventListener('toggle_messenger', handleToggle);
        return () => window.removeEventListener('toggle_messenger', handleToggle);
    }, []);

    // Setup socket listeners
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (message) => {
            // Update messages if the active chat matches
            if (activeChat && activeChat._id === message.conversationId) {
                setMessages(prev => [...prev, message]);
            }
            // Also refresh conversations to update the lastMessage preview
            fetchConversations();
        };

        const handleMessageSent = (message) => {
            if (activeChat && activeChat._id === message.conversationId) {
                setMessages(prev => [...prev, message]);
            }
            fetchConversations();
        };

        socket.on('receive_message', handleReceiveMessage);
        socket.on('message_sent', handleMessageSent);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('message_sent', handleMessageSent);
        };
    }, [socket, activeChat]);

    const fetchConversations = async () => {
        try {
            const res = await getConversations();
            setConversations(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const openChat = async (conversation) => {
        setActiveChat(conversation);
        setIsOpen(false); // Close the main list when opening a specific chat bubble (optional, but cleaner for mobile)
        setLoading(true);
        try {
            const res = await getMessages(conversation._id);
            setMessages(res.data);
            // Marcar como leídos (opcional por ahora)
            if (socket) {
                socket.emit('mark_as_read', { conversationId: conversation._id });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!newMessage.trim() || !activeChat || !socket) return;

        // Identificar al receptor
        const recipient = activeChat.participants.find(p => p._id !== user.id);

        socket.emit('send_message', {
            conversationId: activeChat._id,
            recipientId: recipient._id,
            content: newMessage
        });

        setNewMessage('');
    };

    const getOtherParticipant = (conversation) => {
        return conversation.participants.find(p => p._id !== user.id) || conversation.participants[0];
    };

    const getAvatar = (participant) => {
        const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(participant?.name || 'U')}&background=8b5cf6&color=fff`;
        if (!participant?.avatar) return fallback;
        return participant.avatar.startsWith('http') ? participant.avatar : `${ENVIRONMENT.URL_API}/${participant.avatar.replace(/\\/g, '/')}`;
    };

    // Auto-scroll to bottom of chat
    useEffect(() => {
        const chatBody = document.getElementById('chat-messages-container');
        if (chatBody) {
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    }, [messages]);

    if (!user) return null;

    return (
        <div className="floating-messenger-container">
            {/* Active Chat Bubble */}
            {activeChat && (
                <div className="chat-bubble-window">
                    <div className="chat-bubble-header" onClick={() => setActiveChat(null)}>
                        <div className="chat-bubble-user-info">
                            <img src={getAvatar(getOtherParticipant(activeChat))} alt="Avatar" className="chat-bubble-avatar" />
                            <span className="chat-bubble-name">{getOtherParticipant(activeChat)?.name}</span>
                        </div>
                        <button className="chat-bubble-close" onClick={(e) => { e.stopPropagation(); setActiveChat(null); }}>
                            <X size={18} />
                        </button>
                    </div>

                    <div className="chat-bubble-body" id="chat-messages-container">
                        {loading ? (
                            <div className="chat-loading">Cargando...</div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div key={msg._id || idx} className={`chat-message ${msg.sender._id === user.id ? 'sent' : 'received'}`}>
                                    <div className="chat-message-content">
                                        {msg.content}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <form className="chat-bubble-input-area" onSubmit={handleSendMessage}>
                        <textarea 
                            placeholder="Escribe un mensaje..." 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            rows={1}
                        />
                        <button type="submit" disabled={!newMessage.trim()} onClick={handleSendMessage}>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            {/* Messenger List Window */}
            {isOpen && !activeChat && (
                <div className="messenger-list-window">
                    <div className="messenger-list-header" onClick={() => setIsOpen(false)}>
                        <h4>Mensajes</h4>
                        <ChevronDown size={20} />
                    </div>
                    <div className="messenger-list-body">
                        {conversations.length === 0 ? (
                            <div className="no-conversations">No tienes mensajes aún.</div>
                        ) : (
                            conversations.map(conv => {
                                const other = getOtherParticipant(conv);
                                return (
                                    <div key={conv._id} className="messenger-list-item" onClick={() => openChat(conv)}>
                                        <img src={getAvatar(other)} alt="Avatar" className="messenger-item-avatar" />
                                        <div className="messenger-item-info">
                                            <span className="messenger-item-name">{other?.name} {other?.last_name}</span>
                                            <span className="messenger-item-last-msg">
                                                {conv.lastMessage?.content || 'Inicia la conversación'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Messenger Toggle Button */}
            {!isOpen && !activeChat && (
                <button className="messenger-toggle-btn" onClick={() => setIsOpen(true)}>
                    <MessageCircle size={24} />
                </button>
            )}
        </div>
    );
};
