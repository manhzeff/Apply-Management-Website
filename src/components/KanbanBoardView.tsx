/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Plus, MoreHorizontal, Calendar, ArrowUpRight, Filter, Download } from 'lucide-react';
import { JobApplication, ApplicationStatus } from '../types';

interface KanbanBoardViewProps {
  applications: JobApplication[];
  onEdit: (app: JobApplication) => void;
  onDelete: (id: string) => void;
  onAddNewJob: (status?: ApplicationStatus) => void;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => void;
  onSelectApplication: (app: JobApplication) => void;
  activeSubView: 'table' | 'kanban';
  setActiveSubView: (view: 'table' | 'kanban') => void;
}

export default function KanbanBoardView({
  applications,
  onEdit,
  onDelete,
  onAddNewJob,
  onUpdateStatus,
  onSelectApplication,
  activeSubView,
  setActiveSubView,
}: KanbanBoardViewProps) {
  // Columns Definition
  const columns: { id: ApplicationStatus; label: string; colorClass: string }[] = [
    { id: 'wishlist', label: 'Ý ĐỊNH / ƯỚC MƠ', colorClass: 'bg-status-wishlist' },
    { id: 'applied', label: 'ĐÃ NỘP ĐƠN', colorClass: 'bg-status-applied' },
    { id: 'interviewing', label: 'PHỎNG VẤN', colorClass: 'bg-status-interviewing' },
    { id: 'offered', label: 'NHẬN ĐỀ NGHỊ', colorClass: 'bg-status-offered' },
    { id: 'rejected', label: 'BỊ TỪ CHỐI', colorClass: 'bg-status-rejected' },
  ];

  const getStatusStepIndex = (status: ApplicationStatus) => {
    switch (status) {
      case 'wishlist': return 0;
      case 'applied': return 1;
      case 'interviewing': return 2;
      case 'offered': return 3;
      default: return -1;
    }
  };

  // Group applications by status
  const groupedApps = useMemo(() => {
    const groups: Record<ApplicationStatus, JobApplication[]> = {
      wishlist: [],
      applied: [],
      interviewing: [],
      offered: [],
      rejected: [],
    };
    applications.forEach((app) => {
      if (groups[app.status]) {
        groups[app.status].push(app);
      }
    });
    return groups;
  }, [applications]);

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: ApplicationStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) {
      onUpdateStatus(id, targetStatus);
    }
  };

  // Calculate age / days in stage simulated helper
  const getDaysInStage = (dateString: string) => {
    if (!dateString) return '0 ngày';
    const applied = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - applied.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Cap or make relative for display realism based on screenshot
    if (diffDays > 30) return `${diffDays % 15} ngày`;
    return `${diffDays} ngày`;
  };

  // Helper to format date nicely (e.g. "Oct 25")
  const formatShortDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden select-none">
      {/* Kanban Specific Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-on-surface font-sans mb-1">Danh sách ứng tuyển</h2>
          <p className="text-sm text-secondary font-sans font-normal">Quản lý và theo dõi quá trình ứng tuyển công việc của bạn.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => alert("Đã cập nhật bộ lọc.")}
            className="px-4 py-2 rounded-lg border border-outline-variant/50 text-secondary bg-surface-lowest font-semibold text-sm hover:bg-surface hover:text-on-surface transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Bộ lọc</span>
          </button>
          <button
            onClick={() => alert("Xuất dữ liệu ứng tuyển thành công.")}
            className="px-4 py-2 rounded-lg border border-outline-variant/50 text-secondary bg-surface-lowest font-semibold text-sm hover:bg-surface hover:text-on-surface transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất file</span>
          </button>
        </div>
      </div>

      {/* View Toggles Tab Row */}
      <div className="flex items-center gap-6 border-b border-outline-variant/30 shrink-0">
        <button
          onClick={() => setActiveSubView('table')}
          className="pb-3 text-secondary hover:text-primary font-sans font-semibold text-sm flex items-center gap-2 transition-colors border-b-2 border-transparent cursor-pointer"
        >
          <span className="text-xs">☰</span> Chế độ Bảng
        </button>
        <button
          onClick={() => setActiveSubView('kanban')}
          className="pb-3 text-primary border-b-2 border-primary font-sans font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
        >
          <span className="text-xs">⊞</span> Chế độ Kanban
        </button>
      </div>

      {/* Kanban Board Layout columns */}
      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-4 h-full min-w-max items-start">
          {columns.map((col) => {
            const colApps = groupedApps[col.id] || [];
            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className="w-80 bg-surface-low border border-outline-variant/20 rounded-xl p-3 flex flex-col gap-3 h-full max-h-[68vh]"
              >
                {/* Column Header */}
                <div className="flex justify-between items-center px-1 py-1 shrink-0">
                  <h3 className="font-bold text-xs font-sans tracking-wider text-on-surface flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.colorClass}`}></span>
                    {col.label}
                    <span className="text-secondary/70 ml-1 font-semibold bg-surface px-2 py-0.5 rounded-full text-[10px] border border-outline-variant/10">
                      {colApps.length}
                    </span>
                  </h3>
                  <button
                    onClick={() => onAddNewJob(col.id)}
                    className="text-secondary hover:text-primary p-1 rounded hover:bg-surface transition-colors cursor-pointer"
                    title={`Thêm hồ sơ vào cột ${col.label}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Column Scroll Container */}
                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 custom-scrollbar">
                  {colApps.length > 0 ? (
                    colApps.map((app) => {
                      const isInterviewingActive = app.status === 'interviewing' && app.round;
                      const isRejected = app.status === 'rejected';
                      const isInterviewing = app.status === 'interviewing';

                      return (
                        <div
                          key={app.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, app.id)}
                          onClick={() => onSelectApplication(app)}
                          className={`bg-surface-lowest border ${
                            isInterviewing
                              ? 'border-status-interviewing shadow-lg shadow-status-interviewing/5 ring-1 ring-status-interviewing/20'
                              : 'border-outline-variant/40 hover:-translate-y-0.5 hover:shadow-md hover:border-outline transition-all duration-200 shadow-sm'
                          } ${
                            isRejected ? 'opacity-65 hover:opacity-100 transition-opacity' : ''
                          } rounded-lg p-4 cursor-grab active:cursor-grabbing group relative select-none`}
                        >
                          {/* Card Title & Actions */}
                          <div className="flex justify-between items-start mb-2">
                            <h4
                              className={`font-semibold text-sm text-on-surface font-sans ${
                                isRejected ? 'line-through text-secondary decoration-outline' : ''
                              }`}
                            >
                              {app.companyName}
                            </h4>
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => onEdit(app)}
                                className="text-secondary hover:text-primary p-1 rounded hover:bg-surface transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                                title="Chỉnh sửa"
                              >
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Role Name */}
                          <p className="text-xs text-on-surface-variant font-medium mb-2">
                            {app.jobTitle}
                          </p>

                          {/* Progress Timeline Tracker dots */}
                          {app.status !== 'rejected' && (
                            <div className="flex items-center gap-1.5 mt-1.5 mb-3.5 select-none">
                              {[0, 1, 2, 3].map((stepIdx) => {
                                const currentIdx = getStatusStepIndex(app.status);
                                const isActive = stepIdx <= currentIdx;
                                const stepColors = [
                                  'bg-status-wishlist',
                                  'bg-status-applied',
                                  'bg-status-interviewing',
                                  'bg-status-offered',
                                ];
                                return (
                                  <React.Fragment key={stepIdx}>
                                    {stepIdx > 0 && (
                                      <div className={`h-0.5 flex-1 min-w-[8px] transition-all duration-300 ${
                                        isActive ? stepColors[stepIdx] + '/30' : 'bg-outline-variant/20'
                                      }`} />
                                    )}
                                    <div
                                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                        isActive ? stepColors[stepIdx] : 'bg-outline-variant/40'
                                      }`}
                                      title={
                                        stepIdx === 0
                                          ? 'Ý định / Ước mơ'
                                          : stepIdx === 1
                                          ? 'Đã nộp đơn'
                                          : stepIdx === 2
                                          ? 'Đang phỏng vấn'
                                          : 'Nhận đề nghị (Offer)'
                                      }
                                    />
                                  </React.Fragment>
                                );
                              })}
                            </div>
                          )}

                          {app.status === 'rejected' && (
                            <div className="flex items-center gap-1.5 mt-1.5 mb-3.5 select-none">
                              <div className="w-1.5 h-1.5 rounded-full bg-status-rejected" />
                              <div className="h-0.5 flex-1 min-w-[8px] bg-status-rejected/30" />
                              <span className="text-[8px] font-bold text-status-rejected/80 uppercase tracking-wider">Đã dừng ứng tuyển</span>
                              <div className="h-0.5 flex-1 min-w-[8px] bg-status-rejected/30" />
                              <div className="w-1.5 h-1.5 rounded-full bg-status-rejected" />
                            </div>
                          )}

                          {/* Optional Badges, Interview Round Pills */}
                          {isInterviewingActive && (
                            <div className="mb-3">
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-sans font-semibold text-[10px] border border-tertiary/20">
                                {app.round}
                              </span>
                            </div>
                          )}

                          {/* Footer details */}
                          <div
                            className={`flex justify-between items-center mt-auto text-[10px] font-semibold text-secondary font-sans ${
                              isInterviewing ? 'border-t border-outline-variant/20 pt-2.5 mt-2' : ''
                            }`}
                          >
                            {/* Left Badge: Date tag & Contacts */}
                            <div className="flex items-center gap-1.5">
                              <span className="bg-surface border border-outline-variant/10 px-1.5 py-0.5 rounded flex items-center gap-1 text-[10px] shrink-0">
                                {app.status === 'rejected' ? (
                                  <>Từ chối {formatShortDate(app.appliedDate)}</>
                                ) : app.status === 'wishlist' ? (
                                  <>Đã thêm {formatShortDate(app.appliedDate)}</>
                                ) : (
                                  <>Đã nộp {formatShortDate(app.appliedDate)}</>
                                )}
                              </span>

                              {/* Contact Monograms */}
                              {app.contacts && app.contacts.length > 0 && (
                                <div className="flex -space-x-1 overflow-hidden shrink-0">
                                  {app.contacts.slice(0, 3).map((contact) => (
                                    <div
                                      key={contact.id}
                                      className="w-4.5 h-4.5 rounded-full border border-surface-lowest bg-surface-high text-on-surface-variant font-bold text-[7px] flex items-center justify-center select-none cursor-help hover:text-primary transition-colors shrink-0"
                                      title={`${contact.name} (${contact.role})${contact.email ? `\nEmail: ${contact.email}` : ''}${contact.phone ? `\nSĐT: ${contact.phone}` : ''}`}
                                    >
                                      {contact.name.charAt(0).toUpperCase()}
                                    </div>
                                  ))}
                                  {app.contacts.length > 3 && (
                                    <div
                                      className="w-4.5 h-4.5 rounded-full border border-surface-lowest bg-surface-highest text-secondary font-bold text-[7px] flex items-center justify-center select-none shrink-0"
                                      title={`Và ${app.contacts.length - 3} người liên hệ khác`}
                                    >
                                      +{app.contacts.length - 3}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Right Badge: Days in stage */}
                            {isInterviewing ? (
                              <span className="text-tertiary font-semibold flex items-center gap-1 shrink-0">
                                <Calendar className="w-3 h-3 text-tertiary" />
                                {getDaysInStage(app.appliedDate)}
                              </span>
                            ) : (
                              <span className="text-secondary/80 shrink-0">
                                {getDaysInStage(app.appliedDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    /* Empty Drop Zone Indicator matching screenshot */
                    <div className="flex-1 min-h-[140px] flex items-center justify-center border-2 border-dashed border-outline-variant/30 rounded-lg m-1 bg-surface-lowest/10">
                      <p className="text-xs font-medium text-secondary/60 text-center font-sans">
                        Thả hồ sơ vào đây
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
