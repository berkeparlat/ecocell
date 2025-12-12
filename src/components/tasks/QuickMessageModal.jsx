import { useState, useEffect } from 'react';
import { X, Send, User } from 'lucide-react';
import { sendMessage, getUsers } from '../../services/messageService';
import { useApp } from '../../context/AppContext';
import './QuickMessageModal.css';

const QuickMessageModal = ({ task, onClose }) => {
  const { user } = useApp();
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [sendToAll, setSendToAll] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    loadRecipients();
  }, [task]);

  const loadRecipients = async () => {
    setLoadingUsers(true);
    
    const allUsers = await getUsers();
    
    // Göndericinin kendisi hariç, task'ın departmanına ait kullanıcıları filtrele
    const filteredUsers = allUsers.filter(u => {
      if (u.id === user.uid) return false;
      if (!task.relatedDepartment || task.relatedDepartment === 'Belirtilmemiş') {
        return true;
      }
      return u.department === task.relatedDepartment;
    });
    
    setRecipients(filteredUsers);
    
    // İlk seçenek olarak "Tüm Birim" seçeneğini ayarla
    if (filteredUsers.length > 1 && task.relatedDepartment && task.relatedDepartment !== 'Belirtilmemiş') {
      setSendToAll(true);
    } else if (filteredUsers.length > 0) {
      setSelectedRecipient(filteredUsers[0].id);
    }
    
    setLoadingUsers(false);
  };
  const handleSend = async () => {
    if (!messageContent.trim()) {
      alert('Lütfen mesaj yazın.');
      return;
    }

    if (!sendToAll && !selectedRecipient) {
      alert('Lütfen alıcı seçin.');
      return;
    }

    setLoading(true);
    
    try {
      
      const senderName = user?.fullName || user?.username || user?.email || 'Bilinmeyen';
      const senderDept = user?.department || 'Belirtilmemiş';
      
      if (sendToAll) {
        // Tüm birime gönder
        await Promise.all(recipients.map(recipient => 
          sendMessage({
            senderId: user.uid,
            senderName,
            senderDepartment: senderDept,
            recipientId: recipient.id,
            recipientName: recipient.fullName || recipient.displayName || recipient.email,
            recipientDepartment: recipient.department || 'Belirtilmemiş',
            content: messageContent,
            subject: `İş hakkında: ${task.title}`,
            relatedTaskId: task.id
          })
        ));
        alert(`Mesaj ${recipients.length} kişiye gönderildi.`);
      } else {
        // Tek kişiye gönder
        const recipient = recipients.find(r => r.id === selectedRecipient);
        if (!recipient) {
          setLoading(false);
          alert('Alıcı bulunamadı.');
          return;
        }

        await sendMessage({
          senderId: user.uid,
          senderName,
          senderDepartment: senderDept,
          recipientId: recipient.id,
          recipientName: recipient.fullName || recipient.displayName || recipient.email,
          recipientDepartment: recipient.department || 'Belirtilmemiş',
          content: messageContent,
          subject: `İş hakkında: ${task.title}`,
          relatedTaskId: task.id
        });
        alert('Mesaj gönderildi.');
      }
      
      onClose();
    } catch (error) {
      alert('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quick-message-modal-overlay" onClick={onClose}>
      <div className="quick-message-modal" onClick={(e) => e.stopPropagation()}>
        <div className="quick-message-header">
          <h3>Hızlı Mesaj Gönder</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="quick-message-body">
          <div className="task-info">
            <strong>İş:</strong> {task.title}
            {task.relatedDepartment && (
              <span className="task-dept"> • {task.relatedDepartment}</span>
            )}
          </div>          <div className="form-group">
            <label htmlFor="recipient">Alıcı</label>
            {loadingUsers ? (
              <div className="loading-text">Kullanıcılar yükleniyor...</div>
            ) : recipients.length === 0 ? (
              <div className="no-users-text">
                {task.relatedDepartment && task.relatedDepartment !== 'Belirtilmemiş' 
                  ? `${task.relatedDepartment} departmanında kullanıcı bulunamadı.`
                  : 'Hiç kullanıcı bulunamadı.'}
              </div>
            ) : (
              <>
                {recipients.length > 1 && task.relatedDepartment && task.relatedDepartment !== 'Belirtilmemiş' && (
                  <div className="send-to-all-option">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={sendToAll}
                        onChange={(e) => {
                          setSendToAll(e.target.checked);
                          if (!e.target.checked && recipients.length > 0) {
                            setSelectedRecipient(recipients[0].id);
                          }
                        }}
                        disabled={loading}
                      />
                      <span>Tüm {task.relatedDepartment} birimine gönder ({recipients.length} kişi)</span>
                    </label>
                  </div>
                )}
                
                {!sendToAll && (
                  <select
                    id="recipient"
                    value={selectedRecipient}
                    onChange={(e) => setSelectedRecipient(e.target.value)}
                    disabled={loading}
                  >
                    {recipients.map(recipient => (
                      <option key={recipient.id} value={recipient.id}>
                        {recipient.fullName || recipient.displayName || recipient.email}
                        {recipient.department && ` (${recipient.department})`}
                      </option>
                    ))}
                  </select>
                )}
              </>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="message">Mesaj</label>
            <textarea
              id="message"
              rows="6"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Mesajınızı buraya yazın..."
              disabled={loading || recipients.length === 0}
            />
          </div>
        </div>

        <div className="quick-message-footer">
          <button 
            className="cancel-btn" 
            onClick={onClose}
            disabled={loading}
          >
            İptal
          </button>
          <button 
            className="send-btn" 
            onClick={handleSend}
            disabled={loading || !messageContent.trim() || recipients.length === 0}
          >
            {loading ? (
              'Gönderiliyor...'
            ) : (
              <>
                <Send size={16} />
                Gönder
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickMessageModal;
