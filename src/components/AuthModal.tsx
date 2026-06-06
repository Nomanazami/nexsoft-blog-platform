/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, Keyboard, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../lib/api.js';
import { User } from '../types.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User, token: string) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80',
];

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [customAvatar, setCustomAvatar] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const resetFields = () => {
    setName('');
    setEmail('');
    setPassword('');
    setBio('');
    setError('');
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const data = await api.login(email, password);
        onAuthSuccess(data.user, data.token);
        onClose();
        resetFields();
      } else {
        const finalAvatar = customAvatar.trim() || selectedAvatar;
        const data = await api.register({
          name,
          email,
          password,
          bio,
          avatar: finalAvatar,
        });
        onAuthSuccess(data.user, data.token);
        onClose();
        resetFields();
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  if(!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-100/50 z-10"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex w-11 h-11 items-center justify-center rounded-2xl bg-gray-900 text-white mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Join as Author'}
          </h2>
          <p className="text-sm text-gray-400 mt-1 select-none">
            {isLogin ? 'Sign in to publish articles & write comments' : 'Create an account to start your blogging path'}
          </p>
        </div>

        {/* Error Notification */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold leading-relaxed border border-red-100">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Register Profile Setup */}
          {!isLogin && (
            <div className="flex flex-col gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Display Name</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Elena Rostova"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:bg-white focus:outline-0 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Bio (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">About Yourself (Bio)</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-start pl-3.5 pt-3.5 text-gray-400">
                    <Keyboard className="w-4 h-4" />
                  </div>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={2}
                    placeholder="Short bio about what you write..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:bg-white focus:outline-0 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Select Avatar</label>
                <div className="flex items-center gap-3">
                  {PRESET_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(url);
                        setCustomAvatar('');
                      }}
                      className={`relative w-11 h-11 rounded-xl border-2 overflow-hidden transition-all shrink-0 ${
                        selectedAvatar === url && !customAvatar
                          ? 'border-gray-900 scale-105 shadow-sm'
                          : 'border-transparent filter grayscale hover:grayscale-0 hover:scale-102'
                      }`}
                    >
                      <img src={url} alt="preset avatar" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <div className="mt-2.5">
                  <input
                    type="url"
                    value={customAvatar}
                    onChange={(e) => {
                      setCustomAvatar(e.target.value);
                      setSelectedAvatar('');
                    }}
                    placeholder="Or paste custom Avatar Image URL..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs text-gray-900 focus:bg-white focus:outline-0 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:bg-white focus:outline-0 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:bg-white focus:outline-0 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Toggle Footer */}
        <div className="mt-5 text-center text-xs text-gray-400 font-medium border-t border-gray-50 pt-4 select-none">
          {isLogin ? (
            <p>
              New reporter?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
                className="text-gray-900 hover:underline font-bold"
              >
                Create Account
              </button>
            </p>
          ) : (
            <p>
              Already have an author account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
                className="text-gray-900 hover:underline font-bold"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
