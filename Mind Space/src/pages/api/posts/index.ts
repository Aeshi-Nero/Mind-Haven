import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const userId = parseInt(session.user.id);
  
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
          ORDER BY p.created_at DESC
        `);
        
        const posts = result.rows.map(post => ({
          ...post,
          user: {
            id: post.user_id,
            username: post.username,
            name: post.name,
            profile_picture: post.profile_picture
          }
        }));
        
        return res.status(200).json(posts);
      } catch (error) {
        console.error('Error fetching posts:', error);
        return res.status(500).json({ message: 'Error fetching posts' });
      }
      
    case 'POST':
      try {
        const { content } = req.body;
        
        if (!content) {
          return res.status(400).json({ message: 'Content is required' });
        }
        
        const result = await pool.query(
          'INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING *',
          [userId, content]
        );
        
        // Get user info for the response
        const userResult = await pool.query(
          'SELECT username, name, profile_picture FROM users WHERE id = $1',
          [userId]
        );
        
        const post = {
          ...result.rows[0],
          likes_count: 0,
          comments_count: 0,
          user: userResult.rows[0]
        };
        
        return res.status(201).json(post);
      } catch (error) {
        console.error('Error creating post:', error);
        return res.status(500).json({ message: 'Error creating post' });
      }
      
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}