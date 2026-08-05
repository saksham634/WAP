import React, { useState, useRef, useEffect } from 'react';
import { chatAPI } from '../../api';
import '../../styles/chatbot.css';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm the WAP Assistant. Ask me anything about the portal." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const newMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const history = newMessages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-10) // keep last 10 turns, don't blow up token usage
        .map(m => ({ role: m.role, content: m.content }));

      const data = await chatAPI.sendMessage(trimmed, history);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chatbot-root">
      {isOpen && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <span>WAP Assistant</span>
            <button onClick={() => setIsOpen(false)} aria-label="Close chat">×</button>
          </div>
          <div className="chatbot-messages" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chatbot-bubble ${m.role}`}>{m.content}</div>
            ))}
            {loading && <div className="chatbot-bubble assistant chatbot-typing">Typing...</div>}
          </div>
          <div className="chatbot-input-row">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask something..."
              rows={1}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()}>Send</button>
          </div>
        </div>
      )}
      <button className="chatbot-fab" onClick={() => setIsOpen(o => !o)} aria-label="Toggle chat">
        {isOpen ? '×' : '💬'}
      </button>
    </div>
  );
}