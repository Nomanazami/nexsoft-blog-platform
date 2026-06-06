/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, User as UserIcon, Lock, Sparkles, CheckCircle, AlertCircle, Camera } from 'lucide-react';
import { api } from '../lib/api.js';
import { User } from '../types.js';

interface UserProfileProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onBack: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80',
];

export default function UserProfile({ user, onUpdateUser, onBack }: UserProfileProps) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar);
  const [customAvatar, setCustomAvatar] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (password && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const finalAvatar = customAvatar.trim() || avatar;
      const response = await api.updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        avatar: finalAvatar,
        ...(password ? { password } : {})
      });

      onUpdateUser(response);
      setSuccessMsg('Account details updated successfully.');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update account details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6"
    >
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer mb-6 border-0"
      >
        <ArrowLeft className="w-4 h-4" />
        Back parsing feed
      </button>

      <div className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-8 shadow-xs">
        <div className="border-b border-gray-50 pb-5 mb-6 select-none">
          <h1 className="text-xl sm:text-2xl font-bold font-sans text-gray-950 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5.5 h-5.5 text-gray-900" />
            Writer Account Profile
          </h1>
          <p className="text-sm text-gray-400 mt-1">Configure your public writing representation and password credentials.</p>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="mb-6 flex items-start gap-2.5 p-4 rounded-2xl bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-150">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 flex items-start gap-2.5 p-4 rounded-2xl bg-red-50 text-red-700 text-sm font-semibold border border-red-105">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Avatar Selector row */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 select-none">Author avatar</label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl border-2 overflow-hidden bg-gray-50 border-gray-150 shrink-0 shadow-xs relative">
                <img
                  src={customAvatar.trim() || avatar}
                  alt={name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 select-none">
                  {PRESET_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setAvatar(url);
                        setCustomAvatar('');
                      }}
                      className={`relative w-9 h-9 rounded-xl border-2 overflow-hidden transition-all shrink-0 ${
                        avatar === url && !customAvatar
                          ? 'border-gray-900 scale-105'
                          : 'border-transparent filter grayscale hover:grayscale-0'
                      }`}
                    >
                      <img src={url} alt="preset avatar" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <input
                  type="url"
                  value={customAvatar}
                  onChange={(e) => {
                    setCustomAvatar(e.target.value);
                    setAvatar('');
                  }}
                  placeholder="Or paste direct Avatar URL (e.g. Unsplash)..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs text-gray-900 focus:bg-white focus:outline-0 focus:ring-1 focus:ring-gray-900 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Display name */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 select-none">Public Signature</label>
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

            {/* Email (Readonly) */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 select-none">Email address (Static)</label>
              <input
                type="text"
                disabled
                value={user.email}
                className="w-full rounded-xl border border-gray-200 bg-gray-100 py-2.5 px-4 text-sm text-gray-400 select-all cursor-not-allowed font-medium"
              />
            </div>
          </div>

          {/* Writer Bio */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 select-none">Biography</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell readers about what topics you produce..."
              className="w-full text-sm leading-relaxed text-gray-800 placeholder:text-gray-300 rounded-xl border border-gray-200 bg-gray-50/50 p-3 flex focus:bg-white focus:outline-0 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Change password section */}
          <div className="border-t border-gray-50 pt-5 mt-2 flex flex-col gap-4">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider select-none mb-1">Modify Access Credentials (Optional)</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">New Password (Secret)</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:bg-white focus:outline-0 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:bg-white focus:outline-0 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
            ) : (
              'Save Account Updates'
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
