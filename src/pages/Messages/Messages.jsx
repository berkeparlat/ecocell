import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { sendMessage, subscribeToConversations, subscribeToChat, getUsers, markConversationAsRead, uploadMessageFile } from '../../services/messageService';
import { Send, Inbox, ArrowLeft, User, Search, Paperclip, Check, CheckCheck, Download } from 'lucide-react';
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const chatEndRef = useRef(null);
  const chatUnsubscribeRef = useRef(null);
  const fileInputRef = useRef(null);

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
    if ((!messageInput.trim() && !selectedFile) || !selectedChat || loading) return;
    if (isGroupChat) return; // Grup chat için ayrı fonksiyon kullanılıyor

    setLoading(true);
    try {
      let fileData = null;
      if (selectedFile) {
        fileData = await uploadMessageFile(selectedFile, user.uid);
      }

      await sendMessage({
        senderId: user.uid,
        senderName: user.fullName || user.displayName || user.email,
        senderDepartment: user.department || '',
        recipientId: selectedChat.userId,
        recipientName: selectedChat.userName,
        recipientDepartment: selectedChat.userDepartment || '',
        subject: 'Sohbet',
        content: messageInput.trim() || (fileData ? '📎 Dosya' : ''),
        fileUrl: fileData?.url,
        fileName: fileData?.name,
        fileSize: fileData?.size,
        fileType: fileData?.type
      });

      setMessageInput('');
      setSelectedFile(null);
      scrollToBottom();
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      alert('Mesaj gönderilemedi!');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 10MB limit
      if (file.size > 10 * 1024 * 1024) {
        alert('Dosya boyutu 10MB\'dan küçük olmalıdır.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    setIsGroupChat(true);
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

    // Grup chat moduna geç
    setIsGroupChat(true);
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
      let fileData = null;
      if (selectedFile) {
        fileData = await uploadMessageFile(selectedFile, user.uid);
      }

      const sendPromises = targetUsers.map(recipient => {
        return sendMessage({
          senderId: user.uid,
          senderName: user.fullName || user.displayName || user.email,
          senderDepartment: user.department || '',
          recipientId: recipient.id,
          recipientName: recipient.fullName || recipient.displayName || recipient.email,
          recipientDepartment: recipient.department || '',
          subject: messageSubject,
          content: messageInput.trim(),
          fileUrl: fileData?.url,
          fileName: fileData?.name,
          fileSize: fileData?.size,
          fileType: fileData?.type
        });
      });

      await Promise.all(sendPromises);
      
      // Chat'e mesajı ekle (görünüm için)
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        senderId: user.uid,
        senderName: user.fullName || user.displayName || user.email,
        content: messageInput.trim(),
        createdAt: { toDate: () => new Date() },
        status: 'sent',
        fileUrl: fileData?.url,
        fileName: fileData?.name
      }]);
      
      setMessageInput('');
      setSelectedFile(null);
      scrollToBottom();
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
              
              <div className="search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Kullanıcı veya birim ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="users-list">
                {/* Birimler */}
                {!searchQuery && departments && (
                  <>
                    <div className="list-section-title">Birimler</div>
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
                    <div className="list-section-title">Kişiler</div>
                  </>
                )}
                
                {/* Kullanıcılar */}
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
                    {msg.fileUrl && (
                      <div className="message-file">
                        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="file-link">
                          <Paperclip size={16} />
                          <span>{msg.fileName}</span>
                          <Download size={14} />
                        </a>
                      </div>
                    )}
                    {msg.content && <div className="message-content-bubble">{msg.content}</div>}
                    <div className="message-footer">
                      <span className="message-time">{formatTime(msg.createdAt)}</span>
                      {msg.senderId === user.uid && (
                        <span className="message-status">
                          {msg.status === 'read' ? (
                            <CheckCheck size={16} className="status-read" />
                          ) : msg.status === 'delivered' ? (
                            <CheckCheck size={16} className="status-delivered" />
                          ) : (
                            <Check size={16} className="status-sent" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <form className="chat-input" onSubmit={handleSendMessage}>
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                />
                <button 
                  type="button" 
                  className="attach-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || isGroupChat}
                >
                  <Paperclip size={20} />
                </button>
                {selectedFile && (
                  <div className="selected-file">
                    <span>{selectedFile.name}</span>
                    <button type="button" onClick={removeFile}>×</button>
                  </div>
                )}
                <input
                  type="text"
                  placeholder={isGroupChat ? "Mesaj gönderildi..." : "Mesaj yazın..."}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  disabled={loading || isGroupChat}
                />
                <button type="submit" disabled={loading || (!messageInput.trim() && !selectedFile) || isGroupChat}>
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

