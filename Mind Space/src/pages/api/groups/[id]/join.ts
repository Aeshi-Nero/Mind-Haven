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
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // Check if group exists
    const groupCheck = await pool.query(
      'SELECT id FROM groups WHERE id = $1',
      [groupId]
    );
    
    if (groupCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is already a member
    const memberCheck = await pool.query(
      'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, userId]
    );
    
    if (memberCheck.rows.length > 0) {
      // User is already a member
      return res.status(200).json({ message: 'Already a member of this group' });
    }
    
    // Add user to group
    await pool.query(
      'INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)',
      [groupId, userId]
    );
    
    return res.status(200).json({ message: 'Successfully joined group' });
  } catch (error) {
    console.error('Error joining group:', error);
    return res.status(500).json({ message: 'Error joining group' });
  }
}