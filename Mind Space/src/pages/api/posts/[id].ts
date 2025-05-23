import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const postId = parseInt(req.query.id as string);
  
  if (isNaN(postId)) {
    return res.status(400).json({ message: 'Invalid post ID' });
  }
  
  switch (req.method) {
    case 'GET':
      try {
        const result = await pool.query(`
          SELECT 
            p.*,
            u.username,
            u.name,
            u.profile_picture,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments_count
          FROM posts p
          JOIN users u ON p.user_id = u.id
          WHERE p.id = $1
        `, [postId]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Post not found' });
        }
        
        const post = {
          ...result.rows[0],
          user: {
            id: result.rows[0].user_id,
            username: result.rows[0].username,
            name: result.rows[0].name,
            profile_picture: result.rows[0].profile_picture
          }
        };
        
        return res.status(200).json(post);
      } catch (error) {
        console.error('Error fetching post:', error);
        return res.status(500).json({ message: 'Error fetching post' });
      }
      
    case 'DELETE':
      try {
        const userId = parseInt(session.user.id);
        
        // Check if the post belongs to the user
        const checkResult = await pool.query(
          'SELECT user_id FROM posts WHERE id = $1',
          [postId]
        );
        
        if (checkResult.rows.length === 0) {
          return res.status(404).json({ message: 'Post not found' });
        }
        
        if (checkResult.rows[0].user_id !== userId) {
          return res.status(403).json({ message: 'You can only delete your own posts' });
        }
        
        await pool.query(
          'DELETE FROM posts WHERE id = $1',
          [postId]
        );
        
        return res.status(200).json({ message: 'Post deleted' });
      } catch (error) {
        console.error('Error deleting post:', error);
        return res.status(500).json({ message: 'Error deleting post' });
      }
      
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}