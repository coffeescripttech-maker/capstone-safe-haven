// Analytics tracking utilities

export interface ProjectView {
  id: string;
  project_id: string;
  viewer_ip?: string;
  viewer_country?: string;
  viewer_city?: string;
  user_agent?: string;
  referrer?: string;
  viewed_at: string;
}

export interface ProjectAnalytics {
  project_id: string;
  total_views: number;
  unique_views: number;
  last_viewed_at?: string;
  avg_view_duration: number;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

// Generate unique ID
export function generateId(): string {
  return crypto.randomUUID();
}

// Track project view
export async function trackProjectView(projectId: string, metadata?: {
  ip?: string;
  country?: string;
  city?: string;
  userAgent?: string;
  referrer?: string;
}): Promise<void> {
  try {
    await fetch('/api/analytics/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        ...metadata
      })
    });
  } catch (error) {
    console.error('Failed to track view:', error);
  }
}

// Log user activity
export async function logActivity(activity: {
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: string;
}): Promise<void> {
  try {
    await fetch('/api/analytics/log-activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity)
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

// Get project analytics
export async function getProjectAnalytics(projectId: string): Promise<ProjectAnalytics | null> {
  try {
    const response = await fetch(`/api/analytics/project/${projectId}`);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Failed to get analytics:', error);
    return null;
  }
}

// Get dashboard analytics
export async function getDashboardAnalytics(): Promise<{
  totalProjects: number;
  totalViews: number;
  totalUploads: number;
  storageUsedMB: number;
  recentActivity: ActivityLog[];
  topProjects: Array<{ project_id: string; title: string; views: number }>;
} | null> {
  try {
    const response = await fetch('/api/analytics/dashboard');
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Failed to get dashboard analytics:', error);
    return null;
  }
}