/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutDashboard, Briefcase, Columns3, BarChart3, Calendar, Settings, HelpCircle, Plus, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddNewJob: () => void;
  userProfile: {
    name: string;
    role: string;
    avatarUrl: string;
  };
}

export default function Sidebar({ activeTab, setActiveTab, onAddNewJob, userProfile }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
    { id: 'applications', label: 'Ứng tuyển', icon: Briefcase },
    { id: 'kanban', label: 'Bảng Kanban', icon: Columns3 },
    { id: 'insights', label: 'Phân tích & Báo cáo', icon: BarChart3 },
    { id: 'schedule', label: 'Lịch trình', icon: Calendar },
  ];

  const utilityItems = [
    { id: 'settings', label: 'Cài đặt', icon: Settings },
    { id: 'support', label: 'Hỗ trợ', icon: HelpCircle },
  ];

  return (
    <aside className="bg-surface-lowest h-screen w-64 border-r border-outline-variant flex flex-col overflow-y-auto shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xl border border-primary/30">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-primary tracking-tight font-sans">CareerFlow</h1>
          <p className="text-xs text-secondary font-medium">Tài khoản Pro</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-sans font-medium transition-all text-left relative group ${
                isActive
                  ? 'text-primary bg-surface-low border-r-2 border-primary font-bold shadow-sm'
                  : 'text-secondary hover:text-on-surface hover:bg-surface-low/50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-secondary group-hover:text-primary'}`} />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Action Button Section */}
      <div className="p-4 border-t border-outline-variant/30">
        <button
          onClick={onAddNewJob}
          className="w-full bg-primary text-on-primary font-sans font-semibold text-sm py-2 px-4 rounded-lg hover:bg-primary-fixed-dim hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm công việc mới</span>
        </button>
      </div>

      {/* Footer Navigation */}
      <div className="px-3 pb-6 pt-4 border-t border-outline-variant/30 flex flex-col gap-1">
        {utilityItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-sans font-medium transition-all text-left group ${
                isActive
                  ? 'text-primary bg-surface-low border-r-2 border-primary font-bold'
                  : 'text-secondary hover:text-on-surface hover:bg-surface-low/50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-secondary group-hover:text-primary'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* User Info & Quick Sign Out */}
        <div className="mt-4 pt-4 border-t border-outline-variant/30 flex items-center gap-3 px-3">
          <img
            src={userProfile.avatarUrl}
            alt="Profile Avatar"
            className="w-9 h-9 rounded-full border border-outline-variant/50 object-cover"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-on-surface truncate">{userProfile.name}</h4>
            <p className="text-xs text-secondary truncate">{userProfile.role}</p>
          </div>
          <button 
            title="Đăng xuất"
            onClick={() => alert("Đăng xuất giả lập: Cảm ơn bạn đã trải nghiệm CareerFlow!")}
            className="text-secondary hover:text-error transition-colors p-1 rounded hover:bg-surface-low"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
