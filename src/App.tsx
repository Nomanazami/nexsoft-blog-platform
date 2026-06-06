/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, SlidersHorizontal, ArrowUpRight, Search, Eye, FilterX, HelpCircle, Heart, Award, ArrowRight, MessageSquare, Tag } from 'lucide-react';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import BlogPostCard from './components/BlogPostCard';
import BlogForm from './components/BlogForm';
import Dashboard from './components/Dashboard';
import BlogDetails from './components/BlogDetails';
import UserProfile from './components/UserProfile';
import { api } from './lib/api.js';
import { BlogPost, User } from './types.js';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [popularTags, setPopularTags] = useState<Array<{ name: string; count: number }>>([]);
  const [popularAuthors, setPopularAuthors] = useState<any[]>([]);
  
  // Navigation & Filtering
  const [currentView, setCurrentView] = useState<'explore' | 'write' | 'dashboard' | 'profile' | 'blog-details'>('explore');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  
  // Modals & Loaders
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isFeedLoading, setIsFeedLoading] = useState(false);

  // Authenticate Session on Boot
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('blog_auth_token');
      if (storedToken) {
        try {
          const profile = await api.getMe(storedToken);
          setUser(profile);
          setToken(storedToken);
        } catch (err) {
          console.log('Session validation failed. Clearing token.');
          localStorage.removeItem('blog_auth_token');
        }
      }
      setIsAppLoading(false);
    };

    initializeAuth();
    fetchTagsAndAuthors();
  }, []);

  // Fetch blogs whenever views or filters update
  useEffect(() => {
    loadBlogsFeed();
  }, [searchQuery, selectedTag]);

  const loadBlogsFeed = async () => {
    setIsFeedLoading(true);
    try {
      const feed = await api.getBlogs({
        search: searchQuery,
        tag: selectedTag
      });
      setBlogs(feed);
    } catch (e) {
      console.error('Error fetching blogs feed', e);
    } finally {
      setIsFeedLoading(false);
    }
  };

  const fetchTagsAndAuthors = async () => {
    try {
      const stats = await api.getStats();
      setPopularTags(stats.popularTags || []);
      setPopularAuthors(stats.popularAuthors || []);
    } catch (e) {
      console.log('Error reading tags widgets', e);
    }
  };

  const handleAuthSuccess = (authUser: User, jwtToken: string) => {
    setUser(authUser);
    setToken(jwtToken);
    setIsAuthModalOpen(false);
    fetchTagsAndAuthors(); // Refresh dashboard states on login
    loadBlogsFeed();
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setToken(null);
    setCurrentView('explore');
    fetchTagsAndAuthors();
    loadBlogsFeed();
  };

  const handlePostClick = (id: string) => {
    setSelectedPostId(id);
    setCurrentView('blog-details');
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag === selectedTag ? '' : tag);
    setCurrentView('explore');
  };

  const handleLikeToggle = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const result = await api.toggleLike(id);
      
      // Update locally inside feeds
      setBlogs(blogs.map(b => {
        if (b.id === id) {
          return { ...b, likes: result.likes };
        }
        return b;
      }));
    } catch (err) {
      console.error('Could not toggle likes state', err);
    }
  };

  const handleSaveBlog = async (data: { title: string; content: string; excerpt?: string; coverImage?: string; tags?: string[] }) => {
    try {
      if (editingPost) {
        // Update Action
        await api.updateBlog(editingPost.id, data);
        setEditingPost(null);
      } else {
        // Create Action
        await api.createBlog(data);
      }

      // Reload lists, refresh metrics, and return to view
      await loadBlogsFeed();
      await fetchTagsAndAuthors();
      setCurrentView('dashboard');
    } catch (err) {
      throw err;
    }
  };

  const handleEditPostRequest = (post: BlogPost) => {
    setEditingPost(post);
    setCurrentView('write');
  };

  const handleNavigate = (view: 'explore' | 'write' | 'dashboard' | 'profile' | 'blog-details') => {
    if (view === 'explore') {
      setSelectedTag('');
      setSearchQuery('');
    }
    setCurrentView(view);
  };

  // Rendering loader card when restoring authentication state
  if (isAppLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-sans text-xs font-semibold tracking-wide">Starting blog engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col antialiased">
      {/* Dynamic Glass Header layout */}
      <Header
        user={user}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
        onNavigate={handleNavigate}
        currentView={currentView}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 flex justify-center">
        {currentView === 'explore' && (
          <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Main grid feed (3/4 column) */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              
              {/* Jumbotron Hero Card when filters are clean and empty */}
              {!selectedTag && !searchQuery && (
                <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xs select-none">
                  <div className="relative z-10 max-w-lg">
                    <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-900 border border-gray-200 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg mb-3">
                      <Sparkles className="w-3.5 h-3.5" />
                      Writers Space
                    </span>
                    <h1 className="text-xl sm:text-2xl.5 font-extrabold text-gray-950 font-sans tracking-tight leading-snug">
                      Perspectives, Minimalism, and Technical Mastery.
                    </h1>
                    <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                      Explore beautiful designs, coding ideas, API optimizations, and user journey lessons written by specialized authors.
                    </p>
                  </div>

                  <div className="w-full sm:w-44 aspect-16/10 rounded-2xl overflow-hidden shadow-xs border border-gray-100/50 shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=300&q=80"
                      alt="minimalist graphics banner"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Tag filtering banner notification */}
              {(selectedTag || searchQuery) && (
                <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between gap-4 select-none">
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                    <span>
                      Filtered by:{' '}
                      {selectedTag && (
                        <span className="font-extrabold text-gray-950 bg-gray-100 px-2 py-0.5 rounded-md text-xs">
                          #{selectedTag}
                        </span>
                      )}
                      {selectedTag && searchQuery && ' and '}
                      {searchQuery && (
                        <span className="font-extrabold text-gray-950 bg-gray-100 px-2 py-0.5 rounded-md text-xs">
                          "{searchQuery}"
                        </span>
                      )}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedTag('');
                      setSearchQuery('');
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-900 bg-gray-50 px-3 py-1.5 rounded-xl border-0 cursor-pointer"
                  >
                    <FilterX className="w-3.5 h-3.5" />
                    Clear Filters
                  </button>
                </div>
              )}

              {/* Grid content feed loader */}
              {isFeedLoading ? (
                <div className="w-full h-80 flex items-center justify-center select-none">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-gray-400 font-semibold mt-1">Updating feed...</span>
                  </div>
                </div>
              ) : blogs.length === 0 ? (
                /* Empty grid page */
                <div className="bg-white border border-gray-50 rounded-3xl p-12 text-center flex flex-col items-center gap-4 select-none shadow-3xs">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">No article records found</h3>
                    <p className="text-gray-400 text-sm mt-1">We couldn't locate any draft blogs matching your criteria.</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTag('');
                      setSearchQuery('');
                    }}
                    className="bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs py-2.5 px-4 rounded-xl border-0 cursor-pointer transition-colors"
                  >
                    Clear search filters
                  </button>
                </div>
              ) : (
                /* Responsive Grid items */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blogs.map((b) => (
                    <BlogPostCard
                      key={b.id}
                      post={b}
                      user={user}
                      onPostClick={handlePostClick}
                      onTagClick={handleTagClick}
                      onLikeToggle={handleLikeToggle}
                      isLiked={user ? b.likes?.includes(user?.id) : false}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar widgets (1/4 column) */}
            <div className="flex flex-col gap-6 select-none">
              {/* Category Pills widget box */}
              <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-2xs">
                <h2 className="text-xs font-bold font-sans text-gray-900 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-50 pb-3 mb-3.5">
                  <Tag className="w-4 h-4 text-gray-400" />
                  Topic Index
                </h2>

                <div className="flex flex-col gap-1.5">
                  {popularTags.map((tag, i) => (
                    <button
                      key={i}
                      onClick={() => handleTagClick(tag.name)}
                      className={`flex items-center justify-between text-xs px-3 py-2.5 rounded-xl transition-all border-0 text-left cursor-pointer ${
                        selectedTag === tag.name
                          ? 'bg-gray-950 text-white font-bold font-sans'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/60'
                      }`}
                    >
                      <span className="font-semibold uppercase tracking-wider">#{tag.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${selectedTag === tag.name ? 'bg-white/10 text-white' : 'bg-gray-50 text-gray-400'}`}>
                        {tag.count} Post{tag.count !== 1 && 's'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform top producers spotlight card */}
              <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-2xs">
                <h2 className="text-xs font-bold font-sans text-gray-900 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-50 pb-3 mb-3.5">
                  <Award className="w-4.5 h-4.5 text-gray-400" />
                  Top Producers
                </h2>

                <div className="flex flex-col gap-3.5">
                  {popularAuthors.slice(0, 3).map((author, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <img
                        src={author.avatar}
                        alt={author.name}
                        referrerPolicy="no-referrer"
                        className="w-8.5 h-8.5 rounded-xl object-cover ring-2 ring-gray-100/30"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-950 truncate leading-tight">{author.name}</p>
                        <p className="text-[10px] text-gray-400 font-semibold">{author.blogsCount} published pieces</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Author Prompt Box */}
              {!user && (
                <div className="bg-gradient-to-br from-gray-900 to-gray-850 text-white rounded-3xl p-5 border-0 shadow-sm">
                  <h3 className="font-serif font-black text-lg tracking-tight mb-1.5">Are you a producer?</h3>
                  <p className="text-gray-400 text-xs leading-relaxed mb-4">
                    Register as an author to start blogging, get impression stats, write technical reviews, and build user forums.
                  </p>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-full py-2.5 px-4 bg-white hover:bg-gray-100 text-gray-900 hover:text-gray-950 text-xs font-bold rounded-xl border-0 shadow-sm cursor-pointer transition-colors"
                  >
                    Become Author
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Details page view */}
        {currentView === 'blog-details' && selectedPostId && (
          <BlogDetails
            postId={selectedPostId}
            user={user}
            onBack={() => handleNavigate('explore')}
            onTagClick={handleTagClick}
            onLikeToggle={handleLikeToggle}
            isLiked={user && blogs.find(b => b.id === selectedPostId)?.likes?.includes(user.id) || false}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {/* Writer Creation/Editor module */}
        {currentView === 'write' && user && (
          <BlogForm
            post={editingPost}
            onSave={handleSaveBlog}
            onBack={() => {
              setEditingPost(null);
              handleNavigate('dashboard');
            }}
          />
        )}

        {/* Dashboard panel view */}
        {currentView === 'dashboard' && user && (
          <Dashboard
            user={user}
            onEditPost={handleEditPostRequest}
            onNavigateToWrite={() => handleNavigate('write')}
            onNavigateToPost={handlePostClick}
          />
        )}

        {/* User setting profiles panel view */}
        {currentView === 'profile' && user && (
          <UserProfile
            user={user}
            onUpdateUser={setUser}
            onBack={() => handleNavigate('explore')}
          />
        )}
      </main>

      {/* Footer footer element */}
      <footer className="w-full bg-white border-t border-gray-100/80 py-6 text-center select-none flex justify-center mt-auto">
        <div className="w-full max-w-7xl px-4 sm:px-6 text-xs text-gray-400 font-medium">
          <p>© {new Date().getFullYear()} BlogPlatform. Built for developers, designers, and web enthusiasts.</p>
        </div>
      </footer>

      {/* Authentication Sliding Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onAuthSuccess={handleAuthSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
