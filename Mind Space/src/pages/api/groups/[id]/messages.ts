import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const groupId = parseInt(req.query.id as string);
  const userId = parseInt(session.user.id);
  
  if (isNaN(groupId)) {
    return res.status(400).json({ message: 'Invalid group ID' });
  }
  
  // Check if group exists and user is a member
  try {
    const groupCheck = await pool.query(
      'SELECT id FROM groups WHERE id = $1',
      [groupId]
    );
    
    if (groupCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    const memberCheck = await pool.query(
      'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, userId]
    );
    
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ message: 'You must be a member to access this group' });
    }
  } catch (error) {
    console.error('Error checking group membership:', error);
    return res.status(500).json({ message: 'Server error' });
  }
  
  switch (req.method) {
    case 'GET':
      try {
        // Get messages with user info
        const result = await pool.query(`
          SELECT 
            m.*,
            u.username,
            u.name,
            u.profile_picture
          FROM group_messages m
          JOIN users u ON m.user_id = u.id
          WHERE m.group_id = $1
          ORDER BY m.created_at ASC
        `, [groupId]);
        
        const messages = result.rows.map(message => ({
          ...message,
          user: {
            id: message.user_id,
            username: message.username,
            name: message.name,
            profile_picture: message.profile_picture
          }
        }));
        
        return res.status(200).json(messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        return res.status(500).json({ message: 'Error fetching messages' });
      }
      
    case 'POST':
      try {
        const { content } = req.body;
        
        if (!content) {
          return res.status(400).json({ message: 'Message content is required' });
        }
        
        // Add the message
        const result = await pool.query(
          'INSERT INTO group_messages (group_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
          [groupId, userId, content]
        );
        
        // Get user info for the response
        const userResult = await pool.query(
          'SELECT username, name, profile_picture FROM users WHERE id = $1',
          [userId]
        );
        
        const message = {
          ...result.rows[0],
          user: userResult.rows[0]
        };
        
        return res.status(201).json(message);
      } catch (error) {
        console.error('Error creating message:', error);
        return res.status(500).json({ message: 'Error creating message' });
      }
      
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}