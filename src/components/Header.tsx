/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, PenSquare, LogOut, User as UserIcon, BarChart3, BookOpen, Menu, X, Settings } from 'lucide-react';
import { User } from '../types.js';

interface HeaderProps {
  user: User | null;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onNavigate: (view: 'explore' | 'write' | 'dashboard' | 'profile' | 'blog-details') => void;
  currentView: string;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export default function Header({
  user,
  onSearchChange,
  searchQuery,
  onNavigate,
  currentView,
  onOpenAuth,
  onLogout
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleNavClick = (view: 'explore' | 'write' | 'dashboard' | 'profile' | 'blog-details') => {
    onNavigate(view);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/75 border-b border-gray-100 flex justify-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div 
          onClick={() => handleNavClick('explore')} 
          className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center text-white font-serif font-black text-xl tracking-wider shadow-sm group-hover:scale-105 transition-transform duration-200">
            B
          </div>
          <span className="font-sans font-bold text-lg tracking-tight text-gray-900 group-hover:text-gray-600 transition-colors">
            Blog<span className="text-gray-400 font-normal">Platform</span>
          </span>
        </div>

        {/* Global Search (only relevant in explore / main page) */}
        <div className="flex-1 max-w-md hidden sm:block relative">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
            <Search className="h-4.5 w-4.5" />
          </div>
          <input
            type="text"
            placeholder="Search articles, tags, authors..."
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (currentView !== 'explore') {
                onNavigate('explore');
              }
            }}
            className="w-full rounded-2xl border-0 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-900 focus:outline-0 transition-all duration-150"
          />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => handleNavClick('explore')}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
              currentView === 'explore'
                ? 'bg-gray-50 text-gray-900'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/50'
            }`}
          >
            Explore
          </button>

          {user && (
            <>
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-gray-50 text-gray-900'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/50'
                }`}
              >
                Dashboard
              </button>
            </>
          )}
        </nav>

        {/* Desktop Actions / Profile */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={() => handleNavClick('write')}
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-sm transition-all duration-150 hover:shadow"
              >
                <PenSquare className="w-4 h-4" />
                Write
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                  className="w-9 h-9 rounded-xl border border-gray-100 overflow-hidden focus:outline-2 focus:outline-offset-2 focus:outline-gray-900 cursor-pointer transition-all duration-150 relative group"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-56 rounded-2xl bg-white p-2.5 shadow-lg ring-1 ring-gray-900/5 focus:outline-none flex flex-col gap-0.5 divide-y divide-gray-50">
                    <div className="px-3.5 py-2 md:py-2.5 select-none">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <div className="py-1 flex flex-col gap-0.5">
                      <button
                        onMouseDown={() => handleNavClick('profile')}
                        className="flex items-center gap-2 px-3.5 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors w-full text-left"
                      >
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        My Profile
                      </button>
                      <button
                        onMouseDown={() => handleNavClick('dashboard')}
                        className="flex items-center gap-2 px-3.5 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors w-full text-left"
                      >
                        <BarChart3 className="w-4 h-4 text-gray-400" />
                        Writer Studio
                      </button>
                    </div>
                    <div className="pt-1">
                      <button
                        onMouseDown={onLogout}
                        className="flex items-center gap-2 px-3.5 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50/50 rounded-xl transition-colors w-full text-left font-medium"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-5 py-2 rounded-xl transition-colors shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          {user && (
            <button
              onClick={() => handleNavClick('write')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
              title="Write article"
            >
              <PenSquare className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="absolute top-16 inset-x-0 bg-white border-b border-gray-100 p-4 shadow-xl z-20 flex flex-col gap-4 md:hidden">
          {/* Mobile Search */}
          <div className="relative sm:hidden">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              placeholder="Search articles, tags, authors..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl border-0 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-900 focus:outline-0 transition-all duration-150"
            />
          </div>

          <nav className="flex flex-col gap-1">
            <button
              onClick={() => handleNavClick('explore')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                currentView === 'explore'
                  ? 'bg-gray-50 text-gray-900'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-gray-400" />
              Explore Articles
            </button>

            {user ? (
              <>
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-gray-50 text-gray-900'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                  Writer Studio
                </button>
                <button
                  onClick={() => handleNavClick('profile')}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    currentView === 'profile'
                      ? 'bg-gray-50 text-gray-900'
                      : 'text-gray-500 hover:text-gray-900- hover:bg-gray-50/50'
                  }`}
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  Account Profile
                </button>
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <div className="flex items-center gap-3 px-3.5 py-2">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50/50 rounded-xl transition-colors w-full text-left font-semibold mt-1"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full text-center bg-gray-900 text-white font-semibold py-2.5 rounded-xl hover:bg-gray-800 transition-colors mt-2"
              >
                Sign In / Sign Up
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
