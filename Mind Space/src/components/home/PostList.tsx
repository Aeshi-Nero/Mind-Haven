import { useEffect, useState } from 'react';
import { Post } from '@/types';
import PostItem from './PostItem';

interface PostListProps {
  refreshTrigger: number;
}

export default function PostList({ refreshTrigger }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/posts');
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data = await response.json();
      setPosts(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPosts();
  }, [refreshTrigger]);
  
  const handleLike = async (postId: number) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to like post');
      }
      
      // Update the post in the state
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes_count: post.likes_count + 1,
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error liking post:', error);
      alert('Failed to like post. Please try again.');
    }
  };
  
  const handleDelete = (postId: number) => {
    setPosts(posts.filter(post => post.id !== postId));
  };
  
  if (loading && posts.length === 0) {
    return <div className="text-center py-5">Loading posts...</div>;
  }
  
  if (error && posts.length === 0) {
    return (
      <div className="alert alert-danger">
        {error}
        <button 
          className="btn btn-outline-danger ms-3"
          onClick={fetchPosts}
        >
          Retry
        </button>
      </div>
    );
  }
  
  if (posts.length === 0) {
    return (
      <div className="alert alert-info">
        No posts yet. Be the first to share!
      </div>
    );
  }
  
  return (
    <div>
      {posts.map(post => (
        <PostItem 
          key={post.id} 
          post={post} 
          onLike={() => handleLike(post.id)}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}