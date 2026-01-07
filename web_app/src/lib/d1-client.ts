// Cloudflare D1 Database Client for API Routes
// This connects to the remote D1 database via HTTP API

import { Project } from './db';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_DATABASE_ID = process.env.CLOUDFLARE_DATABASE_ID || '908f42f0-ad4d-4ce0-b3a2-9bb13cf54795';
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

// Proxy configuration
const HTTP_PROXY = process.env.HTTP_PROXY || process.env.http_proxy;
const HTTPS_PROXY = process.env.HTTPS_PROXY || process.env.https_proxy;

// Create proxy agent if proxy is configured
const proxyAgent = HTTPS_PROXY ? new HttpsProxyAgent(HTTPS_PROXY) : undefined;

// Export proxy agent for use in other modules
export { proxyAgent };

// D1 HTTP API client
export async function queryD1(sql: string, params: any[] = []): Promise<any> {
  console.log('[D1 Client] Using Database ID:', CLOUDFLARE_DATABASE_ID);
  console.log('[D1 Client] Account ID:', CLOUDFLARE_ACCOUNT_ID);
  console.log('[D1 Client] Proxy:', HTTPS_PROXY || 'None');
  console.log('[D1 Client] SQL:', sql);
  
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    throw new Error('Cloudflare credentials not configured. Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in .env.local');
  }

  try {
    // Configure fetch options with proxy agent
    const fetchOptions: any = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql,
        params
      }),
    };

    // Add proxy agent if configured
    if (proxyAgent) {
      fetchOptions.agent = proxyAgent;
      console.log('[D1 Client] Using proxy agent');
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${CLOUDFLARE_DATABASE_ID}/query`,
      fetchOptions
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`D1 API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return data.result[0];
    } else {
      throw new Error(data.errors?.[0]?.message || 'Query failed');
    }
  } catch (error) {
    console.error('D1 HTTP API Error:', error);
    throw error;
  }
}

// Helper functions for common operations
export async function getAllProjects(): Promise<Project[]> {
  try {
    const result = await queryD1(
      'SELECT * FROM projects ORDER BY order_index ASC, created_at DESC'
    );
    

    // console.log({result});
    if (result && result.results) {
      return result.results.map((row: any) => ({
        ...row,
        credits: row.credits ? JSON.parse(row.credits) : [],
        is_featured: Boolean(row.is_featured),
        is_published: Boolean(row.is_published)
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const result = await queryD1(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );
    
    if (result && result.results && result.results.length > 0) {
      const row = result.results[0];
      return {
        ...row,
        credits: row.credits ? JSON.parse(row.credits) : [],
        is_featured: Boolean(row.is_featured),
        is_published: Boolean(row.is_published)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
  const id = crypto.randomUUID();
  const creditsJson = JSON.stringify(project.credits || []);
  
  try {
    await queryD1(
      `INSERT INTO projects (
        id, title, client, category, data_cat, languages, classification,
        vimeo_id, video_url, poster_image, poster_image_srcset, credits,
        order_index, is_featured, is_published
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        project.title,
        project.client,
        project.category,
        project.data_cat,
        project.languages,
        project.classification,
        project.vimeo_id,
        project.video_url,
        project.poster_image,
        project.poster_image_srcset,
        creditsJson,
        project.order_index,
        project.is_featured ? 1 : 0,
        project.is_published ? 1 : 0
      ]
    );
    
    return {
      ...project,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Project;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  try {
    // First check if project exists
    const existing = await getProjectById(id);
    if (!existing) {
      return null;
    }

    // Build dynamic UPDATE query with only provided fields
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.client !== undefined) {
      fields.push('client = ?');
      values.push(updates.client);
    }
    if (updates.category !== undefined) {
      fields.push('category = ?');
      values.push(updates.category);
    }
    if (updates.data_cat !== undefined) {
      fields.push('data_cat = ?');
      values.push(updates.data_cat);
    }
    if (updates.languages !== undefined) {
      fields.push('languages = ?');
      values.push(updates.languages);
    }
    if (updates.classification !== undefined) {
      fields.push('classification = ?');
      values.push(updates.classification);
    }
    if (updates.vimeo_id !== undefined) {
      fields.push('vimeo_id = ?');
      values.push(updates.vimeo_id);
    }
    if (updates.video_url !== undefined) {
      fields.push('video_url = ?');
      values.push(updates.video_url);
    }
    if (updates.poster_image !== undefined) {
      fields.push('poster_image = ?');
      values.push(updates.poster_image);
    }
    if (updates.poster_image_srcset !== undefined) {
      fields.push('poster_image_srcset = ?');
      values.push(updates.poster_image_srcset);
    }
    if (updates.credits !== undefined) {
      fields.push('credits = ?');
      values.push(JSON.stringify(updates.credits));
    }
    if (updates.order_index !== undefined) {
      fields.push('order_index = ?');
      values.push(updates.order_index);
    }
    if (updates.is_featured !== undefined) {
      fields.push('is_featured = ?');
      values.push(updates.is_featured ? 1 : 0);
    }
    if (updates.is_published !== undefined) {
      fields.push('is_published = ?');
      values.push(updates.is_published ? 1 : 0);
    }

    // Always update the timestamp
    fields.push('updated_at = CURRENT_TIMESTAMP');

    // Add the ID for WHERE clause
    values.push(id);

    const sql = `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`;
    
    await queryD1(sql, values);
    
    return await getProjectById(id);
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    await queryD1('DELETE FROM projects WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
}