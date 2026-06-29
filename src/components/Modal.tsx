/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, CalendarDays, DollarSign, MapPin, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { JobApplication, ApplicationStatus, LocationType } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (application: Omit<JobApplication, 'id' | 'updatedAt'> & { id?: string }) => void;
  applicationToEdit?: JobApplication | null;
  initialStatus?: ApplicationStatus;
}

export default function Modal({ isOpen, onClose, onSave, applicationToEdit, initialStatus }: ModalProps) {
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('applied');
  const [appliedDate, setAppliedDate] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [locationType, setLocationType] = useState<LocationType>('remote');
  const [round, setRound] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<{ companyName?: string; jobTitle?: string }>({});

  useEffect(() => {
    if (applicationToEdit) {
      setCompanyName(applicationToEdit.companyName || '');
      setJobTitle(applicationToEdit.jobTitle || '');
      setStatus(applicationToEdit.status || 'applied');
      setAppliedDate(applicationToEdit.appliedDate || '');
      setSalaryRange(applicationToEdit.salaryRange || '');
      setLocationType(applicationToEdit.locationType || 'remote');
      setRound(applicationToEdit.round || '');
      setNotes(applicationToEdit.notes || '');
    } else {
      setCompanyName('');
      setJobTitle('');
      setStatus(initialStatus || 'applied');
      // Set default date to today's local date in YYYY-MM-DD format
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setAppliedDate(`${year}-${month}-${day}`);
      setSalaryRange('');
      setLocationType('remote');
      setRound('');
      setNotes('');
    }
    setErrors({});
  }, [applicationToEdit, initialStatus, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { companyName?: string; jobTitle?: string } = {};
    if (!companyName.trim()) newErrors.companyName = 'Vui lòng nhập tên công ty';
    if (!jobTitle.trim()) newErrors.jobTitle = 'Vui lòng nhập vị trí công việc';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      id: applicationToEdit?.id,
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim(),
      status,
      appliedDate,
      salaryRange: salaryRange.trim(),
      locationType,
      round: status === 'interviewing' ? round.trim() : undefined,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal dialogue box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-surface border border-outline-variant/50 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-lowest">
              <h2 className="text-lg font-bold text-on-surface font-sans" id="modal-title">
                {applicationToEdit ? 'Chỉnh sửa hồ sơ ứng tuyển' : 'Thêm hồ sơ ứng tuyển mới'}
              </h2>
              <button
                onClick={onClose}
                className="text-secondary hover:text-on-surface hover:bg-surface-low rounded-full p-1.5 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Name */}
                <div className="space-y-1.5">
                  <label htmlFor="companyName" className="block text-xs font-semibold uppercase tracking-wider text-secondary">
                    Tên công ty <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      if (e.target.value.trim() && errors.companyName) {
                        setErrors((prev) => ({ ...prev, companyName: undefined }));
                      }
                    }}
                    placeholder="Ví dụ: Công ty Acme"
                    className={`w-full bg-surface-lowest border ${
                      errors.companyName ? 'border-error/70 focus:ring-error/10' : 'border-outline-variant/50 focus:border-primary focus:ring-primary/10'
                    } rounded-lg px-4 py-2.5 text-sm font-sans text-on-surface placeholder:text-secondary/50 outline-none focus:ring-4 transition-all`}
                  />
                  {errors.companyName && (
                    <p className="text-xs text-error font-medium">{errors.companyName}</p>
                  )}
                </div>

                {/* Job Title */}
                <div className="space-y-1.5">
                  <label htmlFor="jobTitle" className="block text-xs font-semibold uppercase tracking-wider text-secondary">
                    Vị trí công việc <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => {
                      setJobTitle(e.target.value);
                      if (e.target.value.trim() && errors.jobTitle) {
                        setErrors((prev) => ({ ...prev, jobTitle: undefined }));
                      }
                    }}
                    placeholder="Ví dụ: Frontend Developer"
                    className={`w-full bg-surface-lowest border ${
                      errors.jobTitle ? 'border-error/70 focus:ring-error/10' : 'border-outline-variant/50 focus:border-primary focus:ring-primary/10'
                    } rounded-lg px-4 py-2.5 text-sm font-sans text-on-surface placeholder:text-secondary/50 outline-none focus:ring-4 transition-all`}
                  />
                  {errors.jobTitle && (
                    <p className="text-xs text-error font-medium">{errors.jobTitle}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Dropdown */}
                <div className="space-y-1.5">
                  <label htmlFor="status" className="block text-xs font-semibold uppercase tracking-wider text-secondary">
                    Trạng thái
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                    className="w-full bg-surface-lowest border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm font-sans text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all cursor-pointer"
                  >
                    <option value="wishlist">Ý định / Ước mơ</option>
                    <option value="applied">Đã nộp đơn</option>
                    <option value="interviewing">Đang phỏng vấn</option>
                    <option value="offered">Nhận đề nghị (Offer)</option>
                    <option value="rejected">Bị từ chối</option>
                  </select>
                </div>

                {/* Applied Date */}
                <div className="space-y-1.5">
                  <label htmlFor="appliedDate" className="block text-xs font-semibold uppercase tracking-wider text-secondary">
                    Ngày ứng tuyển
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="appliedDate"
                      value={appliedDate}
                      onChange={(e) => setAppliedDate(e.target.value)}
                      className="w-full bg-surface-lowest border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm font-sans text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all cursor-pointer"
                    />
                    <CalendarDays className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary w-4 h-4 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Salary Range */}
                <div className="space-y-1.5">
                  <label htmlFor="salaryRange" className="block text-xs font-semibold uppercase tracking-wider text-secondary">
                    Mức lương
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="salaryRange"
                      value={salaryRange}
                      onChange={(e) => setSalaryRange(e.target.value)}
                      placeholder="Ví dụ: 15tr - 20tr hoặc $1000 - $1200"
                      className="w-full bg-surface-lowest border border-outline-variant/50 rounded-lg pl-10 pr-4 py-2.5 text-sm font-sans text-on-surface placeholder:text-secondary/50 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary w-4 h-4 pointer-events-none" />
                  </div>
                </div>

                {/* Location Type */}
                <div className="space-y-1.5">
                  <label htmlFor="locationType" className="block text-xs font-semibold uppercase tracking-wider text-secondary">
                    Hình thức làm việc
                  </label>
                  <div className="relative">
                    <select
                      id="locationType"
                      value={locationType}
                      onChange={(e) => setLocationType(e.target.value as LocationType)}
                      className="w-full bg-surface-lowest border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm font-sans text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all cursor-pointer"
                    >
                      <option value="remote">Từ xa</option>
                      <option value="onsite">Tại văn phòng</option>
                      <option value="hybrid">Kết hợp (Hybrid)</option>
                    </select>
                    <MapPin className="absolute right-8 top-1/2 -translate-y-1/2 text-secondary w-4 h-4 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Conditional Field: Interview Round (only shown when status is interviewing) */}
              <AnimatePresence>
                {status === 'interviewing' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1.5 overflow-hidden"
                  >
                    <label htmlFor="round" className="block text-xs font-semibold uppercase tracking-wider text-secondary">
                      Vòng / Giai đoạn phỏng vấn
                    </label>
                    <input
                      type="text"
                      id="round"
                      value={round}
                      onChange={(e) => setRound(e.target.value)}
                      placeholder="Ví dụ: Vòng CV, Portfolio Review, System Design"
                      className="w-full bg-surface-lowest border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm font-sans text-on-surface placeholder:text-secondary/50 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Notes */}
              <div className="space-y-1.5">
                <label htmlFor="notes" className="block text-xs font-semibold uppercase tracking-wider text-secondary">
                  Ghi chú / Mô tả công việc nổi bật
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Thêm chi tiết liên quan, link JD công việc, thông tin công ty tìm hiểu được, hoặc ghi chú chuẩn bị phỏng vấn..."
                  rows={4}
                  className="w-full bg-surface-lowest border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm font-sans text-on-surface placeholder:text-secondary/50 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-y custom-scrollbar"
                />
              </div>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-outline-variant/30 bg-surface-lowest flex justify-end gap-3 items-center">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold font-sans text-secondary bg-transparent border border-transparent rounded-lg hover:bg-surface-low transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-outline-variant"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-5 py-2 bg-primary text-on-primary font-semibold font-sans text-sm rounded-lg hover:bg-primary-fixed-dim hover:brightness-115 transition-all shadow-md cursor-pointer outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
              >
                {applicationToEdit ? 'Lưu thay đổi' : 'Lưu hồ sơ'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
