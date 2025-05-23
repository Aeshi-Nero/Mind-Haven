import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface PostFormProps {
  onPostCreated: () => void;
}

export default function PostForm({ onPostCreated }: PostFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      
      setContent('');
      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!session) return null;
  
  return (
    <div className="post-form">
      <form onSubmit={handleSubmit}>
        <div className="d-flex mb-3">
          <img 
            src={`https://ui-avatars.com/api/?name=${session.user.name || session.user.username}&background=ff5e9b&color=fff`} 
            alt="Profile" 
            className="avatar me-3"
          />
          <div className="flex-grow-1">
            <textarea
              className="post-input"
              placeholder="What's on your mind? Share your mental health journey..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
            ></textarea>
          </div>
        </div>
        
        <div className="post-submit">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Share Post'}
          </button>
        </div>
      </form>
    </div>
  );
}