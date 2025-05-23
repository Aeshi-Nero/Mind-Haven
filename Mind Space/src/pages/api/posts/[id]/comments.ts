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
  
  switch (req.method) {
    case 'GET':
      try {
        // Check if post exists
        const postCheck = await pool.query(
          'SELECT id FROM posts WHERE id = $1',
          [postId]
        );
        
        if (postCheck.rows.length === 0) {
          return res.status(404).json({ message: 'Post not found' });
        }
        
        // Get comments with user info
        const result = await pool.query(`
          SELECT 
            c.*,
            u.username,
            u.name,
            u.profile_picture
          FROM comments c
          JOIN users u ON c.user_id = u.id
          WHERE c.post_id = $1
          ORDER BY c.created_at ASC
        `, [postId]);
        
        const comments = result.rows.map(comment => ({
          ...comment,
          user: {
            id: comment.user_id,
            username: comment.username,
            name: comment.name,
            profile_picture: comment.profile_picture
          }
        }));
        
        return res.status(200).json(comments);
      } catch (error) {
        console.error('Error fetching comments:', error);
        return res.status(500).json({ message: 'Error fetching comments' });
      }
      
    case 'POST':
      try {
        // Check if post exists
        const postCheck = await pool.query(
          'SELECT id FROM posts WHERE id = $1',
          [postId]
        );
        
        if (postCheck.rows.length === 0) {
          return res.status(404).json({ message: 'Post not found' });
        }
        
        const { content } = req.body;
        
        if (!content) {
          return res.status(400).json({ message: 'Comment content is required' });
        }
        
        // Add the comment
        const result = await pool.query(
          'INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
          [postId, userId, content]
        );
        
        // Get user info for the response
        const userResult = await pool.query(
          'SELECT username, name, profile_picture FROM users WHERE id = $1',
          [userId]
        );
        
        const comment = {
          ...result.rows[0],
          user: userResult.rows[0]
        };
        
        return res.status(201).json(comment);
      } catch (error) {
        console.error('Error creating comment:', error);
        return res.status(500).json({ message: 'Error creating comment' });
      }
      
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}