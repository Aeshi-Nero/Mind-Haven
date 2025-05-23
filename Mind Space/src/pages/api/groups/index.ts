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
            g.*,
            (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS member_count
          FROM groups g
          ORDER BY g.created_at DESC
        `);
        
        return res.status(200).json(result.rows);
      } catch (error) {
        console.error('Error fetching groups:', error);
        return res.status(500).json({ message: 'Error fetching groups' });
      }
      
    case 'POST':
      try {
        const { name, description } = req.body;
        
        if (!name || !description) {
          return res.status(400).json({ message: 'Group name and description are required' });
        }
        
        // Begin transaction
        await pool.query('BEGIN');
        
        // Create the group
        const groupResult = await pool.query(
          'INSERT INTO groups (name, description, created_by) VALUES ($1, $2, $3) RETURNING *',
          [name, description, userId]
        );
        
        const groupId = groupResult.rows[0].id;
        
        // Add the creator as a member
        await pool.query(
          'INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)',
          [groupId, userId]
        );
        
        // Commit transaction
        await pool.query('COMMIT');
        
        return res.status(201).json({
          ...groupResult.rows[0],
          member_count: 1
        });
      } catch (error) {
        // Rollback transaction on error
        await pool.query('ROLLBACK');
        console.error('Error creating group:', error);
        return res.status(500).json({ message: 'Error creating group' });
      }
      
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}