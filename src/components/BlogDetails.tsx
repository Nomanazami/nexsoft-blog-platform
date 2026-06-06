/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Clock, Eye, Heart, MessageSquare, Tag, Trash2, Send, CornerDownRight, AlertCircle } from 'lucide-react';
import { BlogPost, User, Comment } from '../types.js';
import { api } from '../lib/api.js';

interface BlogDetailsProps {
  postId: string;
  user: User | null;
  onBack: () => void;
  onTagClick: (tag: string) => void;
  onLikeToggle: (id: string) => void;
  isLiked: boolean;
  onOpenAuth: () => void;
}

export default function BlogDetails({
  postId,
  user,
  onBack,
  onTagClick,
  onLikeToggle,
  isLiked,
  onOpenAuth
}: BlogDetailsProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [errorChat, setErrorChat] = useState('');

  useEffect(() => {
    fetchPostAndComments();
  }, [postId]);

  const fetchPostAndComments = async () => {
    setIsLoading(true);
    try {
      const b = await api.getBlogById(postId);
      setPost(b);
      setComments(b.comments || []);
    } catch (err: any) {
      console.error('Failed to resolve blog details', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    setErrorChat('');

    try {
      const comment = await api.addComment(postId, newComment.trim());
      setComments([comment, ...comments]);
      setNewComment('');
      
      // Lazily update post comment count matching local states
      if (post) {
        setPost({
          ...post,
          comments: [comment, ...comments]
        });
      }
    } catch (err: any) {
      setErrorChat(err?.message || 'Failed to post comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const confirmDelete = window.confirm('Are you certain you want to remove this comment?');
    if (!confirmDelete) return;

    try {
      await api.deleteComment(postId, commentId);
      const filtered = comments.filter((c) => c.id !== commentId);
      setComments(filtered);

      if (post) {
        setPost({
          ...post,
          comments: filtered
        });
      }
    } catch (err: any) {
      alert(err?.message || 'Could not verify comment deletion permission.');
    }
  };

  const handleLikeClick = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    onLikeToggle(postId);
    
    // Optimistic local state update in detail page
    if (post) {
      const isLikedCurrently = post.likes.includes(user.id);
      const newLikes = isLikedCurrently 
        ? post.likes.filter(id => id !== user.id)
        : [...post.likes, user.id];
      
      setPost({
        ...post,
        likes: newLikes
      });
    }
  };

  if (isLoading || !post) {
    return (
      <div className="w-full flex justify-center py-24 select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-xs font-semibold">Resolving article context...</p>
        </div>
      </div>
    );
  }

  const readTime = Math.max(1, Math.ceil(post.content.split(/\s+/).length / 225));

  // Premium Markdown rendering utility
  const renderRichBody = (rawContent: string) => {
    const lines = rawContent.split('\n');
    return lines.map((line, i) => {
      // Heading level 2
      if (line.startsWith('## ')) {
        return (
          <h2 key={i} className="text-xl sm:text-2xl font-bold font-sans text-gray-900 mt-8 mb-4 tracking-tight border-b border-gray-50 pb-2">
            {line.replace('## ', '')}
          </h2>
        );
      }
      // Heading level 3
      if (line.startsWith('### ')) {
        return (
          <h3 key={i} className="text-lg sm:text-xl font-bold font-sans text-gray-900 mt-6 mb-3 tracking-tight">
            {line.replace('### ', '')}
          </h3>
        );
      }
      // Unordered list item
      if (line.startsWith('- ')) {
        return (
          <li key={i} className="text-sm sm:text-base text-gray-700 leading-relaxed ml-5 list-disc mb-1.5 font-normal">
            {line.replace('- ', '')}
          </li>
        );
      }
      // Block quote
      if (line.startsWith('> ')) {
        return (
          <div key={i} className="border-l-4 border-gray-900 bg-gray-50/50 p-4 rounded-r-xl italic my-4 text-sm sm:text-base text-gray-600 font-medium">
            {line.replace('> ', '')}
          </div>
        );
      }
      // Code blocks
      if (line.startsWith('`') && line.endsWith('`')) {
        return (
          <pre key={i} className="bg-gray-950 border border-gray-900 rounded-2xl p-4 text-xs font-mono text-gray-200 overflow-x-auto my-5 select-all leading-normal">
            <code>{line.replace(/`/g, '')}</code>
          </pre>
        );
      }
      // Spacing blocks
      if (line.trim() === '') {
        return <div key={i} className="h-4" />;
      }
      
      return (
        <p key={i} className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal mb-4">
          {line}
        </p>
      );
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6"
    >
      {/* Back to explore */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back parsing feed
      </button>

      {/* Header Info */}
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3.5xl font-extrabold text-gray-950 tracking-tight leading-tight mb-4 font-sans">
          {post.title}
        </h1>

        {/* Date & Metadata metrics */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-5 select-none">
          <div className="flex items-center gap-3">
            <img
              src={post.authorAvatar}
              alt={post.authorName}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-gray-100"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-950 leading-tight">{post.authorName}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold mt-0.5">
                <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[10px]">
                  <Clock className="w-3.5 h-3.5" />
                  {readTime} MIN READ
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" /> {post.views} Views
            </span>
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" /> {comments.length} Comments
            </span>
          </div>
        </div>
      </header>

      {/* Hero Cover Area */}
      <div className="w-full aspect-16/9 rounded-3xl overflow-hidden mb-8 border border-gray-50 bg-gray-50 shadow-sm select-none">
        <img
          src={post.coverImage}
          alt="Article cover banner"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Article Post Content Body */}
      <main className="prose prose-slate max-w-none text-gray-800 tracking-normal antialiased">
        {renderRichBody(post.content)}
      </main>

      {/* Tags Cloud */}
      {post.tags?.length > 0 && (
        <div className="mt-8 pt-5 border-t border-gray-100 flex flex-wrap gap-2 select-none">
          {post.tags.map((tag, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onTagClick(tag)}
              className="inline-flex items-center gap-1 bg-gray-50 hover:bg-gray-900 hover:text-white text-xs font-bold text-gray-500 px-3 py-1.5 rounded-xl transition-colors uppercase tracking-wider border-0 cursor-pointer"
            >
              <Tag className="w-3.5 h-3.5" />
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Engagement Heart Bar */}
      <div className="my-8 py-4 px-5 rounded-2xl bg-gray-50/70 border border-gray-100 flex items-center justify-between select-none">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
          Enjoyed the read? Offer appreciation:
        </span>
        <button
          onClick={handleLikeClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold border shadow-2xs cursor-pointer transition-all dynamic-scale ${
            isLiked
              ? 'bg-red-50 border-red-100 text-red-600 scale-102'
              : 'bg-white border-gray-150 text-gray-500 hover:text-red-500 hover:border-red-105'
          }`}
        >
          <Heart className={`w-4 h-4 transition-transform ${isLiked ? 'fill-current stroke-current scale-110' : ''}`} />
          <span>{post.likes?.length || 0} Likes</span>
        </button>
      </div>

      {/* COMMENTS SECTION */}
      <section className="border-t border-gray-100 pt-8 mt-8">
        <h2 className="text-lg font-bold text-gray-950 font-sans tracking-tight flex items-center gap-2 mb-6 select-none">
          <MessageSquare className="w-5 h-5 text-gray-900" />
          Comments Section ({comments.length})
        </h2>

        {/* Comment input form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-3xs mb-6">
          <form onSubmit={handlePublishComment} className="flex flex-col gap-3">
            <textarea
              required
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "Share your thoughts on Elena's design ideas..." : "Sign in to post public comments..."}
              disabled={isSubmittingComment}
              className="w-full text-sm text-gray-800 placeholder:text-gray-300 bg-gray-50/40 rounded-xl p-3 focus:bg-white focus:outline-0 ring-1 ring-gray-100 focus:ring-2 focus:ring-gray-950 transition-all border-0 resize-none leading-relaxed"
            />

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-semibold select-none">Please adhere to helpful community guidelines.</span>
              <button
                type="submit"
                disabled={isSubmittingComment || !newComment.trim()}
                className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                {isSubmittingComment ? (
                  <div className="w-3.5 h-3.5 border border-white/60 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Publish Comment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {errorChat && (
          <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-red-50 text-red-750 text-xs font-semibold border border-red-100">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <span>{errorChat}</span>
          </div>
        )}

        {/* List of comments */}
        {comments.length === 0 ? (
          <div className="py-6 text-center select-none">
            <p className="text-gray-300 text-xs italic">Be the first to share comments on this piece!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {comments.map((comment) => {
                // Determine authorization to delete: creator of comment, admin, or creator of blog post
                const isCommentAuthor = user?.email.toLowerCase() === comment.authorEmail.toLowerCase();
                const isBlogAuthor = user?.id === post.authorId;
                const isAdmin = user?.role === 'admin';
                const canDelete = isCommentAuthor || isBlogAuthor || isAdmin;

                return (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="flex gap-3 p-4 bg-gray-50/40 rounded-2xl border border-gray-100/40 hover:border-gray-150 transition-all"
                  >
                    <img
                      src={comment.authorAvatar}
                      alt={comment.authorName}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-lg object-cover bg-gray-50 shrink-0"
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        {/* Name & timestamp */}
                        <div className="flex items-center justify-between gap-2 select-none">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs font-bold text-gray-950 truncate">{comment.authorName}</span>
                            {comment.authorEmail === post.authorEmail && (
                              <span className="inline-flex items-center text-[8px] font-black text-white bg-gray-900 px-1.5 py-0.2 rounded-md tracking-wider uppercase shrink-0 leading-none">
                                Author
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 font-medium shrink-0">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Content */}
                        <p className="text-xs sm:text-sm text-gray-700 font-normal leading-relaxed mt-1 whitespace-pre-line">
                          {comment.content}
                        </p>
                      </div>

                      {/* Comment actions (delete) */}
                      {canDelete && (
                        <div className="flex justify-end mt-2 select-none pt-1">
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="inline-flex items-center gap-1 text-[10px] text-gray-400 hover:text-red-600 font-bold border-0 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>
    </motion.article>
  );
}
