// Database configuration and utilities for Cloudflare D1

// Database connection utility
export function getDb() {
  // In production, this will be injected by Cloudflare Workers
  // For development, we'll use a mock or local D1 instance
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Development mode - you can use a local SQLite file or mock
    return null; // We'll handle this in the API routes
  }
  
  // Production mode with Cloudflare D1
  // @ts-ignore - D1 binding will be available in production
  return globalThis.DB;
}

// Database schema types
export interface Project {
  id: string;
  title: string;
  client: string | null;
  category: string | null;
  data_cat: string | null;
  languages: string | null;
  classification: string | null;
  vimeo_id: string | null;
  video_url: string | null;
  poster_image: string | null;
  poster_image_srcset: string | null;
  credits: Credit[];
  order_index: number;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Credit {
  role: string;
  name: string;
}

export interface AboutContent {
  id: number;
  founder_name: string | null;
  founder_title: string | null;
  founder_bio: string | null;
  company_description: string | null;
  video_button_text: string | null;
  video_url: string | null;
  updated_at: string;
}

export interface ContactInfo {
  id: number;
  email: string | null;
  phone: string | null;
  city: string | null;
  street: string | null;
  vimeo_url: string | null;
  instagram_url: string | null;
  updated_at: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string | null;
  department: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// SQL queries for D1
export const queries = {
  // Projects
  getAllProjects: `
    SELECT * FROM projects 
    ORDER BY order_index ASC, created_at DESC
  `,
  
  getProjectById: `
    SELECT * FROM projects WHERE id = ?
  `,
  
  createProject: `
    INSERT INTO projects (
      id, title, client, category, data_cat, languages, classification,
      vimeo_id, video_url, poster_image, poster_image_srcset, credits,
      order_index, is_featured, is_published
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  
  updateProject: `
    UPDATE projects SET
      title = ?, client = ?, category = ?, data_cat = ?, languages = ?,
      classification = ?, vimeo_id = ?, video_url = ?, poster_image = ?,
      poster_image_srcset = ?, credits = ?, order_index = ?, is_featured = ?,
      is_published = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
  
  deleteProject: `
    DELETE FROM projects WHERE id = ?
  `,
  
  // About Content
  getAboutContent: `
    SELECT * FROM about_content WHERE id = 1
  `,
  
  updateAboutContent: `
    UPDATE about_content SET
      founder_name = ?, founder_title = ?, founder_bio = ?,
      company_description = ?, video_button_text = ?, video_url = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `,
  
  // Contact Info
  getContactInfo: `
    SELECT * FROM contact_info WHERE id = 1
  `,
  
  updateContactInfo: `
    UPDATE contact_info SET
      email = ?, phone = ?, city = ?, street = ?,
      vimeo_url = ?, instagram_url = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `,
  
  // Staff Members
  getAllStaff: `
    SELECT * FROM staff_members ORDER BY order_index ASC, created_at DESC
  `,
  
  getStaffById: `
    SELECT * FROM staff_members WHERE id = ?
  `,
  
  createStaff: `
    INSERT INTO staff_members (id, name, email, department, order_index)
    VALUES (?, ?, ?, ?, ?)
  `,
  
  updateStaff: `
    UPDATE staff_members SET
      name = ?, email = ?, department = ?, order_index = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
  
  deleteStaff: `
    DELETE FROM staff_members WHERE id = ?
  `
};

// Utility functions
export function generateId(): string {
  return crypto.randomUUID();
}

export function formatCredits(credits: Credit[]): string {
  return JSON.stringify(credits);
}

export function parseCredits(creditsJson: string): Credit[] {
  try {
    return JSON.parse(creditsJson);
  } catch {
    return [];
  }
}