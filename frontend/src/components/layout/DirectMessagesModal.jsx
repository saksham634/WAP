import React, { useEffect, useState } from 'react';
import { messageAPI, userAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function DirectMessagesModal({ isOpen, onClose }) {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' | 'compose'
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usersList, setUsersList] = useState([]);
  
  // Compose form state
  const [recipientRole, setRecipientRole] = useState(role === 'ROLE_EMPLOYEE' ? 'ROLE_HR' : 'ROLE_EMPLOYEE');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [category, setCategory] = useState('REQUEST');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      loadUsers();
    }
  }, [isOpen]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await messageAPI.getInbox();
      const cleanData = (Array.isArray(data) ? data : []).filter(
        (m) =>
          !m.subject?.includes('Policy Clarification') &&
          !m.subject?.includes('System Access & Permissions') &&
          !m.content?.includes('leave balance rollover') &&
          !m.content?.includes('Project Analytics dashboard')
      );
      setMessages(cleanData);
    } catch (err) {
      console.error('Failed to load inbox messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await messageAPI.deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const users = await userAPI.getAllUsers();
      if (Array.isArray(users)) {
        setUsersList(users);
        if (users.length > 0) {
          setRecipientEmail(users[0].email);
        }
      }
    } catch (err) {
      console.error('Failed to load user list for messaging:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      await messageAPI.sendMessage({
        recipientRole: recipientRole === 'SPECIFIC_USER' ? null : recipientRole,
        recipientEmail: recipientRole === 'SPECIFIC_USER' ? recipientEmail : null,
        category,
        subject,
        content,
      });

      setFeedback({ type: 'success', text: 'Message sent successfully!' });
      setSubject('');
      setContent('');
      setTimeout(() => {
        setActiveTab('inbox');
        fetchMessages();
        setFeedback(null);
      }, 1000);
    } catch (err) {
      console.error('Failed to send message:', err);
      setFeedback({ type: 'error', text: err.message || 'Failed to send message.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content-card"
        style={{ maxWidth: '640px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#e6f4f4',
                color: '#007a7a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}
            >
              <i className="fa-solid fa-comments"></i>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a' }}>
                Direct Messages & Requests
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                Send & receive internal organizational updates
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Tab Header */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            padding: '0 24px',
          }}
        >
          <button
            onClick={() => setActiveTab('inbox')}
            style={{
              padding: '12px 18px',
              border: 'none',
              backgroundColor: 'transparent',
              fontWeight: 600,
              fontSize: '14px',
              color: activeTab === 'inbox' ? '#007a7a' : '#64748b',
              borderBottom: activeTab === 'inbox' ? '3px solid #007a7a' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <i className="fa-solid fa-inbox"></i> Inbox / Received ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab('compose')}
            style={{
              padding: '12px 18px',
              border: 'none',
              backgroundColor: 'transparent',
              fontWeight: 600,
              fontSize: '14px',
              color: activeTab === 'compose' ? '#007a7a' : '#64748b',
              borderBottom: activeTab === 'compose' ? '3px solid #007a7a' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <i className="fa-solid fa-paper-plane"></i> Send Message / Request
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="modal-body">
          {activeTab === 'inbox' ? (
            <div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', color: '#007a7a', marginBottom: '8px' }}></i>
                  <p style={{ margin: 0, fontSize: '14px' }}>Loading inbox messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <i className="fa-solid fa-inbox" style={{ fontSize: '36px', color: '#cbd5e1', marginBottom: '12px' }}></i>
                  <h4 style={{ margin: '0 0 6px 0', color: '#334155' }}>Your Inbox is Empty</h4>
                  <p style={{ margin: 0, fontSize: '13px' }}>You haven't received any direct messages or requests yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {messages.map((m) => (
                    <div
                      key={m.id || Math.random()}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <strong style={{ color: '#0f172a', fontSize: '14px' }}>
                            {m.senderName || 'Staff Member'}
                          </strong>
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              backgroundColor: '#e6f4f4',
                              color: '#007a7a',
                              fontWeight: 600,
                            }}
                          >
                            {(m.senderRole || '').replace('ROLE_', '')}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              backgroundColor: '#e2e8f0',
                              color: '#475569',
                              fontWeight: 600,
                            }}
                          >
                            {m.category || 'GENERAL'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                            {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Recent'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteMessage(m.id, e)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#94a3b8',
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="Delete Message"
                          >
                            <i className="fa-solid fa-trash-can" style={{ fontSize: '13px' }}></i>
                          </button>
                        </div>
                      </div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#1e293b', fontWeight: 600 }}>
                        {m.subject}
                      </h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                        {m.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {feedback && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    backgroundColor: feedback.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: feedback.type === 'success' ? '#166534' : '#991b1b',
                    border: `1px solid ${feedback.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                  }}
                >
                  {feedback.text}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Send To (Recipient)
                </label>
                <select
                  value={recipientRole}
                  onChange={(e) => setRecipientRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                >
                  {role !== 'ROLE_HR' && <option value="ROLE_HR">HR Manager</option>}
                  {role !== 'ROLE_ADMIN' && <option value="ROLE_ADMIN">System Administrator</option>}
                  <option value="SPECIFIC_USER">Specific Staff Member</option>
                  <option value="ALL">All Company Staff</option>
                </select>
              </div>

              {recipientRole === 'SPECIFIC_USER' && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Select Staff Member
                  </label>
                  <select
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  >
                    {usersList.map((u) => (
                      <option key={u.id} value={u.email}>
                        {u.fullName} ({u.email}) - {u.role ? u.role.replace('ROLE_', '') : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                >
                  <option value="REQUEST">Official Request</option>
                  <option value="UPDATE">Work Update</option>
                  <option value="GENERAL">General Inquiry</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Request for Attendance Correction / Project Clarification"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Message Content
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type your message or request details..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ width: '100%', padding: '12px', marginTop: '8px' }}
              >
                <i className="fa-solid fa-paper-plane"></i>
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
