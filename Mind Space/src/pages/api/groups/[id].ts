import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
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
  
  switch (req.method) {
    case 'GET':
      try {
        // Get group info
        const groupResult = await pool.query(`
          SELECT 
            g.*,
            (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS member_count
          FROM groups g
          WHERE g.id = $1
        `, [groupId]);
        
        if (groupResult.rows.length === 0) {
          return res.status(404).json({ message: 'Group not found' });
        }
        
        // Check if user is a member
        const memberResult = await pool.query(
          'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
          [groupId, userId]
        );
        
        const isMember = memberResult.rows.length > 0;
        
        return res.status(200).json({
          group: groupResult.rows[0],
          isMember
        });
      } catch (error) {
        console.error('Error fetching group:', error);
        return res.status(500).json({ message: 'Error fetching group' });
      }
      
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}