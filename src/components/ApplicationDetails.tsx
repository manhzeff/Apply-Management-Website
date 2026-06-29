/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronLeft, Edit2, Trash2, Plus, Mail, Phone, Calendar, ClipboardList, MapPin, DollarSign, Clock, UserPlus, CheckCircle2, Sparkles, Check, X } from 'lucide-react';
import { JobApplication, Contact, TimelineEvent, ApplicationStatus, STATUS_LABELS, LOCATION_LABELS, UserProfile } from '../types';
import AIAssistant from './AIAssistant';

interface ApplicationDetailsProps {
  application: JobApplication;
  userProfile: UserProfile;
  onBack: () => void;
  onEdit: (app: JobApplication) => void;
  onDelete: (id: string) => void;
  onUpdateApplication: (app: JobApplication) => void;
}

export default function ApplicationDetails({
  application,
  userProfile,
  onBack,
  onEdit,
  onDelete,
  onUpdateApplication,
}: ApplicationDetailsProps) {
  // New contact form state
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // New event form state
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventNotes, setEventNotes] = useState('');

  // Local Notes edit
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(application.notes || '');

  // Local Round edit
  const [isEditingRound, setIsEditingRound] = useState(false);
  const [roundText, setRoundText] = useState(application.round || '');

  // Sub-tab for Left column details vs AI assistant
  const [detailTab, setDetailTab] = useState<'info' | 'ai'>('info');

  // Add Contact Handler
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactRole.trim()) return;

    const newContact: Contact = {
      id: Math.random().toString(36).substring(2, 9),
      name: contactName.trim(),
      role: contactRole.trim(),
      email: contactEmail.trim() || undefined,
      phone: contactPhone.trim() || undefined,
    };

    const updatedContacts = [...(application.contacts || []), newContact];
    onUpdateApplication({
      ...application,
      contacts: updatedContacts,
    });

    // Reset Form
    setContactName('');
    setContactRole('');
    setContactEmail('');
    setContactPhone('');
    setShowContactForm(false);
  };

  // Delete Contact Handler
  const handleDeleteContact = (contactId: string) => {
    const updatedContacts = (application.contacts || []).filter(c => c.id !== contactId);
    onUpdateApplication({
      ...application,
      contacts: updatedContacts,
    });
  };

  // Add Timeline Event Handler
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate) return;

    const newEvent: TimelineEvent = {
      id: Math.random().toString(36).substring(2, 9),
      title: eventTitle.trim(),
      date: eventDate,
      notes: eventNotes.trim() || undefined,
    };

    const updatedEvents = [...(application.events || []), newEvent];
    onUpdateApplication({
      ...application,
      events: updatedEvents,
    });

    // Reset Form
    setEventTitle('');
    setEventDate('');
    setEventNotes('');
    setShowEventForm(false);
  };

  // Delete Event Handler
  const handleDeleteEvent = (eventId: string) => {
    const updatedEvents = (application.events || []).filter(e => e.id !== eventId);
    onUpdateApplication({
      ...application,
      events: updatedEvents,
    });
  };

  // Save Notes Handler
  const handleSaveNotes = () => {
    onUpdateApplication({
      ...application,
      notes: notesText.trim(),
    });
    setIsEditingNotes(false);
  };

  // Save Round Handler
  const handleSaveRound = () => {
    onUpdateApplication({
      ...application,
      round: roundText.trim() || undefined,
    });
    setIsEditingRound(false);
  };

  // Helpers
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusStyle = (status: ApplicationStatus) => {
    switch (status) {
      case 'interviewing':
        return 'bg-status-interviewing/10 text-status-interviewing border-status-interviewing/20';
      case 'applied':
        return 'bg-status-applied/10 text-status-applied border-status-applied/20';
      case 'offered':
        return 'bg-status-offered/10 text-status-offered border-status-offered/20';
      case 'wishlist':
        return 'bg-status-wishlist/10 text-status-wishlist border-status-wishlist/20';
      case 'rejected':
        return 'bg-status-rejected/10 text-status-rejected border-status-rejected/20';
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden select-none">
      {/* Top action row */}
      <div className="flex justify-between items-center shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-sans font-semibold text-secondary hover:text-primary hover:bg-surface border border-outline-variant/30 bg-surface-lowest py-2 px-4 rounded-lg transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Quay lại danh sách</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(application)}
            className="px-4 py-2 rounded-lg border border-outline-variant/50 text-secondary bg-surface-lowest font-semibold text-sm hover:bg-surface hover:text-on-surface transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Sửa</span>
          </button>
          <button
            onClick={() => {
              if (confirm(`Bạn có chắc chắn muốn xóa hồ sơ ứng tuyển tại ${application.companyName}?`)) {
                onDelete(application.id);
                onBack();
              }
            }}
            className="px-4 py-2 rounded-lg border border-error/30 text-error bg-surface-lowest font-semibold text-sm hover:bg-error/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa</span>
          </button>
        </div>
      </div>

      {/* Detail Area Layout */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col lg:flex-row gap-6 custom-scrollbar pb-6">
        {/* Left Hand: Core Info & Notes OR AI Assistant */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Sub-tab selection */}
          <div className="flex border-b border-outline-variant/20 pb-1 select-none">
            <button
              onClick={() => setDetailTab('info')}
              className={`pb-2 px-1 font-sans text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                detailTab === 'info'
                  ? 'text-primary border-primary'
                  : 'text-secondary hover:text-primary border-transparent'
              }`}
            >
              Tổng quan & Ghi chú
            </button>
            <button
              onClick={() => setDetailTab('ai')}
              className={`pb-2 px-1 ml-6 font-sans text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                detailTab === 'ai'
                  ? 'text-primary border-primary'
                  : 'text-secondary hover:text-primary border-transparent'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              Trợ lý AI (Gemini)
            </button>
          </div>

          {detailTab === 'info' ? (
            <>
              {/* Main Card */}
              <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-on-surface font-sans">{application.companyName}</h2>
                <p className="text-base text-secondary font-medium mt-1">{application.jobTitle}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold capitalize border border-solid ${getStatusStyle(application.status)}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse"></span>
                {STATUS_LABELS[application.status]}
              </span>
            </div>

            {/* Grid properties */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-outline-variant/20">
              <div className="space-y-1">
                <span className="text-xs text-secondary font-semibold uppercase tracking-wider block">Ngày nộp</span>
                <span className="text-sm font-sans font-medium text-on-surface flex items-center gap-1.5 mt-1">
                  <Calendar className="w-4 h-4 text-primary" />
                  {formatDate(application.appliedDate)}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-secondary font-semibold uppercase tracking-wider block">Hình thức</span>
                <span className="text-sm font-sans font-medium text-on-surface flex items-center gap-1.5 mt-1 capitalize">
                  <MapPin className="w-4 h-4 text-primary" />
                  {LOCATION_LABELS[application.locationType]}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-secondary font-semibold uppercase tracking-wider block">Mức lương</span>
                <span className="text-sm font-sans font-medium text-on-surface flex items-center gap-1.5 mt-1">
                  <DollarSign className="w-4 h-4 text-primary" />
                  {application.salaryRange || 'Chưa thỏa thuận'}
                </span>
              </div>
              {isEditingRound ? (
                <div className="space-y-1.5 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-secondary font-semibold uppercase tracking-wider block">Vòng phỏng vấn</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveRound}
                        className="text-primary hover:text-primary-fixed-dim transition-colors cursor-pointer"
                        title="Lưu"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setIsEditingRound(false)}
                        className="text-secondary hover:text-on-surface transition-colors cursor-pointer"
                        title="Hủy"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <input
                      type="text"
                      value={roundText}
                      onChange={(e) => setRoundText(e.target.value)}
                      placeholder="Nhập vòng..."
                      className="w-full bg-surface-low border border-outline-variant/50 rounded px-2.5 py-1 text-xs font-sans text-on-surface placeholder:text-secondary/50 outline-none focus:border-primary"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRound();
                        if (e.key === 'Escape') setIsEditingRound(false);
                      }}
                    />
                    <div className="flex flex-wrap gap-1 max-h-[50px] overflow-y-auto custom-scrollbar">
                      {['HR Screen', 'Technical', 'Behavioral', 'System Design', 'Coding Test', 'Final Round'].map((suggestedRound) => (
                        <button
                          key={suggestedRound}
                          type="button"
                          onClick={() => setRoundText(suggestedRound)}
                          className={`text-[9px] font-bold font-sans px-2 py-0.5 rounded border transition-all cursor-pointer ${
                            roundText === suggestedRound
                              ? 'bg-primary/10 text-primary border-primary/30'
                              : 'bg-surface-lowest text-secondary border-outline-variant/30 hover:border-secondary hover:text-on-surface'
                          }`}
                        >
                          {suggestedRound}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 relative group">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-secondary font-semibold uppercase tracking-wider block">Vòng phỏng vấn</span>
                    {application.status === 'interviewing' && (
                      <button
                        onClick={() => {
                          setRoundText(application.round || '');
                          setIsEditingRound(true);
                        }}
                        className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-0.5"
                        title="Sửa nhanh vòng phỏng vấn"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <span className="text-sm font-sans font-medium text-on-surface flex items-center gap-1.5 mt-1">
                    <Clock className="w-4 h-4 text-primary" />
                    {application.round || 'N/A'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-6 shadow-md">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-primary" />
                Ghi chú & Mô tả chi tiết
              </h3>
              {!isEditingNotes ? (
                <button
                  onClick={() => {
                    setNotesText(application.notes || '');
                    setIsEditingNotes(true);
                  }}
                  className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  Sửa ghi chú
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditingNotes(false)}
                    className="text-xs font-semibold text-secondary hover:underline cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    Lưu
                  </button>
                </div>
              )}
            </div>

            {isEditingNotes ? (
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Viết ghi chú, thông tin, hoặc chuẩn bị phỏng vấn..."
                rows={5}
                className="w-full bg-surface-low border border-outline-variant/50 rounded-lg p-3 text-sm font-sans text-on-surface outline-none focus:border-primary transition-all resize-y custom-scrollbar"
              />
            ) : application.notes ? (
              <p className="text-sm text-on-surface-variant font-sans whitespace-pre-line leading-relaxed">
                {application.notes}
              </p>
            ) : (
              <p className="text-sm text-secondary italic text-center py-6 font-sans">
                Chưa có ghi chú nào. Hãy thêm ghi chú về cơ cấu nhóm, nghiên cứu công ty hoặc mô tả công việc.
              </p>
            )}
          </div>
            </>
          ) : (
            <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-6 shadow-md flex-1 flex flex-col min-h-[400px]">
              <AIAssistant application={application} userProfile={userProfile} />
            </div>
          )}
        </div>

        {/* Right Hand: Contacts & Timeline Events */}
        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
          {/* Contacts Panel */}
          <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-5 shadow-md flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-primary" />
                Người liên hệ ({application.contacts?.length || 0})
              </h3>
              <button
                onClick={() => setShowContactForm(!showContactForm)}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                {showContactForm ? 'Ẩn' : '+ Thêm'}
              </button>
            </div>

            {/* Quick Contact Addition Form */}
            {showContactForm && (
              <form onSubmit={handleAddContact} className="bg-surface border border-outline-variant/30 rounded-lg p-3 space-y-3">
                <input
                  type="text"
                  placeholder="Tên liên hệ *"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-surface-lowest border border-outline-variant/40 rounded px-2.5 py-1.5 text-xs font-sans text-on-surface outline-none focus:border-primary placeholder:text-secondary/50"
                />
                <input
                  type="text"
                  placeholder="Vai trò (Ví dụ: Nhà tuyển dụng) *"
                  required
                  value={contactRole}
                  onChange={(e) => setContactRole(e.target.value)}
                  className="w-full bg-surface-lowest border border-outline-variant/40 rounded px-2.5 py-1.5 text-xs font-sans text-on-surface outline-none focus:border-primary placeholder:text-secondary/50"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-surface-lowest border border-outline-variant/40 rounded px-2.5 py-1.5 text-xs font-sans text-on-surface outline-none focus:border-primary placeholder:text-secondary/50"
                />
                <input
                  type="text"
                  placeholder="Số điện thoại"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-surface-lowest border border-outline-variant/40 rounded px-2.5 py-1.5 text-xs font-sans text-on-surface outline-none focus:border-primary placeholder:text-secondary/50"
                />
                <button
                  type="submit"
                  className="w-full bg-primary text-on-primary font-bold text-xs py-1.5 rounded hover:bg-primary-fixed-dim transition-colors cursor-pointer"
                >
                  Lưu liên hệ
                </button>
              </form>
            )}

            {/* Contact list */}
            <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto custom-scrollbar">
              {application.contacts && application.contacts.length > 0 ? (
                application.contacts.map((contact) => (
                  <div key={contact.id} className="bg-surface border border-outline-variant/10 rounded-lg p-3 space-y-2 relative group">
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="absolute top-2 right-2 text-secondary hover:text-error opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded cursor-pointer"
                      title="Xóa liên hệ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <h4 className="text-xs font-bold text-on-surface font-sans">{contact.name}</h4>
                      <p className="text-[10px] text-secondary font-medium mt-0.5">{contact.role}</p>
                    </div>
                    <div className="space-y-1 pt-1 border-t border-outline-variant/10">
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="flex items-center gap-1.5 text-[10px] text-primary hover:underline truncate"
                        >
                          <Mail className="w-3 h-3 text-secondary" />
                          {contact.email}
                        </a>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-1.5 text-[10px] text-secondary truncate">
                          <Phone className="w-3 h-3 text-secondary" />
                          {contact.phone}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-secondary italic text-center py-4 font-sans">
                  Chưa có người liên hệ nào được ghi lại. Hãy thêm nhà tuyển dụng hoặc leader để giữ liên lạc.
                </p>
              )}
            </div>
          </div>

          {/* Timeline Events Panel */}
          <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-5 shadow-md flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                Dòng thời gian phỏng vấn ({application.events?.length || 0})
              </h3>
              <button
                onClick={() => setShowEventForm(!showEventForm)}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                {showEventForm ? 'Ẩn' : '+ Thêm'}
              </button>
            </div>

            {/* Event Addition Form */}
            {showEventForm && (
              <form onSubmit={handleAddEvent} className="bg-surface border border-outline-variant/30 rounded-lg p-3 space-y-3">
                <input
                  type="text"
                  placeholder="Tên sự kiện (Ví dụ: Portfolio Review) *"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full bg-surface-lowest border border-outline-variant/40 rounded px-2.5 py-1.5 text-xs font-sans text-on-surface outline-none focus:border-primary placeholder:text-secondary/50"
                />
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-surface-lowest border border-outline-variant/40 rounded px-2.5 py-1.5 text-xs font-sans text-on-surface outline-none focus:border-primary placeholder:text-secondary/50 cursor-pointer"
                />
                <textarea
                  placeholder="Ghi chú, link, hoặc chi tiết địa điểm..."
                  value={eventNotes}
                  onChange={(e) => setEventNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-surface-lowest border border-outline-variant/40 rounded px-2.5 py-1.5 text-xs font-sans text-on-surface outline-none focus:border-primary placeholder:text-secondary/50"
                />
                <button
                  type="submit"
                  className="w-full bg-primary text-on-primary font-bold text-xs py-1.5 rounded hover:bg-primary-fixed-dim transition-colors cursor-pointer"
                >
                  Lưu sự kiện
                </button>
              </form>
            )}

            {/* Timeline Event list */}
            <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto custom-scrollbar relative pl-3 border-l border-outline-variant/30 ml-2 py-1">
              {application.events && application.events.length > 0 ? (
                application.events.map((event) => (
                  <div key={event.id} className="relative group space-y-1">
                    {/* Circle Node */}
                    <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 bg-primary rounded-full border border-background shadow-sm" />

                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-on-surface font-sans leading-none">{event.title}</h4>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-secondary hover:text-error opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded cursor-pointer leading-none"
                        title="Xóa sự kiện"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <p className="text-[10px] text-primary font-mono">{formatDate(event.date)}</p>

                    {event.notes && (
                      <p className="text-[10px] text-secondary font-sans leading-relaxed pt-0.5">
                        {event.notes}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-secondary italic text-center py-4 font-sans -ml-3">
                  Chưa có nhật ký dòng thời gian nào. Hãy ghi lại các cuộc gọi, vòng phỏng vấn và các mốc thời gian để luôn ngăn nắp!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
