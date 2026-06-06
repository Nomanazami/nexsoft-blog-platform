/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Comment {
  id: string;
  blogId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  tags: string[];
  likes: string[]; // List of userIds who liked the post
  views: number;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
