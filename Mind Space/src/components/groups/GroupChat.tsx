import { useEffect, useState, useRef } from 'react';
import { GroupMessage, User } from '@/types';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';

interface GroupChatProps {
  groupId: number;
  groupName: string;
}

export default function GroupChat({ groupId, groupName }: GroupChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/messages`);
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMessages();
    
    // Set up a polling interval
    const interval = setInterval(fetchMessages, 5000);
    
    return () => clearInterval(interval);
  }, [groupId]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session) return;
    
    try {
      const response = await fetch(`/api/groups/${groupId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMessage }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'some time ago';
    }
  };
  
  if (loading) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <h3>{groupName}</h3>
        </div>
        <div className="chat-messages text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>{groupName}</h3>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <p>No messages yet. Be the first to say hello!</p>
          </div>
        ) : (
          messages.map(message => {
            const isCurrentUser = session && parseInt(session.user.id) === message.user_id;
            
            return (
              <div 
                key={message.id} 
                className={`message ${isCurrentUser ? 'outgoing' : ''}`}
              >
                <img 
                  src={message.user?.profile_picture || `https://ui-avatars.com/api/?name=${message.user?.name || message.user?.username || 'User'}&background=ff5e9b&color=fff`} 
                  alt={message.user?.name || message.user?.username || 'User'} 
                  className="message-avatar"
                />
                <div>
                  <div className="message-bubble">
                    {message.content}
                  </div>
                  <div className="message-meta">
                    {message.user?.name || message.user?.username || 'Anonymous'} • {formatDate(message.created_at)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input">
        <textarea
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        ></textarea>
        <button 
          className="btn btn-primary rounded-pill"
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <i className="bi bi-send"></i>
        </button>
      </div>
    </div>
  );
}