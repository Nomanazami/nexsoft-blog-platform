import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import { DB, UserFileRecord, BlogRecord, CommentRecord } from './server/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'jwt-premium-blog-secret-2026-key-98765';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'admin';
    name: string;
    avatar: string;
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Accept larger payloads for rich text and base64 images if needed
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // JWT Middleware
  const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(418).json({ message: 'Authentication required' });
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        role: 'user' | 'admin';
        name: string;
        avatar: string;
      };
      req.user = decoded;
      next();
    } catch (err) {
      res.status(403).json({ message: 'Invalid or expired authentication session' });
      return;
    }
  };

  // ---------------------------------------------------------
  // AUTH ROUTES
  // ---------------------------------------------------------

  // Register
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, password, bio, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    const existingUser = DB.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const userId = 'user_' + Math.random().toString(36).substr(2, 9);
    const passwordHash = bcrypt.hashSync(password, 10);
    const defaultAvatarImage = avatar || `https://images.unsplash.com/photo-${['1535713875002-d1d0cf377fde', '1494790108377-be9c29b29330', '1599566150163-29194dcaad36', '1580489944761-15a19d654956'][Math.floor(Math.random() * 4)]}?auto=format&fit=crop&w=150&h=150&q=80`;

    const newUser: UserFileRecord = {
      id: userId,
      name,
      email: email.toLowerCase(),
      passwordHash,
      avatar: defaultAvatarImage,
      bio: bio || '',
      role: 'user', // Defaults to normal user
      createdAt: new Date().toISOString()
    };

    DB.insertUser(newUser);

    const tokenPayload = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      avatar: newUser.avatar
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        bio: newUser.bio,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    });
  });

  // Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = DB.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const correctPassword = bcrypt.compareSync(password, user.passwordHash);
    if (!correctPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      avatar: user.avatar
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  });

  // Get current user profile
  app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Not logged in' });

    const user = DB.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      createdAt: user.createdAt
    });
  });

  // Update profile
  app.put('/api/auth/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

    const { name, bio, avatar, password } = req.body;
    const updates: Partial<Omit<UserFileRecord, 'id' | 'email' | 'createdAt'>> = {};

    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (avatar) updates.avatar = avatar;
    if (password) {
      updates.passwordHash = bcrypt.hashSync(password, 10);
    }

    const updated = DB.updateUser(req.user.id, updates);
    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      avatar: updated.avatar,
      bio: updated.bio,
      role: updated.role,
      createdAt: updated.createdAt
    });
  });

  // ---------------------------------------------------------
  // BLOG POST ROUTES
  // ---------------------------------------------------------

  // Get all blogs (with filtration & searching)
  app.get('/api/blogs', (req: Request, res: Response) => {
    const { search, tag, authorId } = req.query;
    let blogs = DB.getBlogs();

    if (search) {
      const q = (search as string).toLowerCase();
      blogs = blogs.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.excerpt.toLowerCase().includes(q) || 
        b.content.toLowerCase().includes(q)
      );
    }

    if (tag) {
      const t = (tag as string).toLowerCase();
      blogs = blogs.filter(b => b.tags.some(tagItem => tagItem.toLowerCase() === t));
    }

    if (authorId) {
      blogs = blogs.filter(b => b.authorId === authorId);
    }

    return res.json(blogs);
  });

  // Get single blog (and increment dynamic views counter)
  app.get('/api/blogs/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const blog = DB.findBlogById(id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Lazy view counter increment
    const updated = DB.updateBlog(id, { views: blog.views + 1 });
    return res.json(updated || blog);
  });

  // Create blog (Protected)
  app.post('/api/blogs', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { title, content, excerpt, coverImage, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const blogId = 'blog_' + Math.random().toString(36).substr(2, 9);
    const defaultCover = coverImage || `https://images.unsplash.com/photo-${['1499750310107-5fef28a66643', '1432821596592-e2c18b78144f', '1488590528505-98d2b5aba04b', '1486312338219-ce68d2c6f44d'][Math.floor(Math.random() * 4)]}?auto=format&fit=crop&w=1000&q=80`;

    const parsedTags: string[] = Array.isArray(tags) 
      ? tags 
      : typeof tags === 'string' 
        ? tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];

    const newBlog: BlogRecord = {
      id: blogId,
      title,
      excerpt: excerpt || (content.replace(/[#*`\n]/g, ' ').substring(0, 150) + '...'),
      content,
      coverImage: defaultCover,
      authorId: req.user.id,
      authorName: req.user.name,
      authorAvatar: req.user.avatar,
      tags: parsedTags,
      likes: [],
      views: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    DB.insertBlog(newBlog);
    return res.status(201).json(newBlog);
  });

  // Update blog (Protected - Creator or Admin)
  app.put('/api/blogs/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.params;
    const blog = DB.findBlogById(id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You do not own this blog' });
    }

    const { title, content, excerpt, coverImage, tags } = req.body;
    const updates: Partial<Omit<BlogRecord, 'id' | 'authorId' | 'createdAt'>> = {};

    if (title) {
      updates.title = title;
      if (!excerpt) {
        updates.excerpt = content ? content.replace(/[#*`\n]/g, ' ').substring(0, 150) + '...' : blog.excerpt;
      }
    }
    if (content) updates.content = content;
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (coverImage) updates.coverImage = coverImage;
    if (tags) {
      updates.tags = Array.isArray(tags)
        ? tags
        : typeof tags === 'string'
          ? tags.split(',').map(t => t.trim()).filter(Boolean)
          : blog.tags;
    }

    const updated = DB.updateBlog(id, updates);
    return res.json(updated);
  });

  // Delete blog (Protected - Creator or Admin)
  app.delete('/api/blogs/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.params;
    const blog = DB.findBlogById(id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You do not own this blog' });
    }

    DB.deleteBlog(id);
    return res.json({ message: 'Blog deleted successfully', id });
  });

  // Toggle Blog Likes (Protected)
  app.post('/api/blogs/:id/like', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.params;
    const blog = DB.findBlogById(id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    let likes = [...blog.likes];
    const userIndex = likes.indexOf(req.user.id);

    if (userIndex === -1) {
      likes.push(req.user.id); // Like
    } else {
      likes.splice(userIndex, 1); // Unlike
    }

    const updated = DB.updateBlog(id, { likes });
    return res.json({ likes: updated?.likes || likes });
  });

  // ---------------------------------------------------------
  // COMMENT ROUTES (Protected)
  // ---------------------------------------------------------

  // Post comment
  app.post('/api/blogs/:id/comments', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const blog = DB.findBlogById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    const newComment: CommentRecord = {
      id: 'comment_' + Math.random().toString(36).substr(2, 9),
      blogId: id,
      authorName: req.user.name,
      authorEmail: req.user.email,
      authorAvatar: req.user.avatar,
      content,
      createdAt: new Date().toISOString()
    };

    const comments = [newComment, ...blog.comments];
    const updated = DB.updateBlog(id, { comments });

    return res.status(201).json(newComment);
  });

  // Delete comment
  app.delete('/api/blogs/:blogId/comments/:commentId', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { blogId, commentId } = req.params;
    const blog = DB.findBlogById(blogId);

    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    const comment = blog.comments.find(c => c.id === commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Allowed to delete if user is:
    // 1. Author of the comment
    // 2. Author of the blog post
    // 3. Admin user
    const user = DB.findUserByEmail(comment.authorEmail);
    const commentAuthorId = user?.id;

    if (commentAuthorId !== req.user.id && blog.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Unauthorized comment removal' });
    }

    const comments = blog.comments.filter(c => c.id !== commentId);
    DB.updateBlog(blogId, { comments });

    return res.json({ message: 'Comment removed successfully' });
  });

  // ---------------------------------------------------------
  // ANALYTICS / STATS ROUTE (Admins or user overview)
  // ---------------------------------------------------------
  app.get('/api/stats', (req: Request, res: Response) => {
    const blogs = DB.getBlogs();
    const users = DB.getUsers();

    const totalBlogs = blogs.length;
    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;

    const tagCounts: Record<string, number> = {};
    const authorStats: Record<string, { name: string; avatar: string; blogsCount: number; totalViews: number }> = {};

    blogs.forEach((b) => {
      totalViews += b.views;
      totalLikes += b.likes.length;
      totalComments += b.comments.length;

      // Tag tracker
      b.tags.forEach((t) => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });

      // Author tracker
      if (!authorStats[b.authorId]) {
        authorStats[b.authorId] = {
          name: b.authorName,
          avatar: b.authorAvatar,
          blogsCount: 0,
          totalViews: 0
        };
      }
      authorStats[b.authorId].blogsCount += 1;
      authorStats[b.authorId].totalViews += b.views;
    });

    const popularTags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const popularAuthors = Object.entries(authorStats)
      .map(([id, stats]) => ({ id, ...stats }))
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 5);

    return res.json({
      summary: {
        totalBlogs,
        totalUsers: users.length,
        totalViews,
        totalLikes,
        totalComments,
      },
      popularTags,
      popularAuthors,
    });
  });

  // ---------------------------------------------------------
  // SITE RENDERING & MIDDLEWARES
  // ---------------------------------------------------------

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express custom server running on http://localhost:${PORT}`);
  });
}

startServer().catch((e) => {
  console.error('Fatal dev server launch error:', e);
});
