// D1 User Database Client
import { queryD1 } from './d1-client';

export interface User {
  id: string;
  email: string;
  password: string; // Hashed password
  name: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    console.log('[getUserByEmail] Looking for email:', email);
    const result = await queryD1(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    console.log('[getUserByEmail] Query result:', JSON.stringify(result, null, 2));
    
    if (result && result.results && result.results.length > 0) {
      console.log('[getUserByEmail] User found:', result.results[0].email);
      return result.results[0] as User;
    }
    
    console.log('[getUserByEmail] No user found');
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const result = await queryD1(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    
    if (result && result.results && result.results.length > 0) {
      return result.results[0] as User;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User | null> {
  const id = crypto.randomUUID();
  
  try {
    await queryD1(
      `INSERT INTO users (id, email, password, name, role) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, user.email, user.password, user.name, user.role]
    );
    
    return await getUserById(id);
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

export async function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User | null> {
  try {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.email !== undefined) {
      fields.push('email = ?');
      values.push(updates.email);
    }
    if (updates.password !== undefined) {
      fields.push('password = ?');
      values.push(updates.password);
    }
    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.role !== undefined) {
      fields.push('role = ?');
      values.push(updates.role);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    
    await queryD1(sql, values);
    
    return await getUserById(id);
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    await queryD1('DELETE FROM users WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const result = await queryD1(
      'SELECT id, email, name, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    
    if (result && result.results) {
      return result.results as User[];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}
