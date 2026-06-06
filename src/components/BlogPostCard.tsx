/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Eye, Heart, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { BlogPost, User } from '../types.js';

interface BlogPostCardProps {
  key?: any;
  post: BlogPost;
  user: User | null;
  onPostClick: (id: string) => void;
  onTagClick: (tag: string) => void;
  onLikeToggle: (id: string, e?: React.MouseEvent) => void;
  isLiked: boolean;
}

export default function BlogPostCard({
  post,
  user,
  onPostClick,
  onTagClick,
  onLikeToggle,
  isLiked
}: BlogPostCardProps) {
  
  // Format dates elegantly
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

  const readTime = Math.max(1, Math.ceil(post.content.split(/\s+/).length / 225));

  return (
    <article 
      onClick={() => onPostClick(post.id)}
      className="group flex flex-col bg-white rounded-3xl border border-gray-100 hover:border-gray-200/80 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer h-full"
    >
      {/* Cover Image Wrapper */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-gray-50 shrink-0">
        <img
          src={post.coverImage}
          alt={post.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 will-change-transform"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent" />
        
        {/* Floating Read Time */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-semibold text-gray-900 uppercase tracking-wider shadow-sm select-none">
          <Clock className="w-3.5 h-3.5" />
          {readTime} Min Read
        </div>
      </div>

      {/* Grid Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Tags cloud */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, 3).map((tag, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick(tag);
                }}
                className="text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-900 hover:text-white px-2.5 py-1 rounded-lg uppercase tracking-wider transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Heading */}
          <h3 className="font-sans font-bold text-lg leading-snug text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-gray-400 text-sm mt-2 font-normal line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-4 border-t border-gray-50/80 flex flex-col gap-3.5">
          {/* Author Details Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={post.authorAvatar}
                alt={post.authorName}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-lg object-cover ring-2 ring-gray-100/50"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-950 truncate select-none">{post.authorName}</p>
                <p className="text-[10px] text-gray-400 font-medium">{formatDate(post.createdAt)}</p>
              </div>
            </div>

            {/* Read Arrow indicator */}
            <div className="w-7 h-7 bg-gray-50 group-hover:bg-gray-900 group-hover:text-white text-gray-400 rounded-lg flex items-center justify-center transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Interactive stats row */}
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold border-t border-gray-50/40 pt-2.5">
            <div className="flex items-center gap-3.5 select-none">
              <span className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
                <Eye className="w-4 h-4 text-gray-300" />
                {post.views}
              </span>
              <span className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
                <MessageSquare className="w-4 h-4 text-gray-300" />
                {post.comments?.length || 0}
              </span>
            </div>

            {/* Like trigger */}
            <button
              type="button"
              onClick={(e) => onLikeToggle(post.id, e)}
              className={`flex items-center gap-1.5 py-1 -m-1 transition-all rounded px-2 ring-transparent select-none border-0 ${
                isLiked 
                  ? 'text-red-500 font-bold scale-102' 
                  : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart 
                className={`w-4 h-4 transition-transform ${
                  isLiked ? 'fill-current stroke-current scale-110' : 'text-gray-300 hover:scale-110'
                }`} 
              />
              <span>{post.likes?.length || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
