import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure database file and directory exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface UserFileRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar: string;
  bio?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface CommentRecord {
  id: string;
  blogId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface BlogRecord {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  tags: string[];
  likes: string[]; // user ids
  views: number;
  comments: CommentRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  users: UserFileRecord[];
  blogs: BlogRecord[];
}

function getInitialDB(): DatabaseSchema {
  // Generate some beautiful initial seed blogs
  const adminId = 'admin_seeder';
  const hashedPassword = bcrypt.hashSync('admin123', 10);

  const initialUsers: UserFileRecord[] = [
    {
      id: adminId,
      name: 'Elena Rostova',
      email: 'elena@blogplatform.dev',
      passwordHash: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
      bio: 'Lead Developer & Architect. Writing about software design, typography, and building robust web applications.',
      role: 'admin',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'author_marcus',
      name: 'Marcus Chen',
      email: 'marcus@blogplatform.dev',
      passwordHash: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
      bio: 'Tech minimalist and UX designer. Exploring the intersection between humane technology and elegant coding.',
      role: 'user',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ];

  const initialBlogs: BlogRecord[] = [
    {
      id: 'blog_1',
      title: 'The Art of Minimalist Web Design',
      excerpt: 'How reducing layout noise, selecting thoughtful typography, and embracing negative space creates intuitive, eye-pleasing user journeys.',
      content: `## Embracing Simplicity in Modern Interfaces

In an era dominated by information overload, minimalist web design is no longer a mere aesthetic preference; it is a critical requirement for usability. When we stripping away unnecessary design clutter, we don't just make things look better—we create a clear pathway for the user's focus.

### 1. The Power of Generous Negative Space
Whitespace (or negative space) is the breathing room of a layout. It is the silence between notes that makes music. Without whitespace, elements compete with each other for attention, creating cognitive fatigue.
- **Improved Scannability**: Giving core text lines extra margin allows users to glide their eyes effortlessly.
- **Visual Hierarchy**: Larger spacing around headers naturally emphasizes their importance without needing extreme font sizes.

### 2. Intentional Typography Pairings
Typography is the voice of your application. Choosing a bold, clean Display font (like **Space Grotesk** or **Outfit**) paired with an incredibly legible body font (like **Inter**) establishes a distinct brand voice instantly.
Keep font families to a maximum of two, and rely on carefully chosen weights (e.g., Light, Medium, Semibold) to build contrast.

### 3. Functional Color Palettes
Minimalist design relies on a restricted palette. A perfect setup includes:
- **Primary Canvas**: Soft, eye-safe off-whites or subtle deep charcoals.
- **Text**: Dark gray or charcoal instead of harsh pure black to reduce strain.
- **Accent**: A singular, high-contrast, beautiful accent color to highlight critical interactivity or CTAs (e.g., a dynamic forest green or a classic royal blue).

By aligning layout density with human psychological limits, we honor the user's attention. Remember: *Design is not what it looks like and feels like. Design is how it works.*`,
      coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=80',
      authorId: 'author_marcus',
      authorName: 'Marcus Chen',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
      tags: ['Design', 'Minimalism', 'WebDev'],
      likes: ['admin_seeder'],
      views: 342,
      comments: [
        {
          id: 'comment_1',
          blogId: 'blog_1',
          authorName: 'Elena Rostova',
          authorEmail: 'elena@blogplatform.dev',
          authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
          content: 'This is brilliant, Marcus. The concept of negative space as "the silence between notes" is a perfect analogy. Thanks for this excellent piece!',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ],
      createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'blog_2',
      title: 'Building Type-Safe Full-Stack Apps in 2026',
      excerpt: 'A comprehensive guide on establishing end-to-end type safety across client React components and Node.js-Express servers without over-engineering.',
      content: `## Why End-to-End Type Safety Matters

When building modern full-stack systems, context switches between client-side rendering and server-side processing are notorious hotspots for architectural bugs. A simple typo in a response property on the server can break components on the client undetected by traditional unit tests.

### Establishing the Single-Truth Contract

The most robust approach to solving this transition gap is maintaining a shared or unified typing file. The contract includes:
1. **Request Payloads**: Strictly typing what the server expects.
2. **Response Interfaces**: Sharing schema objects like \`User\`, \`BlogPost\`, and \`Comment\`.

\`\`\`typescript
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
}
\`\`\`

### Client Data Fetching with Explicit Generics

When requesting endpoints via client-side fetch, do not leave responses as \`any\`. Use wrapper utilities or React hooks to enforce type checking:

\`\`\`typescript
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(\`API Failure: \${res.statusText}\`);
  return res.json() as Promise<T>;
}
\`\`\`

By ensuring data matches compiler structures from database schema to UI render loops, we eliminate an entire class of runtime errors.`,
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80',
      authorId: adminId,
      authorName: 'Elena Rostova',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
      tags: ['TypeScript', 'NodeJS', 'React'],
      likes: [],
      views: 189,
      comments: [],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'blog_3',
      title: 'The Blueprint for High-Performance Node Backend APIs',
      excerpt: 'Deep-dive into API optimization techniques, efficient database reads, memory-sensitive operations, and graceful error handling strategies.',
      content: `## Designing APIs Ready for Ingress Scale

For server-side applications written in Node.js, high throughput depends heavily on keeping the main event-loop non-blocking. Let us review the fundamental architectural blueprints for performant backend Express interfaces.

### 1. Streaming and Memory Management
When returning database cursors or large record collections, avoid mapping large datasets directly in memory.
- Prefer pagination and cursor limits.
- Buffer and process only the exact slice of data the user requests.

### 2. Standardized Error Middlewares
Avoid scattered, unstructured \`try-catch\` statements returning random error codes. Establish a robust global error handler in Express:

\`\`\`typescript
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});
\`\`\`

This standard ensures all responses retain consistent schema contracts, guaranteeing client-side integrations remain uniform under all conditions.`,
      coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80',
      authorId: adminId,
      authorName: 'Elena Rostova',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
      tags: ['NodeJS', 'API', 'Backend'],
      likes: ['author_marcus'],
      views: 125,
      comments: [],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ];

  return {
    users: initialUsers,
    blogs: initialBlogs
  };
}

export class DB {
  private static read_db(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_FILE)) {
        const initial = getInitialDB();
        fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
        return initial;
      }
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error reading DB:', e);
      return { users: [], blogs: [] };
    }
  }

  private static write_db(data: DatabaseSchema): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing DB:', e);
    }
  }

  // User queries
  static getUsers(): UserFileRecord[] {
    return this.read_db().users;
  }

  static findUserByEmail(email: string): UserFileRecord | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  static findUserById(id: string): UserFileRecord | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  static insertUser(user: UserFileRecord): void {
    const db = this.read_db();
    db.users.push(user);
    this.write_db(db);
  }

  static updateUser(id: string, updates: Partial<Omit<UserFileRecord, 'id' | 'email' | 'createdAt'>>): UserFileRecord | null {
    const db = this.read_db();
    const idx = db.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    db.users[idx] = { ...db.users[idx], ...updates };
    this.write_db(db);
    return db.users[idx];
  }

  // Blog queries
  static getBlogs(): BlogRecord[] {
    return this.read_db().blogs;
  }

  static findBlogById(id: string): BlogRecord | undefined {
    return this.getBlogs().find(b => b.id === id);
  }

  static insertBlog(blog: BlogRecord): void {
    const db = this.read_db();
    db.blogs.unshift(blog); // Newer blogs first
    this.write_db(db);
  }

  static updateBlog(id: string, updates: Partial<Omit<BlogRecord, 'id' | 'authorId' | 'createdAt'>>): BlogRecord | null {
    const db = this.read_db();
    const idx = db.blogs.findIndex(b => b.id === id);
    if (idx === -1) return null;
    db.blogs[idx] = { ...db.blogs[idx], ...updates, updatedAt: new Date().toISOString() };
    this.write_db(db);
    return db.blogs[idx];
  }

  static deleteBlog(id: string): boolean {
    const db = this.read_db();
    const lenBefore = db.blogs.length;
    db.blogs = db.blogs.filter(b => b.id !== id);
    const success = db.blogs.length < lenBefore;
    if (success) {
      this.write_db(db);
    }
    return success;
  }
}
