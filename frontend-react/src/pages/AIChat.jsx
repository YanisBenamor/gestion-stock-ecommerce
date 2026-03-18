import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Layout from '../Layout';
import { apiPost, apiGet, clearAuthToken } from '../utils/api';
import '../styles/AIChat.css';

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Charger les infos utilisateur
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await apiGet('/user');
        setUser(userData);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        clearAuthToken();
        navigate('/login');
      }
    };
    loadUser();
  }, [navigate]);

  const handleLogout = () => {
    clearAuthToken();
    navigate('/login');
  };

  // Auto-scroll vers le dernier message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Quick Actions - questions prédéfinies
  const quickActions = [
    {
      id: 1,
      label: '📊 État des stocks',
      question: 'Résumé de mon inventaire',
      icon: '📊',
    },
    {
      id: 2,
      label: '📦 Conseils de réappro',
      question: 'Quels produits je dois restock?',
      icon: '📦',
    },
    {
      id: 3,
      label: '📈 Résumé de la journée',
      question: 'Montre moi les derniers mouvements',
      icon: '📈',
    },
  ];

  // Envoyer message
  const handleSendMessage = async (text = inputValue) => {
    if (!text.trim()) return;

    // Ajouter message utilisateur au chat
    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setIsLoading(true);

    try {
      // Appel API - NOTE: l'endpoint attend 'question', pas 'message'
      const data = await apiPost('/ai/chat', { question: text });
      console.log("DEBUG IA:", data);

      // Ajouter message IA au chat
      if (data && data.response) {
        const newAiMessage = {
          role: 'ai',
          content: data.response,
          model: data.ai_model,
        };
        setMessages((prev) => [...prev, newAiMessage]);
      } else {
        throw new Error('Pas de réponse du serveur');
      }
    } catch (error) {
      console.error('Erreur lors de la requête IA:', error);
      const errorMessage = {
        role: 'ai',
        content:
          "⚠️ Désolé, j'ai rencontré une erreur. Veuillez réessayer.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  // Gérer appui sur Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Click sur Quick Action
  const handleQuickAction = (question) => {
    handleSendMessage(question);
  };

  return (
    <Layout title="Assistant IA" user={user} onLogout={handleLogout}>
      <div className="ai-chat-main">
        {/* Messages Area */}
        <div className="ai-messages-container">
          {messages.length === 0 ? (
            <div className="ai-empty-state">
              <div className="ai-empty-icon">🤖</div>
              <h3>Bienvenue sur l'Assistant IA</h3>
              <p>Posez des questions sur votre inventaire et je vous aiderai!</p>
              <p className="ai-empty-hint">Utilisez les boutons ci-dessous ou tapez directement</p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`ai-message-row ai-message-row-${message.role}`}
                >
                  {message.role === 'ai' && (
                    <div className="ai-avatar">
                      <span className="ai-avatar-icon">🤖</span>
                    </div>
                  )}
                  <div className="ai-message-bubble">
                    {/* Render avec Markdown pour supporter les images */}
                    <div className="ai-message-content">
                      <ReactMarkdown
                        components={{
                          img: ({node, ...props}) => (
                            <img 
                              {...props} 
                              className="ai-message-image"
                              alt={props.alt || 'Produit'}
                            />
                          ),
                          p: ({node, children}) => (
                            <p className="ai-message-paragraph">{children}</p>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    {message.model && (
                      <span className="ai-message-model">
                        {message.model === 'groq-llama3'
                          ? '⚡ Groq'
                          : message.model === 'openai-gpt3.5'
                          ? '🚀 OpenAI'
                          : '✨ Smart'}
                      </span>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="user-avatar">
                      <span className="user-avatar-icon">
                        {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="ai-message-row ai-message-row-ai">
                  <div className="ai-avatar">
                    <span className="ai-avatar-icon">🤖</span>
                  </div>
                  <div className="ai-message-bubble ai-typing-bubble">
                    <span className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Quick Actions - visible quand pas de messages */}
        {messages.length === 0 && !isLoading && (
          <div className="ai-quick-actions">
            <p className="ai-quick-title">Suggestions rapides:</p>
            <div className="ai-quick-buttons">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  className="ai-quick-button"
                  onClick={() => handleQuickAction(action.question)}
                >
                  <span className="ai-quick-icon">{action.icon}</span>
                  <span className="ai-quick-label">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="ai-input-container">
          {/* Quick Actions - version compacte sur mobile/when messages exist */}
          {messages.length > 0 && !isLoading && (
            <div className="ai-quick-actions-compact">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  className="ai-quick-button-compact"
                  onClick={() => handleQuickAction(action.question)}
                  title={action.question}
                >
                  {action.icon}
                </button>
              ))}
            </div>
          )}

          {/* Message Input */}
          <div className="ai-input-wrapper">
            <textarea
              className="ai-input"
              placeholder="Posez une question sur votre inventaire..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              rows="1"
            />
            <button
              className="ai-send-button"
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              title="Envoyer (Entrée)"
            >
              {isLoading ? (
                <span className="ai-loading-spinner">⟳</span>
              ) : (
                <span>➤</span>
              )}
            </button>
          </div>

          {/* Info Footer */}
          <p className="ai-input-hint">
            💡 Demandez l'état des stocks, des conseils de réappro, ou des statistiques
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AIChat;
