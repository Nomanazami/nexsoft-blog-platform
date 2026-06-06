/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Eye, Heart, MessageSquare, Edit3, Trash2, ArrowUpRight, BarChart3, Users, Tag, Award, PlusCircle, AlertCircle } from 'lucide-react';
import { BlogPost, User } from '../types.js';
import { api } from '../lib/api.js';

interface DashboardProps {
  user: User;
  onEditPost: (post: BlogPost) => void;
  onNavigateToWrite: () => void;
  onNavigateToPost: (id: string) => void;
}

export default function Dashboard({ user, onEditPost, onNavigateToWrite, onNavigateToPost }: DashboardProps) {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Analytics State
  const [platformStats, setPlatformStats] = useState<any | null>(null);
  const [activeTab, setActiveTab2] = useState<'my-posts' | 'analytics'>('my-posts');

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Get all blogs and filter for this author, or load everything if admin
      const allBlogs = await api.getBlogs();
      const myBlogsList = allBlogs.filter((b) => b.authorId === user.id);
      setBlogs(myBlogsList);

      // Load admin or general system stats safely
      const stats = await api.getStats();
      setPlatformStats(stats);
    } catch (err: any) {
      setError('Could not fetch analytics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    const confirmDelete = window.confirm('Are you absolutely sure you want to delete this article? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      await api.deleteBlog(id);
      // Reload lists
      setBlogs(blogs.filter((b) => b.id !== id));
      // Refresh general stats
      const stats = await api.getStats();
      setPlatformStats(stats);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete blog.');
    }
  };

  // Compute stats for logged-in user
  const totalMyPosts = blogs.length;
  const totalMyViews = blogs.reduce((acc, curr) => acc + curr.views, 0);
  const totalMyLikes = blogs.reduce((acc, curr) => acc + curr.likes.length, 0);
  const totalMyComments = blogs.reduce((acc, curr) => acc + (curr.comments?.length || 0), 0);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-20 select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-xs font-semibold">Opening Writer Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
    >
      {/* Upper Welcome Jumbotron */}
      <div className="relative overflow-hidden rounded-3xl bg-gray-950 text-white p-6 sm:p-8 mb-6 shadow-md border-0">
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-gray-800 to-transparent opacity-40 -mr-20 -mt-20 pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5 select-none">
          <div className="flex items-center gap-3.5">
            <img
              src={user.avatar}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/10"
            />
            <div>
              <span className="inline-flex items-center gap-1 bg-white/10 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md mb-1 border border-white/5">
                <Award className="w-3 h-3" />
                {user.role === 'admin' ? 'SYSTEM ADMINISTRATOR' : 'PUBLISHED WRITER'}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-tight">
                Welcome back, {user.name}
              </h1>
              <p className="text-gray-400 text-xs mt-0.5 truncate max-w-md">
                {user.bio || 'Your publications are read all around the world.'}
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToWrite}
            className="flex items-center justify-center gap-2 bg-white text-gray-950 hover:bg-gray-50 font-semibold text-sm px-5 py-3 rounded-2xl shadow-md transition-colors border-0 shrink-0 cursor-pointer self-start md:self-center"
          >
            <PlusCircle className="w-4 h-4" />
            Write New Article
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2.5 p-4 rounded-2xl bg-red-50 text-red-700 text-sm font-semibold border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Segmented Controller Tab Selector */}
      <div className="flex border-b border-gray-100/80 mb-6 gap-6 select-none">
        <button
          onClick={() => setActiveTab2('my-posts')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 relative -mb-[2px] cursor-pointer ${
            activeTab === 'my-posts'
              ? 'border-gray-900 text-gray-950 font-bold'
              : 'border-transparent text-gray-400 hover:text-gray-900'
          }`}
        >
          My Published Articles ({totalMyPosts})
        </button>
        <button
          onClick={() => setActiveTab2('analytics')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 relative -mb-[2px] cursor-pointer ${
            activeTab === 'analytics'
              ? 'border-gray-900 text-gray-950 font-bold'
              : 'border-transparent text-gray-400 hover:text-gray-900'
          }`}
        >
          System Analytics
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'my-posts' ? (
          <motion.div
            key="posts"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex flex-col gap-6"
          >
            {/* SaaS Style Metrics Row for Author */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 select-none">
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 mb-3.5">
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <span className="block text-2xl font-extrabold text-gray-950 font-sans tracking-tight">{totalMyPosts}</span>
                <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Total Publications</span>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 mb-3.5">
                  <Eye className="w-4.5 h-4.5" />
                </div>
                <span className="block text-2xl font-extrabold text-gray-950 font-sans tracking-tight">{totalMyViews}</span>
                <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Article Impressions</span>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 mb-3.5">
                  <Heart className="w-4.5 h-4.5" />
                </div>
                <span className="block text-2xl font-extrabold text-gray-950 font-sans tracking-tight">{totalMyLikes}</span>
                <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Appreciation Hearts</span>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 mb-3.5">
                  <MessageSquare className="w-4.5 h-4.5" />
                </div>
                <span className="block text-2xl font-extrabold text-gray-950 font-sans tracking-tight">{totalMyComments}</span>
                <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Reader Comments</span>
              </div>
            </div>

            {/* Articles Table/Manager list */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden mt-2">
              <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/10 flex items-center justify-between select-none">
                <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Publications Management Table</h2>
                <span className="text-[10px] text-gray-400 font-semibold">Ordered by newest</span>
              </div>

              {blogs.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center gap-3">
                  <span className="text-gray-300">You haven't written any articles yet. Let's create your first draft!</span>
                  <button
                    onClick={onNavigateToWrite}
                    className="bg-gray-950 hover:bg-gray-900 border-0 text-white font-medium text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                  >
                    Draft first article
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-gray-50/20 text-[10px] text-gray-400 font-bold uppercase tracking-wider select-none border-b border-gray-50/50">
                        <th className="px-5 py-3.5">Title</th>
                        <th className="px-4 py-3.5">Performance Metrics</th>
                        <th className="px-4 py-3.5">Published Date</th>
                        <th className="px-5 py-3.5 text-right">Draft Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {blogs.map((b) => (
                        <tr key={b.id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3.5">
                              <img
                                src={b.coverImage}
                                alt={b.title}
                                referrerPolicy="no-referrer"
                                className="w-14 aspect-16/10 rounded-lg object-cover bg-gray-50 shrink-0"
                              />
                              <div className="min-w-0">
                                <h3 
                                  onClick={() => onNavigateToPost(b.id)}
                                  className="text-sm font-bold text-gray-900 hover:text-gray-500 cursor-pointer truncate max-w-sm"
                                >
                                  {b.title}
                                </h3>
                                <div className="flex items-center gap-1.5 mt-1">
                                  {b.tags.slice(0, 2).map((tag, i) => (
                                    <span key={i} className="text-[9px] font-semibold text-gray-400">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 select-none">
                            <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5 text-gray-300" /> {b.views}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-3.5 h-3.5 text-gray-300" /> {b.likes?.length}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3.5 h-3.5 text-gray-300" /> {b.comments?.length}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-xs font-medium text-gray-500 select-none">
                            {new Date(b.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => onEditPost(b)}
                                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border-0 cursor-pointer"
                                title="Edit post"
                              >
                                <Edit3 className="w-4.5 h-4.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePost(b.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border-0 cursor-pointer"
                                title="Delete post"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                              <button
                                onClick={() => onNavigateToPost(b.id)}
                                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border-0 cursor-pointer"
                                title="View live"
                              >
                                <ArrowUpRight className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* SYSTEM ANALYTICS ANALYTICAL GRAPHS PANEL */
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex flex-col gap-6"
          >
            {/* PLATFORM SUMMARY METRICS SaaS widgets */}
            {platformStats && (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 select-none">
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs">
                  <span className="block text-2xl font-extrabold text-gray-950 font-sans tracking-tight">
                    {platformStats.summary?.totalBlogs}
                  </span>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Platform Articles</span>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs">
                  <span className="block text-2xl font-extrabold text-gray-950 font-sans tracking-tight">
                    {platformStats.summary?.totalUsers}
                  </span>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Registered Users</span>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs">
                  <span className="block text-2xl font-extrabold text-gray-950 font-sans tracking-tight">
                    {platformStats.summary?.totalViews}
                  </span>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Total Impressions</span>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs">
                  <span className="block text-2xl font-extrabold text-gray-950 font-sans tracking-tight">
                    {platformStats.summary?.totalLikes}
                  </span>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Appreciation Clicks</span>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs col-span-2 lg:col-span-1">
                  <span className="block text-2xl font-extrabold text-gray-950 font-sans tracking-tight">
                    {platformStats.summary?.totalComments}
                  </span>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Comments Posted</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Popular Tags cloud */}
              <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-2xs">
                <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-1.5 select-none border-b border-gray-50 pb-3">
                  <Tag className="w-4 h-4 text-gray-400" />
                  Popular Categories
                </h2>

                {platformStats?.popularTags?.length === 0 ? (
                  <span className="text-gray-300 text-xs">No categorizing records.</span>
                ) : (
                  <div className="flex flex-col gap-3">
                    {platformStats?.popularTags?.map((tag: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs select-none">
                        <div className="inline-flex items-center gap-1.5 font-bold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg">
                          #{tag.name}
                        </div>
                        <span className="font-semibold text-gray-400 shrink-0">{tag.count} articles</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Influential Authors Leaderboard */}
              <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-2xs md:col-span-2">
                <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-1.5 select-none border-b border-gray-50 pb-3">
                  <Award className="w-4.5 h-4.5 text-gray-400" />
                  Top Content Producers
                </h2>

                <div className="divide-y divide-gray-50">
                  {platformStats?.popularAuthors?.map((author: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black font-serif text-gray-300 w-5 select-none">
                          #{i+1}
                        </span>
                        <img
                          src={author.avatar}
                          alt={author.name}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-xl object-cover"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{author.name}</p>
                          <p className="text-[10px] text-gray-400 font-medium">{author.blogsCount} articles written</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right select-none shrink-0">
                        <div>
                          <p className="text-xs font-bold text-gray-950 font-sans">{author.totalViews}</p>
                          <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">Total Views</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
