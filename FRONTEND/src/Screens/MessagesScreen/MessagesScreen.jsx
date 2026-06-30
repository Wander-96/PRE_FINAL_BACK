import React, { useState, useEffect, useContext, useRef } from 'react';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { getSocket } from '../../config/socket.js';
import { getConversations, getMessages } from '../../services/messageService.js';
import ENVIRONMENT from '../../config/environment.js';
import './MessagesScreen.css';

export const MessagesScreen = () => {
    const { user } = useContext(AuthContext);
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    
    const messagesEndRef = useRef(null);
    const socket = getSocket();

    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user]);

    const getOtherParticipant = (conv) => {
        if (!conv || !conv.participants) return null;
        const currentUserId = user?._id || user?.id;
        return conv.participants.find(p => (p._id || p.id) !== currentUserId) || conv.participants[0];
    };

    const getAvatar = (participant) => {
        if (!participant) return 'https://ui-avatars.com/api/?name=User&background=8b5cf6&color=fff';
        if (participant.avatar) {
            return participant.avatar.startsWith('http') 
                ? participant.avatar 
                : `${ENVIRONMENT.URL_API}/${participant.avatar.replace(/\\/g, '/')}`;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.name || 'User')}&background=8b5cf6&color=fff`;
    };

    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (message) => {
            if (activeChat && activeChat._id === message.conversationId) {
                setMessages(prev => [...prev, message]);
                scrollToBottom();
            }
            fetchConversations();
        };

        const handleMessageSent = (message) => {
            if (activeChat && activeChat._id === message.conversationId) {
                setMessages(prev => [...prev, message]);
                scrollToBottom();
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
        setLoading(true);
        try {
            const res = await getMessages(conversation._id);
            setMessages(res.data);
            if (socket) {
                socket.emit('mark_as_read', { conversationId: conversation._id });
            }
            scrollToBottom();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!newMessage.trim() || !activeChat || !socket) return;

        const recipient = activeChat.participants.find(p => p._id !== user.id);

        socket.emit('send_message', {
            conversationId: activeChat._id,
            recipientId: recipient._id,
            content: newMessage
        });

        setNewMessage('');
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    return (
        <div className="messages-screen-container">
            <div className={`messages-sidebar ${activeChat ? 'hide-on-mobile' : ''}`}>
                <div className="sidebar-header">
                    <h2>Chats</h2>
                </div>
                <div className="conversations-list">
                    {conversations.length === 0 ? (
                        <p className="no-chats-msg">No tienes conversaciones activas.</p>
                    ) : (
                        conversations.map(conv => {
                            const otherUser = getOtherParticipant(conv);
                            if (!otherUser) return null;
                            const isActive = activeChat && activeChat._id === conv._id;
                            const isUnread = conv.lastMessage && 
                                           !conv.lastMessage.isRead && 
                                           conv.lastMessage.sender !== (user?._id || user?.id);

                            const avatarUrl = getAvatar(otherUser);

                            return (
                                <div 
                                    key={conv._id} 
                                    className={`conversation-item ${isActive ? 'active' : ''} ${isUnread ? 'unread' : ''}`}
                                    onClick={() => openChat(conv)}
                                >
                                    <img src={avatarUrl} alt={otherUser.name || 'User'} className="conv-avatar" />
                                    <div className="conv-details">
                                        <h4>{otherUser.name || 'Usuario'}</h4>
                                        {conv.lastMessage && (
                                            <p className="last-msg-preview">
                                                {conv.lastMessage.sender === (user?._id || user?.id) ? 'Tú: ' : ''}
                                                {conv.lastMessage.content}
                                            </p>
                                        )}
                                    </div>
                                    {isUnread && <div className="unread-dot"></div>}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className={`messages-main ${!activeChat ? 'hide-on-mobile' : ''}`}>
                {!activeChat ? (
                    <div className="no-chat-selected">
                        <MessageCircle size={64} opacity={0.2} />
                        <h3>Tus Mensajes</h3>
                        <p>Selecciona una conversación para empezar a chatear.</p>
                    </div>
                ) : (
                    <>
                        <div className="chat-header">
                            <button className="back-btn mobile-only" onClick={() => setActiveChat(null)}>
                                <ArrowLeft size={20} />
                            </button>
                            <img 
                                src={getAvatar(getOtherParticipant(activeChat))} 
                                alt="Avatar" 
                                className="chat-header-avatar"
                            />
                            <h4>{getOtherParticipant(activeChat)?.name || 'Usuario'}</h4>
                        </div>

                        <div className="chat-messages-area">
                            {loading ? (
                                <p className="loading-msgs">Cargando mensajes...</p>
                            ) : (
                                messages.map((msg, idx) => {
                                    const currentUserId = user?._id || user?.id;
                                    const senderId = msg.sender?._id || msg.sender;
                                    const isMine = senderId === currentUserId;
                                    return (
                                        <div key={idx} className={`chat-message-row ${isMine ? 'mine' : 'theirs'}`}>
                                            <div className="chat-message-bubble">
                                                <p>{msg.content}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                            <input 
                                type="text" 
                                placeholder="Escribe un mensaje..." 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit" disabled={!newMessage.trim()} className="btn-send">
                                <Send size={18} />
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};
