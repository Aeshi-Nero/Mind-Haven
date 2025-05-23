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
  
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // Check if group exists and user is the creator
    const groupCheck = await pool.query(
      'SELECT created_by FROM groups WHERE id = $1',
      [groupId]
    );
    
    if (groupCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    if (groupCheck.rows[0].created_by !== userId) {
      return res.status(403).json({ message: 'Only the group creator can delete this group' });
    }
    
    // Delete the group (this will cascade to delete group members and messages)
    await pool.query('DELETE FROM groups WHERE id = $1', [groupId]);
    
    return res.status(200).json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    return res.status(500).json({ message: 'Error deleting group' });
  }
}