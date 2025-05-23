import { NextApiRequest, NextApiResponse } from 'next';
import { hash } from 'bcryptjs';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    const { username, email, password, name } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    
    if (existingUser.rows.length > 0) {
      const duplicateField = existingUser.rows[0].username === username ? 'username' : 'email';
      return res.status(400).json({ message: `This ${duplicateField} is already in use` });
    }
    
    // Hash password
    const hashedPassword = await hash(password, 10);
    
    // Create user
    const result = await pool.query(
      'INSERT INTO users (username, email, password, name) VALUES ($1, $2, $3, $4) RETURNING id, username, email, name',
      [username, email, hashedPassword, name || null]
    );
    
    return res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ message: 'Error during registration' });
  }
}