/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Save, Sparkles, Image as ImageIcon, Eye, Edit2, Tag, AlertCircle } from 'lucide-react';
import { BlogPost } from '../types.js';

interface BlogFormProps {
  post?: BlogPost | null; // If editing, pass the post
  onSave: (data: { title: string; content: string; excerpt?: string; coverImage?: string; tags?: string[] }) => Promise<void>;
  onBack: () => void;
}

const PRESET_COVERS = [
  { name: 'Minimal Workspace', url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Developer Desk', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Cozy Coding', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Abstract Art', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=80' },
];

export default function BlogForm({ post, onSave, onBack }: BlogFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0].url);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Load existing blog post details if in edit mode
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setExcerpt(post.excerpt);
      setCoverImage(post.coverImage);
      setTags(post.tags);
    } else {
      setTitle('');
      setContent('');
      setExcerpt('');
      setCoverImage(PRESET_COVERS[0].url);
      setTags([]);
    }
    setError('');
  }, [post]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleaned = tagInput.trim().replace(/[^a-zA-Z0-9]/g, ''); // only alphanumeric tags
      if (cleaned && !tags.includes(cleaned)) {
        setTags([...tags, cleaned]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (idx: number) => {
    setTags(tags.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and Content body cannot be empty.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSave({
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim(),
        coverImage,
        tags,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to submit article. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper rendering simple inline Markdown parser on the preview tab
  const renderPreviewMarkdown = (text: string) => {
    if (!text) return <p className="text-gray-300 italic">Start writing something elegant in the editor to see your draft here...</p>;
    
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Headers
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-xl font-bold text-gray-900 mt-6 mb-3 font-sans tracking-tight">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-lg font-bold text-gray-900 mt-5 mb-2 font-sans tracking-tight">{line.replace('### ', '')}</h3>;
      }
      
      // Bullet points
      if (line.startsWith('- ')) {
        return <li key={i} className="text-sm text-gray-600 leading-relaxed ml-4 list-disc mb-1">{line.replace('- ', '')}</li>;
      }

      // Inline code blocks
      if (line.startsWith('`') && line.endsWith('`')) {
        return (
          <pre key={i} className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs font-mono text-gray-700 overflow-x-auto my-3 select-all leading-normal">
            <code>{line.replace(/`/g, '')}</code>
          </pre>
        );
      }

      // Empty spacing
      if (line.trim() === '') {
        return <div key={i} className="h-3" />;
      }

      return <p key={i} className="text-sm text-gray-600 leading-relaxed font-normal mb-3">{line}</p>;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6"
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to articles
      </button>

      {/* Editor & Meta header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-sans text-gray-950 tracking-tight flex items-center gap-2 select-none">
            <Sparkles className="w-6 h-6 text-gray-900 fill-current" />
            {post ? 'Edit Article Draft' : 'Write New Article'}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5 select-none">
            Markdown formatting is supported for headers, code blocks, lists, and spacing.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-2xl ring-1 ring-gray-100 self-start">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all border-0 ${
              activeTab === 'edit'
                ? 'bg-white text-gray-950 shadow-xs'
                : 'text-gray-400 hover:text-gray-900'
            }`}
          >
            <Edit2 className="w-3.5 h-3.5" />
            Write Section
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all border-0 ${
              activeTab === 'preview'
                ? 'bg-white text-gray-950 shadow-xs'
                : 'text-gray-400 hover:text-gray-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Live Preview
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2.5 p-4 rounded-2xl bg-red-50 text-red-700 text-sm font-semibold border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Submission container */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editing area */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {activeTab === 'edit' ? (
            <div className="flex flex-col gap-5 bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-xs">
              {/* Title input */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 select-none">Article Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="The Beauty of Negative Space in Modern UX..."
                  className="w-full text-base sm:text-lg font-bold text-gray-900 placeholder:text-gray-300 rounded-xl border border-gray-100 bg-gray-50/50 py-3 px-4 focus:bg-white focus:outline-0 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                />
              </div>

              {/* Excerpt / Summary */}
              <div>
                <div className="flex items-center justify-between mb-2 select-none">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Brief Excerpt</label>
                  <span className="text-[10px] text-gray-400 font-semibold">{excerpt.length}/150 char limit</span>
                </div>
                <input
                  type="text"
                  value={excerpt}
                  maxLength={150}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A concise, high-impact summary to capture attention on reading grids..."
                  className="w-full text-xs font-medium text-gray-600 placeholder:text-gray-300 rounded-xl border border-gray-100 bg-gray-50/50 py-3 px-4 focus:bg-white focus:outline-0 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                />
              </div>

              {/* Body Textarea */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 select-none">Article Content Body (Markdown supported)</label>
                <textarea
                  required
                  rows={14}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="## Start writing your article draft here...&#10;&#10;Explore visual storytelling with paragraph layouts. Use lists to organize:&#10;- Subtopic Item Number One&#10;- Subtopic Item Number Two&#10;&#10;Use three backticks or single backticks for `monospaced blocks` to display code or stats cleanly."
                  className="w-full font-mono text-sm leading-relaxed text-gray-900 placeholder:text-gray-300 rounded-xl border border-gray-100 bg-gray-50/50 p-4 focus:bg-white focus:outline-0 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          ) : (
            /* Live Preview Container */
            <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs min-h-[450px]">
              {/* Cover Banner Mockup */}
              <div className="w-full aspect-16/7 rounded-2xl overflow-hidden mb-6 relative bg-gray-50 shadow-sm border border-gray-100">
                <img
                  src={coverImage}
                  alt="Draft Cover"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Headline */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 font-sans tracking-tight mb-4">
                {title || 'Untitled Draft Headline'}
              </h1>

              {/* Tags panel */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg uppercase tracking-wider"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Parsed Body */}
              <div className="prose max-w-none border-t border-gray-50 pt-6">
                {renderPreviewMarkdown(content)}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Configuration Panel */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-xs flex flex-col gap-5 select-none">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-50 pb-3">
              <ImageIcon className="w-4.5 h-4.5 text-gray-400" />
              Settings & Assets
            </h2>

            {/* Custom Cover Image config */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Display Cover Image</label>
              <div className="flex flex-col gap-3">
                {/* Selected Image Thumbnail preview */}
                <div className="aspect-16/9 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                  <img
                    src={coverImage}
                    alt="Active Cover"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="Paste direct Unsplash/JPG URL..."
                  className="w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-900 focus:bg-white focus:outline-0 focus:ring-1 focus:ring-gray-900 focus:border-transparent transition-all"
                />
              </div>

              {/* Presets Grid */}
              <div className="mt-3.5">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Quick Presets</span>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_COVERS.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCoverImage(preset.url)}
                      className={`relative aspect-16/10 rounded-lg overflow-hidden border-2 transition-all ${
                        coverImage === preset.url
                          ? 'border-gray-900 scale-[1.03] shadow-xs'
                          : 'border-transparent filter brightness-90 hover:brightness-100'
                      }`}
                      title={preset.name}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/10 hover:bg-transparent" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tags Setup */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Categorization Tags</label>
              <div className="flex flex-col gap-2.5">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Tag className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type tag (Design, Tech) & hit Enter"
                    className="w-full rounded-xl border border-gray-100 bg-gray-50 pl-9 pr-3 py-2 text-xs text-gray-900 focus:bg-white focus:outline-0 focus:ring-1 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </div>

                {/* Active tag pills */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 bg-gray-50/50 p-2 rounded-xl ring-1 ring-gray-100/50">
                    {tags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 bg-white text-gray-900 border border-gray-200 pl-2 pr-1 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-2xs"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(i)}
                          className="hover:bg-red-50 hover:text-red-600 rounded p-[1px] transition-colors border-0 shrink-0"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Authoring Guidelines Checklist */}
            <div className="bg-gray-50/50 rounded-2xl p-3.5 border border-gray-100">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Publishing Ethics</span>
              <ul className="text-[10px] text-gray-500 font-medium flex flex-col gap-1.5 leading-normal">
                <li className="flex items-start gap-1.5">
                  <span className="text-gray-900 font-bold shrink-0">•</span>
                  Ensure headers align with layout readability.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-gray-900 font-bold shrink-0">•</span>
                  Provide useful snippets inside preformatted code boxes.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-gray-900 font-bold shrink-0">•</span>
                  Avoid massive dense paragraphs. Use negative spaces.
                </li>
              </ul>
            </div>

            {/* Editor CTA button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {post ? 'Update Article' : 'Publish Article'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
