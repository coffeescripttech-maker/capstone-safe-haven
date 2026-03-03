/**
 * SMS Blast API Client
 * Handles all API calls to the backend SMS Blast endpoints
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

class SMSBlastAPI {
  private getHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || error.error?.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // SMS Blast Operations
  async createBlast(data: {
    message?: string;
    templateId?: string;
    templateVariables?: Record<string, string>;
    recipientFilters: {
      provinces?: string[];
      cities?: string[];
      barangays?: string[];
      contactGroupIds?: string[];
    };
    language: 'en' | 'fil';
    priority?: 'critical' | 'high' | 'normal';
    scheduledTime?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/sms-blast`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async getBlastHistory(params?: { limit?: number; offset?: number; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.status) queryParams.append('status', params.status);

    const response = await fetch(
      `${API_BASE_URL}/api/sms-blast/history?${queryParams}`,
      {
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  async getBlastDetails(blastId: string) {
    const response = await fetch(`${API_BASE_URL}/api/sms-blast/${blastId}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Credit Operations
  async getCreditBalance() {
    const response = await fetch(`${API_BASE_URL}/api/sms-blast/credits/balance`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Template Operations
  async getTemplates(params?: { category?: string; language?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.language) queryParams.append('language', params.language);

    const response = await fetch(
      `${API_BASE_URL}/api/sms-blast/templates?${queryParams}`,
      {
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  async createTemplate(data: {
    name: string;
    category: string;
    content: string;
    language: 'en' | 'fil';
  }) {
    const response = await fetch(`${API_BASE_URL}/api/sms-blast/templates`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async updateTemplate(templateId: string, data: Partial<{
    name: string;
    category: string;
    content: string;
    language: 'en' | 'fil';
  }>) {
    const response = await fetch(`${API_BASE_URL}/api/sms-blast/templates/${templateId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async deleteTemplate(templateId: string) {
    const response = await fetch(`${API_BASE_URL}/api/sms-blast/templates/${templateId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Contact Group Operations
  async getContactGroups() {
    const response = await fetch(`${API_BASE_URL}/api/sms-blast/contact-groups`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createContactGroup(data: {
    name: string;
    recipientFilters: {
      provinces?: string[];
      cities?: string[];
      barangays?: string[];
    };
  }) {
    const response = await fetch(`${API_BASE_URL}/api/sms-blast/contact-groups`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async deleteContactGroup(groupId: string) {
    const response = await fetch(`${API_BASE_URL}/api/sms-blast/contact-groups/${groupId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Usage & Analytics
  async getUsageStats(params?: { startDate?: string; endDate?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const response = await fetch(
      `${API_BASE_URL}/api/sms-blast/usage?${queryParams}`,
      {
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  // Audit Logs
  async exportAuditLogs(params: {
    startDate: string;
    endDate: string;
    format: 'csv' | 'pdf';
  }) {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(
      `${API_BASE_URL}/api/sms-blast/audit-logs/export?${queryParams}`,
      {
        headers: this.getHeaders(),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to export audit logs');
    }
    
    return response.blob();
  }
}

export const smsBlastAPI = new SMSBlastAPI();
export default smsBlastAPI;
