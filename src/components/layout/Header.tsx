import React, { useState } from 'react';
import { useOperations } from '../../context/OperationsContext';
import {
  Search,
  Bell,
  PlayCircle,
  Presentation,
  ShieldCheck,
  RotateCcw,
  UserCheck,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  onNavigate: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const {
    currentUser,
    users,
    setCurrentUser,
    notifications,
    toggleNotificationDrawer,
    stones,
    openStoneDetail,
    startWalkthrough,
    startPresentation,
    resetDemoData,
  } = useOperations();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredStones = searchQuery.trim()
    ? stones
        .filter(
          (s) =>
            s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.certificateReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.shape.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 6)
    : [];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Persistent Disclaimer Banner */}
      <div className="bg-navy-950 text-slate-300 px-4 py-1.5 text-xs flex items-center justify-between border-b border-navy-800">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white tracking-wider">
            INTERACTIVE CONCEPT DEMO · SIMULATED DATA · NOT CONNECTED TO SIMSTAR SYSTEMS
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-4 text-slate-400 text-[11px]">
          <span>Basel Edition · Operating Day 2 of 3</span>
          <span>•</span>
          <span>Vault Security: <strong className="text-emerald-400">Level 4 Active</strong></span>
          <span>•</span>
          <span>Central ERP: <strong className="text-sky-400">Mock Bridge Connected</strong></span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand & Exhibition Title */}
        <div className="flex items-center space-x-3 min-w-[280px]">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                Diamond Exhibition – Demo
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                Floor Ops
              </span>
            </div>
            <p className="text-xs text-slate-500">
              One-of-a-Kind High-Value Diamond Custody & Transaction Engine
            </p>
          </div>
        </div>

        {/* Center: Global Stone Search */}
        <div className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search diamond by ID (e.g. DIA-2048) or Certificate..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search dropdown results */}
          {isSearchOpen && filteredStones.length > 0 && (
            <div
              className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 text-xs"
              onMouseLeave={() => setIsSearchOpen(false)}
            >
              <div className="px-3 py-1 font-semibold text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-100">
                Matching Inventory Stones ({filteredStones.length})
              </div>
              {filteredStones.map((stone) => (
                <div
                  key={stone.id}
                  onClick={() => {
                    openStoneDetail(stone.id);
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="px-3 py-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between border-b border-slate-50 last:border-none"
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900">{stone.id}</span>
                    <span className="text-slate-500">
                      {stone.carat}ct · {stone.shape} · {stone.colour}/{stone.clarity}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
                      {stone.physicalStatus}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-brand-50 text-brand-700">
                      {stone.commercialStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Action Controls: Guided Walkthrough, Presentation, Notifications, Role Switcher */}
        <div className="flex items-center space-x-2.5">
          {/* Start Walkthrough Button */}
          <button
            onClick={() => {
              startWalkthrough();
              onNavigate('walkthrough');
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 shadow-sm transition active:scale-95"
            title="Start Guided Scenario Walkthrough for DIA-2048"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Start Walkthrough</span>
          </button>

          {/* Presentation Mode Button */}
          <button
            onClick={() => startPresentation()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-navy-900 text-slate-100 hover:bg-navy-800 border border-navy-700 transition active:scale-95 shadow-sm"
            title="Enter Interviewer Presentation Mode"
          >
            <Presentation className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Presentation Mode</span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (window.confirm('Reset all demo records back to initial state?')) {
                resetDemoData();
              }
            }}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition"
            title="Reset Demo State to Initial Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Notification Bell */}
          <button
            onClick={toggleNotificationDrawer}
            className="relative p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition"
            title="Open Operational Notifications Center"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Role & Current User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
              className="flex items-center space-x-2 pl-2 pr-3 py-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition text-left"
            >
              <div className="w-7 h-7 rounded-full bg-navy-800 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {currentUser.avatarInitials}
              </div>
              <div className="hidden lg:block text-xs">
                <div className="font-semibold text-slate-900 leading-tight flex items-center gap-1">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu to switch active role */}
            {isRoleDropdownOpen && (
              <div
                className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 text-xs"
                onMouseLeave={() => setIsRoleDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
                    Switch Simulated Actor
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Test role-based permissions & dashboards
                  </p>
                </div>
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setCurrentUser(user);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-start space-x-2 hover:bg-slate-50 transition ${
                      currentUser.id === user.id ? 'bg-brand-50/60 font-semibold text-brand-900' : 'text-slate-700'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {user.avatarInitials}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900">{user.name}</span>
                        {currentUser.id === user.id && (
                          <UserCheck className="w-3.5 h-3.5 text-brand-600" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500">{user.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
