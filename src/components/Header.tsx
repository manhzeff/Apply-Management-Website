/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, Bell, HelpCircle, Menu } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  userProfile: {
    name: string;
    role: string;
    avatarUrl: string;
  };
  onMenuToggle: () => void;
}

export default function Header({ searchQuery, setSearchQuery, userProfile, onMenuToggle }: HeaderProps) {
  return (
    <header className="bg-surface-lowest flex justify-between items-center w-full px-6 py-3 h-16 sticky top-0 z-30 border-b border-outline-variant/30 select-none">
      {/* Search Bar - hidden on mobile, visible on tablet/desktop */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={onMenuToggle}
          className="p-1.5 text-secondary hover:text-on-surface hover:bg-surface-low rounded-lg transition-colors cursor-pointer"
          title="Menu điều hướng"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1">
          <span className="font-bold text-primary font-sans">CareerFlow</span>
        </div>
      </div>

      <div className="hidden md:flex flex-1 max-w-md relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors w-4 h-4 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm vị trí, công ty hoặc trạng thái..."
          className="w-full pl-10 pr-4 py-2 bg-surface-low border border-outline-variant/50 rounded-lg text-sm font-sans font-normal text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-secondary"
        />
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center gap-4">
        {/* Mobile Search Indicator - can show search inside a modal, or we just rely on filtering */}
        <div className="md:hidden flex max-w-xs relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm..."
            className="w-36 pl-8 pr-2 py-1 bg-surface-low border border-outline-variant/50 rounded-lg text-xs font-sans text-on-surface focus:outline-none focus:border-primary transition-all placeholder:text-secondary focus:w-48"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary w-3.5 h-3.5 pointer-events-none" />
        </div>

        {/* Notifications */}
        <button className="text-secondary hover:text-primary transition-colors p-1.5 rounded-full hover:bg-surface-low cursor-pointer relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
        </button>

        {/* Support Link */}
        <button className="text-secondary hover:text-primary transition-colors p-1.5 rounded-full hover:bg-surface-low hidden md:block cursor-pointer">
          <HelpCircle className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-outline-variant/50 mx-1 hidden sm:block"></div>

        {/* Profile Details */}
        <div className="flex items-center gap-3">
          <img
            src={userProfile.avatarUrl}
            alt="User avatar"
            className="w-8 h-8 rounded-full object-cover border border-outline-variant/50 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
          />
          <button
            onClick={() => alert("Đăng xuất giả lập: Cảm ơn bạn đã trải nghiệm CareerFlow!")}
            className="text-xs font-sans font-medium text-secondary hover:text-primary transition-colors hidden sm:block cursor-pointer"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
}
