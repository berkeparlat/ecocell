import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { sendMessage, subscribeToConversations, subscribeToChat, getUsers, markConversationAsRead } from '../../services/messageService';
import { Send, Inbox, ArrowLeft, User, Search } from 'lucide-react';
import './Messages.css';

const Messages = () => {
  const { user, departments } = useApp();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [users, setUsers] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const chatUnsubscribeRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    loadUsers();

    const unsubscribe = subscribeToConversations(user.uid, (conversations) => {
      setConversations(conversations);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!selectedChat || !user) return;

    if (chatUnsubscribeRef.current) {
      chatUnsubscribeRef.current();
    }

    chatUnsubscribeRef.current = subscribeToChat(user.uid, selectedChat.userId, (messages) => {
      setChatMessages(messages);
      scrollToBottom();
    });

    markConversationAsRead(user.uid, selectedChat.userId);

    return () => {
      if (chatUnsubscribeRef.current) {
        chatUnsubscribeRef.current();
      }
    };
  }, [selectedChat, user]);

  const loadUsers = async () => {
    const usersList = await getUsers();
    setUsers(usersList.filter(u => u.id !== user.uid));
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChat || loading) return;

    setLoading(true);
    try {
      await sendMessage({
        senderId: user.uid,
        senderName: user.fullName || user.displayName || user.email,
        senderDepartment: user.department || '',
        recipientId: selectedChat.userId,
        recipientName: selectedChat.userName,
        recipientDepartment: selectedChat.userDepartment || '',
        subject: 'Sohbet',
        content: messageInput.trim()
      });

      setMessageInput('');
      scrollToBottom();
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      alert('Mesaj gönderilemedi!');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedChat(conversation);
    setShowNewChat(false);
  };
  const handleStartNewChat = (selectedUser) => {
    setSelectedChat({
      userId: selectedUser.id,
      userName: selectedUser.fullName || selectedUser.displayName || selectedUser.email,
      userDepartment: selectedUser.department || '',
      lastMessage: null,
      unreadCount: 0
    });
    setShowNewChat(false);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now - date;
    
    if (diff < 86400000) {
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }
    if (diff < 604800000) {
      return date.toLocaleDateString('tr-TR', { weekday: 'short' });
    }
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });  };
  
  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.fullName || u.displayName || u.email).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.department || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!selectedDepartment) return matchesSearch;
    return matchesSearch && u.department === selectedDepartment;
  });

  const handleSendToDepartment = async () => {
    if (!selectedDepartment || !messageInput.trim()) {
      alert('Lütfen birim seçin ve mesaj yazın.');
      return;
    }

    const departmentUsers = users.filter(u => u.department === selectedDepartment);
    if (departmentUsers.length === 0) {
      alert('Bu birimde kullanıcı bulunamadı.');
      return;
    }

    setLoading(true);
    try {
      const sendPromises = departmentUsers.map(recipient => {
        return sendMessage({
          senderId: user.uid,
          senderName: user.fullName || user.displayName || user.email,
          senderDepartment: user.department || '',
          recipientId: recipient.id,
          recipientName: recipient.fullName || recipient.displayName || recipient.email,
          recipientDepartment: recipient.department || '',
          subject: `${selectedDepartment} Birimi Mesajı`,
          content: messageInput.trim()
        });
      });

      await Promise.all(sendPromises);
      alert(`Mesaj ${departmentUsers.length} kişiye başarıyla gönderildi!`);
      setMessageInput('');
      setSelectedDepartment('');
      setShowNewChat(false);
    } catch (error) {
      console.error('Grup mesajı gönderme hatası:', error);
      alert('Mesajlar gönderilemedi!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="messages-page">
      <SimpleHeader />
      <div className="messages-container-chat">
        <div className="conversations-panel">
          <div className="conversations-header">
            <h2>Mesajlar</h2>
            <button className="new-chat-btn" onClick={() => setShowNewChat(true)}>
              <Send size={18} />
            </button>
          </div>          {showNewChat ? (
            <div className="new-chat-panel">
              <div className="new-chat-header">
                <button onClick={() => setShowNewChat(false)} className="back-btn">
                  <ArrowLeft size={20} />
                </button>
                <h3>Yeni Sohbet</h3>
              </div>
              
              <div className="department-group-section">
                <div className="section-title">Birime Mesaj Gönder</div>
                <select 
                  className="department-select"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <option value="">Birim seçin...</option>
                  {departments && departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                
                {selectedDepartment && (
                  <div className="group-message-box">
                    <textarea
                      placeholder={`${selectedDepartment} birimine mesaj yazın...`}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      rows="3"
                      disabled={loading}
                    />
                    <button 
                      className="send-group-btn"
                      onClick={handleSendToDepartment}
                      disabled={loading || !messageInput.trim()}
                    >
                      {loading ? 'Gönderiliyor...' : `${selectedDepartment} Birimine Gönder`}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="section-title">veya Kişi Seçin</div>
              
              <div className="search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Kullanıcı ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div><div className="users-list">
                {filteredUsers.map(u => (
                  <div
                    key={u.id}
                    className="user-item"
                    onClick={() => handleStartNewChat(u)}
                  >
                    <div className="user-avatar">
                      <User size={24} />
                    </div>
                    <div className="user-info-chat">
                      <div className="user-name-chat">{u.fullName || u.displayName || u.email}</div>
                      {u.department && <div className="user-dept">{u.department}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="conversations-list">
              {conversations.length === 0 ? (
                <div className="no-conversations">
                  <Inbox size={48} />
                  <p>Henüz konuşma yok</p>
                  <small>Yeni sohbet başlatmak için + butonuna tıklayın</small>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.userId}
                    className={`conversation-item ${selectedChat?.userId === conv.userId ? 'active' : ''}`}
                    onClick={() => handleSelectConversation(conv)}
                  >
                    <div className="conv-avatar">
                      <User size={24} />
                    </div>
                    <div className="conv-content">
                      <div className="conv-header">
                        <span className="conv-name">
                          {conv.userName}
                          {conv.userDepartment && ` (${conv.userDepartment})`}
                        </span>
                        {conv.lastMessage && (
                          <span className="conv-time">{formatDate(conv.lastMessage.createdAt)}</span>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <div className="conv-preview">
                          {conv.lastMessage.senderId === user.uid ? 'Siz: ' : ''}
                          {conv.lastMessage.content}
                        </div>
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="unread-badge-chat">{conv.unreadCount}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="chat-panel">
          {selectedChat ? (
            <>
              <div className="chat-header">
                <button className="back-btn-mobile" onClick={() => setSelectedChat(null)}>
                  <ArrowLeft size={20} />
                </button>
                <div className="chat-user-info">
                  <div className="chat-avatar">
                    <User size={24} />
                  </div>
                  <div>
                    <div className="chat-user-name">{selectedChat.userName}</div>
                    {selectedChat.userDepartment && (
                      <div className="chat-user-dept">{selectedChat.userDepartment}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="chat-messages">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message-bubble ${msg.senderId === user.uid ? 'sent' : 'received'}`}
                  >
                    <div className="message-content-bubble">{msg.content}</div>
                    <div className="message-time">{formatTime(msg.createdAt)}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <form className="chat-input" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Mesaj yazın..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  disabled={loading}
                />
                <button type="submit" disabled={loading || !messageInput.trim()}>
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <Inbox size={64} />
              <p>Sohbet seçin veya yeni sohbet başlatın</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;

