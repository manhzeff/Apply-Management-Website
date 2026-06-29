/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { Calendar, Clock, MapPin, ClipboardList, AlertCircle, ArrowUpRight } from 'lucide-react';
import { JobApplication } from '../types';

interface ScheduleViewProps {
  applications: JobApplication[];
  onSelectApplication: (app: JobApplication) => void;
}

export default function ScheduleView({ applications, onSelectApplication }: ScheduleViewProps) {
  // Aggregate and sort all events across all applications
  const sortedEvents = useMemo(() => {
    const list: Array<{
      eventId: string;
      title: string;
      date: string;
      notes?: string;
      companyName: string;
      jobTitle: string;
      app: JobApplication;
    }> = [];

    applications.forEach((app) => {
      if (app.events && app.events.length > 0) {
        app.events.forEach((event) => {
          list.push({
            eventId: event.id,
            title: event.title,
            date: event.date,
            notes: event.notes,
            companyName: app.companyName,
            jobTitle: app.jobTitle,
            app,
          });
        });
      }
    });

    // Sort by date ascending (chronological)
    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [applications]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysRemaining = (dateString: string) => {
    const target = new Date(dateString);
    const today = new Date();
    // clear times to compare purely days
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diff = target.getTime() - today.getTime();
    const days = Math.round(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hôm nay';
    if (days === 1) return 'Ngày mai';
    if (days < 0) return `${Math.abs(days)} ngày trước`;
    return `Trong ${days} ngày tới`;
  };

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden select-none">
      {/* Title */}
      <div className="shrink-0">
        <h2 className="text-2xl font-bold text-on-surface font-sans mb-1">Lịch phỏng vấn</h2>
        <p className="text-sm text-secondary font-sans">Tổng hợp lịch trình sắp tới, các bài kiểm tra lập trình và các buổi phỏng vấn.</p>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar pb-6 flex flex-col gap-6">
        {sortedEvents.length > 0 ? (
          <div className="relative border-l border-outline-variant/30 pl-6 ml-4 py-2 space-y-6">
            {sortedEvents.map((item, index) => {
              const daysRemaining = getDaysRemaining(item.date);
              const isFuture = !daysRemaining.includes('ago');
              
              return (
                <div
                  key={item.eventId}
                  onClick={() => onSelectApplication(item.app)}
                  className="relative group bg-surface-lowest border border-outline-variant/30 rounded-xl p-5 hover:border-primary/50 cursor-pointer shadow-md transition-all duration-300 max-w-2xl"
                >
                  {/* Circle Timeline Bullet Node */}
                  <div className={`absolute -left-[31px] top-6 w-3 h-3 rounded-full border border-background shadow-md ${
                    daysRemaining === 'Today' 
                      ? 'bg-amber-400 animate-ping' 
                      : isFuture 
                      ? 'bg-primary' 
                      : 'bg-secondary'
                  }`} />
                  {/* Static bullet over animation */}
                  <div className={`absolute -left-[31px] top-6 w-3 h-3 rounded-full border border-background shadow-sm ${
                    daysRemaining === 'Today' 
                      ? 'bg-amber-400' 
                      : isFuture 
                      ? 'bg-primary' 
                      : 'bg-secondary'
                  }`} />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/10 pb-3 mb-3">
                    <div>
                      <span className="text-xs font-bold text-primary tracking-wide font-sans block">{item.companyName}</span>
                      <h3 className="text-sm font-bold text-on-surface font-sans mt-0.5">{item.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        daysRemaining === 'Today'
                          ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                          : isFuture
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-secondary/10 text-secondary'
                      }`}>
                        {daysRemaining}
                      </span>
                      <button className="p-1 text-secondary hover:text-primary transition-colors hover:bg-surface rounded opacity-0 group-hover:opacity-100">
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Date details and notes */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-secondary font-mono">
                      <Calendar className="w-3.5 h-3.5 text-secondary" />
                      <span>{formatDate(item.date)}</span>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-on-surface-variant font-sans whitespace-pre-line bg-surface/40 p-3 rounded-lg border border-outline-variant/10">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-outline-variant/30 rounded-xl p-8 max-w-2xl bg-surface-lowest/10 py-20">
            <AlertCircle className="w-10 h-10 text-secondary/40 mb-3" />
            <h3 className="text-sm font-bold text-on-surface-variant font-sans mb-1">Không có sự kiện sắp tới</h3>
            <p className="text-xs text-secondary/70 text-center font-sans max-w-xs leading-relaxed">
              Hãy tạo các bước phỏng vấn, portfolio reviews hoặc bài test coding trong chi tiết hồ sơ ứng tuyển để tự động hiển thị lịch trình của bạn!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
