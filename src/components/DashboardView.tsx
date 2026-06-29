/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Send, MessageSquare, Award, Edit2, Trash2, ArrowUpRight, Search, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { JobApplication, ApplicationStatus, STATUS_LABELS, LOCATION_LABELS } from '../types';
import { motion } from 'motion/react';

interface DashboardViewProps {
  applications: JobApplication[];
  onEdit: (app: JobApplication) => void;
  onDelete: (id: string) => void;
  onAddNewJob: () => void;
  activeSubView: 'table' | 'kanban';
  setActiveSubView: (view: 'table' | 'kanban') => void;
  searchQuery: string;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  onSelectApplication: (app: JobApplication) => void;
}

export default function DashboardView({
  applications,
  onEdit,
  onDelete,
  onAddNewJob,
  activeSubView,
  setActiveSubView,
  searchQuery,
  statusFilter,
  setStatusFilter,
  onSelectApplication,
}: DashboardViewProps) {
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const handleMetricClick = (targetStatus: string) => {
    if (statusFilter === targetStatus) {
      setStatusFilter('');
    } else {
      setStatusFilter(targetStatus);
    }
  };

  // Compute stats dynamically
  const stats = useMemo(() => {
    return {
      totalApplied: applications.filter(app => app.status !== 'wishlist').length,
      activeInterviews: applications.filter(app => app.status === 'interviewing').length,
      offersReceived: applications.filter(app => app.status === 'offered').length,
    };
  }, [applications]);

  // Filter & Search application items
  const filteredApps = useMemo(() => {
    let result = [...applications];

    // Status Filter
    if (statusFilter) {
      result = result.filter(app => app.status === statusFilter);
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        app =>
          app.companyName.toLowerCase().includes(q) ||
          app.jobTitle.toLowerCase().includes(q) ||
          app.notes?.toLowerCase().includes(q)
      );
    }

    // Sort by date descending
    return result.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
  }, [applications, statusFilter, searchQuery]);

  // Handle current page items
  const paginatedApps = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredApps.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredApps, currentPage]);

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage) || 1;

  // Safe page correction if filters change the size
  useMemo(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Helper to format date nicely
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Helper for status badge styling
  const getStatusBadge = (status: ApplicationStatus, round?: string) => {
    switch (status) {
      case 'interviewing':
        return (
          <div className="flex flex-col gap-1 items-start">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-status-interviewing/10 text-status-interviewing border border-status-interviewing/20">
              <span className="w-1.5 h-1.5 rounded-full bg-status-interviewing mr-2 animate-pulse"></span>
              {STATUS_LABELS.interviewing}
            </span>
            {round && (
              <span className="text-[10px] text-tertiary font-bold bg-tertiary/10 border border-tertiary/20 px-2 py-0.5 rounded-full mt-0.5 max-w-[120px] truncate" title={round}>
                {round}
              </span>
            )}
          </div>
        );
      case 'applied':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-status-applied/10 text-status-applied border border-status-applied/20">
            <span className="w-1.5 h-1.5 rounded-full bg-status-applied mr-2"></span>
            {STATUS_LABELS.applied}
          </span>
        );
      case 'offered':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-status-offered/10 text-status-offered border border-status-offered/20">
            <span className="w-1.5 h-1.5 rounded-full bg-status-offered mr-2"></span>
            {STATUS_LABELS.offered}
          </span>
        );
      case 'wishlist':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-status-wishlist/10 text-status-wishlist border border-status-wishlist/20">
            <span className="w-1.5 h-1.5 rounded-full bg-status-wishlist mr-2"></span>
            {STATUS_LABELS.wishlist}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-status-rejected/10 text-status-rejected border border-status-rejected/20">
            <span className="w-1.5 h-1.5 rounded-full bg-status-rejected mr-2"></span>
            {STATUS_LABELS.rejected}
          </span>
        );
    }
  };

  // Avatar generator background colors
  const getAvatarBg = (company: string) => {
    const code = company.charCodeAt(0) % 5;
    const colors = [
      'bg-blue-900/40 text-blue-300 border-blue-500/30',
      'bg-purple-900/40 text-purple-300 border-purple-500/30',
      'bg-emerald-900/40 text-emerald-300 border-emerald-500/30',
      'bg-amber-900/40 text-amber-300 border-amber-500/30',
      'bg-rose-900/40 text-rose-300 border-rose-500/30',
    ];
    return colors[code];
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        {/* Card 1: Total Applied */}
        <div
          onClick={() => handleMetricClick('applied')}
          className={`bg-surface-lowest border rounded-xl p-5 shadow-lg flex flex-col gap-3 relative overflow-hidden group hover:scale-[1.01] cursor-pointer hover:shadow-xl transition-all duration-300 ${
            statusFilter === 'applied'
              ? 'border-status-applied shadow-status-applied/5 ring-1 ring-status-applied/30 bg-surface-low'
              : 'border-outline-variant/30 hover:border-status-applied/50'
          }`}
        >
          <div className="flex justify-between items-center text-secondary">
            <span className="text-xs font-bold uppercase tracking-wider font-sans">Đã ứng tuyển</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="text-4xl font-bold text-on-surface font-sans mt-1">
            {stats.totalApplied}
          </div>
          {/* subtle glow accent */}
          <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
        </div>

        {/* Card 2: Active Interviews */}
        <div
          onClick={() => handleMetricClick('interviewing')}
          className={`bg-surface-lowest border rounded-xl p-5 shadow-lg flex flex-col gap-3 relative overflow-hidden group hover:scale-[1.01] cursor-pointer hover:shadow-xl transition-all duration-300 ${
            statusFilter === 'interviewing'
              ? 'border-status-interviewing shadow-status-interviewing/5 ring-1 ring-status-interviewing/30 bg-surface-low'
              : 'border-outline-variant/30 hover:border-status-interviewing/50'
          }`}
        >
          <div className="flex justify-between items-center text-secondary">
            <span className="text-xs font-bold uppercase tracking-wider font-sans">Phỏng vấn hiện tại</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-4xl font-bold text-on-surface font-sans mt-1">
            {stats.activeInterviews}
          </div>
          <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
        </div>

        {/* Card 3: Offers Received */}
        <div
          onClick={() => handleMetricClick('offered')}
          className={`bg-surface-lowest border rounded-xl p-5 shadow-lg flex flex-col gap-3 relative overflow-hidden group hover:scale-[1.01] cursor-pointer hover:shadow-xl transition-all duration-300 ${
            statusFilter === 'offered'
              ? 'border-status-offered shadow-status-offered/5 ring-1 ring-status-offered/30 bg-surface-low'
              : 'border-outline-variant/30 hover:border-status-offered/50'
          }`}
        >
          <div className="flex justify-between items-center text-secondary">
            <span className="text-xs font-bold uppercase tracking-wider font-sans">Lời mời nhận được (Offer)</span>
            <div className="w-8 h-8 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary border border-tertiary/20 animate-pulse">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-4xl font-bold text-on-surface font-sans mt-1">
            {stats.offersReceived}
          </div>
          <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-tertiary/5 rounded-full blur-2xl group-hover:bg-tertiary/10 transition-colors" />
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 bg-surface border border-outline-variant/30 rounded-xl p-4">
        {/* Toggle Taps */}
        <div className="flex border-b border-outline-variant/30 w-full sm:w-auto">
          <button
            onClick={() => setActiveSubView('table')}
            className={`px-4 py-2 font-sans text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeSubView === 'table'
                ? 'text-primary border-primary font-bold'
                : 'text-secondary hover:text-primary border-transparent hover:bg-surface-low/50'
            }`}
          >
            <span className="text-xs">☰</span> Chế độ Bảng
          </button>
          <button
            onClick={() => setActiveSubView('kanban')}
            className={`px-4 py-2 font-sans text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeSubView === 'kanban'
                ? 'text-primary border-primary font-bold'
                : 'text-secondary hover:text-primary border-transparent hover:bg-surface-low/50'
            }`}
          >
            <span className="text-xs">⊞</span> Chế độ Kanban
          </button>
        </div>

        {/* Filter and Mobile Quick Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="relative w-full sm:w-44">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none w-full bg-surface-lowest border border-outline-variant/50 text-sm font-sans text-on-surface py-2 pl-4 pr-10 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="wishlist">Ý định / Ước mơ</option>
              <option value="applied">Đã nộp đơn</option>
              <option value="interviewing">Đang phỏng vấn</option>
              <option value="offered">Nhận đề nghị (Offer)</option>
              <option value="rejected">Bị từ chối</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-xs">▼</span>
          </div>

          <button
            onClick={onAddNewJob}
            className="md:hidden bg-primary text-on-primary p-2.5 rounded-lg flex items-center justify-center shadow-md hover:bg-primary-fixed-dim transition-colors"
            title="Thêm hồ sơ ứng tuyển mới"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Table Content Panel */}
      {activeSubView === 'table' && (
        <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl shadow-lg overflow-hidden flex-1 flex flex-col min-h-[400px]">
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-outline-variant/30 select-none">
                  <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-secondary">Công ty</th>
                  <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-secondary">Vị trí / Hình thức</th>
                  <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-secondary">Trạng thái</th>
                  <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-secondary">Ngày nộp</th>
                  <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-secondary text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-sm font-sans text-on-surface divide-y divide-outline-variant/10">
                {paginatedApps.length > 0 ? (
                  paginatedApps.map((app) => (
                    <tr
                      key={app.id}
                      onClick={() => onSelectApplication(app)}
                      className="hover:bg-surface-low/40 transition-all group cursor-pointer"
                    >
                      {/* Company name with avatar monogram */}
                      <td className="px-6 py-4.5 whitespace-nowrap font-semibold">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-sm ${getAvatarBg(
                              app.companyName
                            )}`}
                          >
                            {app.companyName.charAt(0)}
                          </div>
                          <span className="text-on-surface group-hover:text-primary transition-colors">
                            {app.companyName}
                          </span>
                        </div>
                      </td>

                      {/* Job Title */}
                      <td className="px-6 py-4.5 whitespace-nowrap text-secondary">
                        <div className="flex flex-col">
                          <span className="font-medium text-on-surface-variant">{app.jobTitle}</span>
                          {app.locationType && (
                            <span className="text-xs text-secondary/75 capitalize mt-0.5">{LOCATION_LABELS[app.locationType]}</span>
                          )}
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        {getStatusBadge(app.status, app.round)}
                      </td>

                      {/* Date applied */}
                      <td className="px-6 py-4.5 whitespace-nowrap text-secondary font-mono text-xs">
                        {formatDate(app.appliedDate)}
                      </td>

                      {/* Action buttons (always visible or showing cleanly on row hover) */}
                      <td className="px-6 py-4.5 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEdit(app)}
                            className="p-1.5 text-secondary hover:text-primary rounded-lg hover:bg-surface-low transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc chắn muốn xóa hồ sơ ứng tuyển tại ${app.companyName}?`)) {
                                onDelete(app.id);
                              }
                            }}
                            className="p-1.5 text-secondary hover:text-error rounded-lg hover:bg-error/10 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onSelectApplication(app)}
                            className="p-1.5 text-secondary hover:text-primary rounded-lg hover:bg-surface-low transition-colors"
                            title="Xem chi tiết"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-secondary">
                      <div className="max-w-md mx-auto flex flex-col items-center justify-center p-8 border-2 border-dashed border-outline-variant/30 rounded-xl bg-surface/10 relative overflow-hidden group">
                        {/* Glowing radial background */}
                        <div className="absolute inset-0 bg-radial from-primary/5 to-transparent pointer-events-none group-hover:from-primary/10 transition-all duration-500" />
                        
                        <div className="w-12 h-12 rounded-full bg-surface-low border border-outline-variant/20 flex items-center justify-center text-secondary/60 mb-4 group-hover:text-primary transition-colors group-hover:scale-105 duration-300 relative">
                          <span className="text-lg">📁</span>
                        </div>

                        <h3 className="font-bold text-base text-on-surface font-sans mb-1.5">Không tìm thấy hồ sơ ứng tuyển nào</h3>
                        <p className="text-xs text-secondary/80 font-sans font-normal leading-relaxed mb-6">
                          Hãy thử điều chỉnh bộ lọc, xóa từ khóa tìm kiếm hoặc bấm nút bên dưới để tạo hồ sơ ứng tuyển mới của bạn.
                        </p>
                        
                        <button
                          onClick={onAddNewJob}
                          className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-on-primary text-xs font-bold font-sans rounded-lg transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Tạo hồ sơ mới
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4.5 border-t border-outline-variant/30 flex justify-between items-center bg-surface select-none">
            <span className="text-xs font-semibold text-secondary">
              Hiển thị {filteredApps.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} đến{' '}
              {Math.min(currentPage * itemsPerPage, filteredApps.length)} trong số {filteredApps.length} mục
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 text-secondary hover:text-primary disabled:opacity-40 disabled:hover:text-secondary rounded-lg hover:bg-surface-low transition-colors cursor-pointer"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 text-secondary hover:text-primary disabled:opacity-40 disabled:hover:text-secondary rounded-lg hover:bg-surface-low transition-colors cursor-pointer"
                title="Trang sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
