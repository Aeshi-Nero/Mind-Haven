import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const postId = parseInt(req.query.id as string);
  const userId = parseInt(session.user.id);
  
  if (isNaN(postId)) {
    return res.status(400).json({ message: 'Invalid post ID' });
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // Check if post exists
    const postCheck = await pool.query(
      'SELECT id FROM posts WHERE id = $1',
      [postId]
    );
    
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user already liked the post
    const likeCheck = await pool.query(
      'SELECT id FROM likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );
    
    if (likeCheck.rows.length > 0) {
      // User already liked the post, so we'll return success without action
      return res.status(200).json({ message: 'Post already liked' });
    }
    
    // Add the like
    await pool.query(
      'INSERT INTO likes (post_id, user_id) VALUES ($1, $2)',
      [postId, userId]
    );
    
    // Get updated like count
    const likesCount = await pool.query(
      'SELECT COUNT(*) as count FROM likes WHERE post_id = $1',
      [postId]
    );
    
    return res.status(200).json({ 
      message: 'Post liked',
      likes: parseInt(likesCount.rows[0].count)
    });
  } catch (error) {
    console.error('Error liking post:', error);
    return res.status(500).json({ message: 'Error liking post' });
  }
}