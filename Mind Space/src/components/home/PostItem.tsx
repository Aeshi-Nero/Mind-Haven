import { Post } from '@/types';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

interface PostItemProps {
  post: Post;
  onLike: () => void;
  onDelete?: (postId: number) => void;
}

export default function PostItem({ post, onLike, onDelete }: PostItemProps) {
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'some time ago';
    }
  };
  
  const isOwnPost = session && parseInt(session.user.id) === post.user_id;
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        if (onDelete) onDelete(post.id);
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('An error occurred while deleting the post');
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="post-card">
      <div className="post-header">
        <Link href={`/profile/${post.user_id}`}>
          <img 
            src={post.user?.profile_picture || `https://ui-avatars.com/api/?name=${post.user?.name || post.user?.username || 'User'}&background=ff5e9b&color=fff`} 
            alt={post.user?.name || post.user?.username || 'User'} 
            className="avatar"
          />
        </Link>
        <div className="ms-3">
          <Link href={`/profile/${post.user_id}`} className="post-author text-decoration-none">
            {post.user?.name || post.user?.username || 'Anonymous User'}
          </Link>
          <div className="post-time">{formatDate(post.created_at)}</div>
        </div>
        
        {isOwnPost && (
          <div className="ms-auto">
            <button 
              className="btn btn-sm btn-outline-danger" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <i className="bi bi-trash"></i> {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>
      
      <div className="post-content">
        {post.content}
      </div>
      
      <div className="post-actions">
        <div className="post-action" onClick={onLike}>
          <i className="bi bi-heart"></i>
          <span>Like{post.likes_count > 0 ? ` (${post.likes_count})` : ''}</span>
        </div>
        
        <Link href={`/post/${post.id}`} className="post-action text-decoration-none">
          <i className="bi bi-chat"></i>
          <span>Comment{post.comments_count > 0 ? ` (${post.comments_count})` : ''}</span>
        </Link>
        
        <div className="post-action">
          <i className="bi bi-share"></i>
          <span>Share</span>
        </div>
      </div>
    </div>
  );
}