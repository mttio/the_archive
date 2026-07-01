import type { WorkItem, TagItem } from '../data/works';

const API_BASE_URL = 'http://localhost:8000/api';

export interface ApiWorkInput {
  id?: string;
  title: string;
  subtitle: string;
  content: string;
  date: string;
  imageUrl?: string;
  draft?: boolean;
  tag_ids: string[];
}

// Helper to extract authentication header
const getAuthHeaders = (passphrase?: string): Record<string, string> => {
  const token = passphrase || sessionStorage.getItem('admin_passphrase') || '';
  return {
    'Content-Type': 'application/json',
    'X-Admin-Passphrase': token,
  };
};

export const api = {
  // Fetch all works
  async fetchWorks(includeDrafts?: boolean): Promise<WorkItem[]> {
    const query = includeDrafts ? '?include_drafts=true' : '';
    const response = await fetch(`${API_BASE_URL}/works${query}`);
    if (!response.ok) {
      throw new Error('Failed to fetch works from backend API.');
    }
    return response.json();
  },

  // Fetch a single work
  async fetchWorkById(id: string): Promise<WorkItem> {
    const response = await fetch(`${API_BASE_URL}/works/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch work with ID: ${id}`);
    }
    return response.json();
  },

  // Verify admin passphrase
  async verifyPassphrase(passphrase: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/admin/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passphrase }),
    });
    
    if (response.status === 200) {
      sessionStorage.setItem('admin_passphrase', passphrase);
      return true;
    }
    return false;
  },

  // Create a new work
  async createWork(work: ApiWorkInput): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/works`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(work),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create new work item.');
    }
  },

  // Update an existing work
  async updateWork(id: string, work: ApiWorkInput): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/works/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(work),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update work item.');
    }
  },

  // Delete a work
  async deleteWork(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/works/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete work item.');
    }
  },

  // Fetch all tags
  async fetchTags(): Promise<TagItem[]> {
    const response = await fetch(`${API_BASE_URL}/tags`);
    if (!response.ok) {
      throw new Error('Failed to fetch tags from backend.');
    }
    return response.json();
  },

  // Create a new tag
  async createTag(tag: Omit<TagItem, 'id'>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tags`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tag),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create new tag.');
    }
  },

  // Update an existing tag
  async updateTag(id: string, tag: Omit<TagItem, 'id'>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(tag),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update tag.');
    }
  },

  // Delete a tag
  async deleteTag(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete tag.');
    }
  }
};
