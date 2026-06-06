/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BlogPost, User, Comment } from '../types.js';

const API_BASE = '/api';

// Helper to get or set headers
function getHeaders(token?: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const activeToken = token || localStorage.getItem('blog_auth_token');
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }
  
  return headers;
}

export const api = {
  // ---------------------------------------------------------
  // AUTHENTICATION
  // ---------------------------------------------------------
  
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Server error' }));
      throw new Error(err.message || 'Login failed');
    }
    
    const data = await res.json();
    localStorage.setItem('blog_auth_token', data.token);
    return data;
  },
  
  async register(payload: { name: string; email: string; password: string; bio?: string; avatar?: string }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Server error' }));
      throw new Error(err.message || 'Registration failed');
    }
    
    const data = await res.json();
    localStorage.setItem('blog_auth_token', data.token);
    return data;
  },
  
  async getMe(token?: string | null): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    
    if (!res.ok) {
      localStorage.removeItem('blog_auth_token');
      throw new Error('Session expired');
    }
    
    return res.json();
  },
  
  async updateProfile(payload: { name?: string; bio?: string; avatar?: string; password?: string }): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Server error' }));
      throw new Error(err.message || 'Failed to update profile');
    }
    
    return res.json();
  },
  
  logout(): void {
    localStorage.removeItem('blog_auth_token');
  },
  
  // ---------------------------------------------------------
  // BLOGS CRUD
  // ---------------------------------------------------------
  
  async getBlogs(filters?: { search?: string; tag?: string; authorId?: string }): Promise<BlogPost[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.tag) params.append('tag', filters.tag);
    if (filters?.authorId) params.append('authorId', filters.authorId);
    
    const res = await fetch(`${API_BASE}/blogs?${params.toString()}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    if (!res.ok) throw new Error('Failed to retrieve blogs');
    return res.json();
  },
  
  async getBlogById(id: string): Promise<BlogPost> {
    const res = await fetch(`${API_BASE}/blogs/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    if (!res.ok) throw new Error('Failed to retrieve blog post');
    return res.json();
  },
  
  async createBlog(payload: { title: string; content: string; excerpt?: string; coverImage?: string; tags?: string[] }): Promise<BlogPost> {
    const res = await fetch(`${API_BASE}/blogs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to create blog' }));
      throw new Error(err.message || 'Verification failed');
    }
    
    return res.json();
  },
  
  async updateBlog(id: string, payload: { title?: string; content?: string; excerpt?: string; coverImage?: string; tags?: string[] }): Promise<BlogPost> {
    const res = await fetch(`${API_BASE}/blogs/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to update blog' }));
      throw new Error(err.message || 'Failed to update blog');
    }
    
    return res.json();
  },
  
  async deleteBlog(id: string): Promise<{ message: string; id: string }> {
    const res = await fetch(`${API_BASE}/blogs/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Deletion failed' }));
      throw new Error(err.message || 'Delete failed');
    }
    
    return res.json();
  },
  
  async toggleLike(id: string): Promise<{ likes: string[] }> {
    const res = await fetch(`${API_BASE}/blogs/${id}/like`, {
      method: 'POST',
      headers: getHeaders(),
    });
    
    if (!res.ok) throw new Error('Failed to like blog post');
    return res.json();
  },
  
  // ---------------------------------------------------------
  // COMMENTS
  // ---------------------------------------------------------
  
  async addComment(blogId: string, content: string): Promise<Comment> {
    const res = await fetch(`${API_BASE}/blogs/${blogId}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Comment post failed' }));
      throw new Error(err.message || 'Comment post failed');
    }
    
    return res.json();
  },
  
  async deleteComment(blogId: string, commentId: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/blogs/${blogId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Deletion unauthorized' }));
      throw new Error(err.message || 'Comment deletion failed');
    }
    
    return res.json();
  },
  
  // ---------------------------------------------------------
  // ANALYTICS / METRICS
  // ---------------------------------------------------------
  
  async getStats(): Promise<{
    summary: {
      totalBlogs: number;
      totalUsers: number;
      totalViews: number;
      totalLikes: number;
      totalComments: number;
    };
    popularTags: Array<{ name: string; count: number }>;
    popularAuthors: Array<{ id: string; name: string; avatar: string; blogsCount: number; totalViews: number }>;
  }> {
    const res = await fetch(`${API_BASE}/stats`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    if (!res.ok) throw new Error('Failed to retrieve database dashboard stats');
    return res.json();
  }
};
