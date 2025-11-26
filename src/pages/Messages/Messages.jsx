import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { sendMessage, subscribeToConversations, subscribeToChat, getUsers, markConversationAsRead, deleteMessage, deleteConversation } from '../../services/messageService';
import { Send, Inbox, ArrowLeft, User, Search, Check, CheckCheck, ChevronDown, Trash2, MoreVertical } from 'lucide-react';
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
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [isDepartmentsExpanded, setIsDepartmentsExpanded] = useState(true);
  const [isUsersExpanded, setIsUsersExpanded] = useState(true);
  const [contextMenu, setContextMenu] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
  const chatEndRef = useRef(null);
  const chatUnsubscribeRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    loadUsers();

    const unsubscribe = subscribeToConversations(user.uid, (conversations) => {
      setConversations(conversations);
    });

    // Context menu kapatma
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);

    // Mobil görünüm kontrolü
    const handleResize = () => setIsMobileView(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);

    return () => {
      unsubscribe();
      document.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
    };
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

      // Grup chat ise tüm üyelere gönder
      if (isGroupChat && selectedChat.members) {
        const sendPromises = selectedChat.members.map(recipient => {
          return sendMessage({
            senderId: user.uid,
            senderName: user.fullName || user.displayName || user.email,
            senderDepartment: user.department || '',
            recipientId: recipient.id,
            recipientName: recipient.fullName || recipient.displayName || recipient.email,
            recipientDepartment: recipient.department || '',
            subject: `${selectedChat.userName} Mesajı`,
            content: messageInput.trim()
          });
        });

        await Promise.all(sendPromises);
      } else {
        // Normal chat
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
      }

      setMessageInput('');
      scrollToBottom();
    } catch (error) {
      alert('Mesaj gönderilemedi!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Bu mesajı silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await deleteMessage(messageId);
      setContextMenu(null);
    } catch (error) {
            alert('Mesaj silinirken bir hata oluştu.');
    }
  };

  const handleContextMenu = (e, msg) => {
    if (msg.senderId !== user.uid) return; // Sadece kendi mesajlarında
    
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      messageId: msg.id
    });
  };

  const handleDeleteConversation = async () => {
    if (!selectedChat || isGroupChat) return;
    
    if (!window.confirm('Bu konuşmadaki tüm mesajları silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await deleteConversation(user.uid, selectedChat.userId);
      setSelectedChat(null);
      setChatMessages([]);
    } catch (error) {
            alert('Konuşma silinirken bir hata oluştu.');
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedChat(conversation);
    setIsGroupChat(false);
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
    setIsGroupChat(false);
    setShowNewChat(false);
  };

  const handleStartDepartmentChat = (department) => {
    const targetUsers = department === 'all' 
      ? users 
      : users.filter(u => u.department === department);

    setSelectedChat({
      userId: 'group_' + department,
      userName: department === 'all' ? 'Tüm Karafiber Elyaf' : department,
      userDepartment: `${targetUsers.length} kişi`,
      isGroup: true,
      groupType: department,
      members: targetUsers
    });
    setIsGroupChat(false);
    setChatMessages([]);
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

    // Tüm kullanıcılara mı yoksa belirli birime mi gönderilecek?
    const targetUsers = selectedDepartment === 'all' 
      ? users 
      : users.filter(u => u.department === selectedDepartment);

    if (targetUsers.length === 0) {
      alert('Bu birimde kullanıcı bulunamadı.');
      return;
    }

    const messageSubject = selectedDepartment === 'all' 
      ? 'Karafiber Elyaf Duyurusu' 
      : `${selectedDepartment} Birimi Mesajı`;

    if (selectedDepartment === 'all' && !confirm(`Mesaj tüm kullanıcılara (${targetUsers.length} kişi) gönderilecek. Onaylıyor musunuz?`)) {
      return;
    }

    // Grup chat görünümüne geç ama henüz disable etme
    setSelectedChat({
      userId: 'group_' + selectedDepartment,
      userName: selectedDepartment === 'all' ? 'Tüm Karafiber Elyaf' : selectedDepartment,
      userDepartment: selectedDepartment === 'all' ? `${targetUsers.length} kişi` : `${targetUsers.length} kişi`,
      isGroup: true,
      members: targetUsers
    });
    setShowNewChat(false);
    
    // Mesajı grup üyelerine gönder
    setLoading(true);
    try {
      const sendPromises = targetUsers.map(recipient => {
        const messageData = {
          senderId: user.uid,
          senderName: user.fullName || user.displayName || user.email,
          senderDepartment: user.department || '',
          recipientId: recipient.id,
          recipientName: recipient.fullName || recipient.displayName || recipient.email,
          recipientDepartment: recipient.department || '',
          subject: messageSubject,
          content: messageInput.trim()
        };

        return sendMessage(messageData);
      });

      await Promise.all(sendPromises);
      
      // Chat'e mesajı ekle (görünüm için)
      const chatMessage = {
        id: Date.now(),
        senderId: user.uid,
        senderName: user.fullName || user.displayName || user.email,
        content: messageInput.trim(),
        createdAt: { toDate: () => new Date() },
        status: 'sent'
      };

      setChatMessages(prev => [...prev, chatMessage]);
      
      setMessageInput('');
      scrollToBottom();
    } catch (error) {
            alert('Mesajlar gönderilemedi!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="messages-page">
      <SimpleHeader />
      <div className="messages-container-chat">
        {(!isMobileView || !selectedChat) && (
        <div className="conversations-panel">
          <div className="conversations-header">
            <h2>Mesajlar</h2>
            <button className="new-chat-btn" onClick={() => setShowNewChat(true)}>
              <Send size={20} />
            </button>
          </div>          {showNewChat ? (
            <div className="new-chat-panel">
              <div className="new-chat-header">
                <button onClick={() => setShowNewChat(false)} className="back-btn">
                  <ArrowLeft size={20} />
                </button>
                <h3>Yeni Sohbet</h3>
              </div>
              
              <div className="users-list">
                {/* Kişiler Accordion */}
                <div 
                  className="list-section-header"
                  onClick={() => setIsUsersExpanded(!isUsersExpanded)}
                >
                  <div className="section-header-content">
                    <span className="section-title">Kişiler</span>
                    <span className="section-count">({filteredUsers.length})</span>
                  </div>
                  <ChevronDown 
                    size={20} 
                    className={`section-chevron ${isUsersExpanded ? 'expanded' : ''}`}
                  />
                </div>
                
                {/* Kullanıcılar */}
                {isUsersExpanded && filteredUsers.map(u => (
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

                {/* Birimler Accordion */}
                {departments && (
                  <>
                    <div 
                      className="list-section-header"
                      onClick={() => setIsDepartmentsExpanded(!isDepartmentsExpanded)}
                    >
                      <div className="section-header-content">
                        <span className="section-title">Birimler</span>
                        <span className="section-count">({departments.length + 1})</span>
                      </div>
                      <ChevronDown 
                        size={20} 
                        className={`section-chevron ${isDepartmentsExpanded ? 'expanded' : ''}`}
                      />
                    </div>
                    
                    {isDepartmentsExpanded && (
                      <>
                        <div
                          className="user-item department-item"
                          onClick={() => handleStartDepartmentChat('all')}
                        >
                          <div className="user-avatar department-avatar">
                            🏢
                          </div>
                          <div className="user-info-chat">
                            <div className="user-name-chat">Tüm Karafiber Elyaf</div>
                            <div className="user-dept">{users.length} kişi</div>
                          </div>
                        </div>
                        {departments.map(dept => {
                          const deptUsers = users.filter(u => u.department === dept);
                          return (
                            <div
                              key={dept}
                              className="user-item department-item"
                              onClick={() => handleStartDepartmentChat(dept)}
                            >
                              <div className="user-avatar department-avatar">
                                👥
                              </div>
                              <div className="user-info-chat">
                                <div className="user-name-chat">{dept}</div>
                                <div className="user-dept">{deptUsers.length} kişi</div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </>
                )}
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
        )}

        {(!isMobileView || selectedChat) && (
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
                {!isGroupChat && (
                  <button 
                    className="delete-conversation-btn" 
                    onClick={handleDeleteConversation}
                    title="Konuşmayı Sil"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              <div className="chat-messages">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message-bubble ${msg.senderId === user.uid ? 'sent' : 'received'}`}
                    onContextMenu={(e) => handleContextMenu(e, msg)}
                  >
                    <div className="message-content-bubble">{msg.content}</div>
                    <div className="message-footer">
                      <span className="message-time">{formatTime(msg.createdAt)}</span>
                      {msg.senderId === user.uid && (
                        <span className="message-status">
                          {msg.status === 'read' ? (
                            <CheckCheck size={20} className="status-read" />
                          ) : msg.status === 'delivered' ? (
                            <CheckCheck size={20} className="status-delivered" />
                          ) : (
                            <Check size={20} className="status-sent" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Context Menu */}
              {contextMenu && (
                <div 
                  className="context-menu"
                  style={{ 
                    top: contextMenu.y, 
                    left: contextMenu.x 
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="context-menu-item delete"
                    onClick={() => handleDeleteMessage(contextMenu.messageId)}
                  >
                    <Trash2 size={20} />
                    <span>Mesajı Sil</span>
                  </button>
                </div>
              )}

              <form className="chat-input" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder={isGroupChat ? "Grup mesajı yazın..." : "Mesaj yazın..."}
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
        )}
      </div>
    </div>
  );
};

export default Messages;

