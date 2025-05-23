import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Post, Comment } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function PostDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  useEffect(() => {
    const fetchPostAndComments = async () => {
      if (!id || !session) return;
      
      try {
        setLoading(true);
        const postResponse = await fetch(`/api/posts/${id}`);
        
        if (!postResponse.ok) {
          router.push('/');
          return;
        }
        
        const postData = await postResponse.json();
        setPost(postData);
        
        const commentsResponse = await fetch(`/api/posts/${id}/comments`);
        
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json();
          setComments(commentsData);
        }
      } catch (error) {
        console.error('Error fetching post details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPostAndComments();
  }, [id, session, router]);
  
  const handleLike = async () => {
    if (!post || !session) return;
    
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setPost({
          ...post,
          likes_count: post.likes_count + 1,
        });
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };
  
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !post || !session) return;
    
    try {
      setSubmitting(true);
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });
      
      if (response.ok) {
        const comment = await response.json();
        setComments([...comments, comment]);
        setNewComment('');
        
        // Update comment count in post
        setPost({
          ...post,
          comments_count: post.comments_count + 1,
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDeletePost = async () => {
    if (!post || !session) return;
    
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        router.push('/');
      } else {
        alert('Failed to delete post');
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('An error occurred while deleting the post');
      setIsDeleting(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'some time ago';
    }
  };
  
  const isOwnPost = post && session && parseInt(session.user.id) === post.user_id;
  
  if (status === 'loading' || (loading && status === 'authenticated')) {
    return (
      <Layout title="Loading...">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!session) {
    return null; // Will redirect in the useEffect
  }
  
  if (!post) {
    return (
      <Layout title="Post Not Found">
        <div className="container py-5 text-center">
          <h2>Post not found</h2>
          <p>The post you're looking for doesn't exist or you don't have permission to view it.</p>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => router.push('/')}
          >
            Back to Home
          </button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Post Detail - Mind Haven">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
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
                  </div>
                  
                  {isOwnPost && (
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={handleDeletePost}
                      disabled={isDeleting}
                    >
                      <i className="bi bi-trash"></i> {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
                
                <div className="post-content my-4">
                  {post.content}
                </div>
                
                <div className="post-actions">
                  <div className="post-action" onClick={handleLike}>
                    <i className="bi bi-heart"></i>
                    <span>Like{post.likes_count > 0 ? ` (${post.likes_count})` : ''}</span>
                  </div>
                  
                  <div className="post-action">
                    <i className="bi bi-chat"></i>
                    <span>Comment{post.comments_count > 0 ? ` (${post.comments_count})` : ''}</span>
                  </div>
                  
                  <div className="post-action">
                    <i className="bi bi-share"></i>
                    <span>Share</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="mb-4">Add a Comment</h5>
                <form onSubmit={handleAddComment}>
                  <div className="d-flex">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${session.user.name || session.user.username}&background=ff5e9b&color=fff`} 
                      alt="Profile" 
                      className="avatar me-3"
                    />
                    <div className="flex-grow-1">
                      <textarea
                        className="form-control"
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                        disabled={submitting}
                      ></textarea>
                      <div className="text-end mt-2">
                        <button 
                          type="submit" 
                          className="btn btn-primary"
                          disabled={!newComment.trim() || submitting}
                        >
                          {submitting ? 'Posting...' : 'Post Comment'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            
            <div className="card">
              <div className="card-body">
                <h5 className="mb-4">Comments ({comments.length})</h5>
                
                {comments.length === 0 ? (
                  <div className="text-center py-3 text-muted">
                    No comments yet. Be the first to comment!
                  </div>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="d-flex mb-4">
                      <Link href={`/profile/${comment.user_id}`}>
                        <img 
                          src={comment.user?.profile_picture || `https://ui-avatars.com/api/?name=${comment.user?.name || comment.user?.username || 'User'}&background=ff5e9b&color=fff`} 
                          alt={comment.user?.name || comment.user?.username || 'User'} 
                          className="avatar me-3"
                        />
                      </Link>
                      <div>
                        <div className="bg-light p-3 rounded">
                          <div className="mb-1">
                            <Link href={`/profile/${comment.user_id}`} className="fw-bold text-decoration-none">
                              {comment.user?.name || comment.user?.username || 'Anonymous User'}
                            </Link>
                          </div>
                          <div>{comment.content}</div>
                        </div>
                        <div className="text-muted small mt-1">
                          {formatDate(comment.created_at)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}