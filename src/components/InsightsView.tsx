/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { BarChart3, TrendingUp, Award, MapPin, Sparkles, DollarSign, PieChart } from 'lucide-react';
import { JobApplication, LOCATION_LABELS, STATUS_LABELS } from '../types';

interface InsightsViewProps {
  applications: JobApplication[];
}

export default function InsightsView({ applications }: InsightsViewProps) {
  const stats = useMemo(() => {
    const total = applications.length;
    const wishlist = applications.filter(a => a.status === 'wishlist').length;
    const applied = applications.filter(a => a.status === 'applied').length;
    const interviewing = applications.filter(a => a.status === 'interviewing').length;
    const offered = applications.filter(a => a.status === 'offered').length;
    const rejected = applications.filter(a => a.status === 'rejected').length;

    // Location counts
    const remote = applications.filter(a => a.locationType === 'remote').length;
    const hybrid = applications.filter(a => a.locationType === 'hybrid').length;
    const onsite = applications.filter(a => a.locationType === 'onsite').length;

    // Highest paying listed
    const highPaying = [...applications]
      .filter(a => a.salaryRange)
      .map(a => {
        // Parse salary numbers (e.g. "$180k - $220k" -> average $200k)
        const match = a.salaryRange?.match(/\$(\d+)k/g);
        let parsedVal = 0;
        if (match && match.length > 0) {
          const vals = match.map(v => parseInt(v.replace(/[^\d]/g, ''), 10));
          parsedVal = vals.reduce((sum, current) => sum + current, 0) / vals.length;
        }
        return { ...a, parsedAverage: parsedVal };
      })
      .sort((a, b) => b.parsedAverage - a.parsedAverage)
      .slice(0, 4);

    // Calculate Interview Rate (Applied -> Interview)
    const totalAppliedOrBeyond = applied + interviewing + offered + rejected;
    const interviewRate = totalAppliedOrBeyond > 0 
      ? Math.round(((interviewing + offered) / totalAppliedOrBeyond) * 100) 
      : 0;

    // Offer Conversion Rate
    const offerRate = (interviewing + offered) > 0 
      ? Math.round((offered / (interviewing + offered)) * 100) 
      : 0;

    return {
      total,
      wishlist,
      applied,
      interviewing,
      offered,
      rejected,
      remote,
      hybrid,
      onsite,
      highPaying,
      interviewRate,
      offerRate
    };
  }, [applications]);

  return (
    <div className="flex flex-col gap-6 overflow-y-auto pr-1 select-none custom-scrollbar pb-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-on-surface font-sans mb-1">Phân tích dữ liệu ứng tuyển</h2>
        <p className="text-sm text-secondary font-sans">Các chỉ số chuyển đổi chiến lược và phân tích chi tiết dữ liệu.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block">Tỷ lệ phỏng vấn</span>
            <span className="text-2xl font-bold text-on-surface font-sans mt-0.5">{stats.interviewRate}%</span>
          </div>
        </div>

        <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block">Tỷ lệ nhận Offer</span>
            <span className="text-2xl font-bold text-on-surface font-sans mt-0.5">{stats.offerRate}%</span>
          </div>
        </div>

        <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center justify-center">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block">Tỷ lệ từ chối</span>
            <span className="text-2xl font-bold text-on-surface font-sans mt-0.5">
              {stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Funnel Analytics SVG */}
        <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-5 shadow-md flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5 border-b border-outline-variant/20 pb-3">
            <BarChart3 className="w-4 h-4 text-primary" />
            Tiến trình phễu ứng tuyển
          </h3>

          <div className="flex-1 flex flex-col justify-center min-h-[220px] px-2">
            {/* Custom Funnel Visualizer */}
            <div className="space-y-4">
              {/* Row 1: Wishlist */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-secondary">{STATUS_LABELS.wishlist}</span>
                  <span className="text-on-surface">{stats.wishlist}</span>
                </div>
                <div className="h-3 bg-surface border border-outline-variant/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 transition-all duration-500"
                    style={{ width: `${stats.total > 0 ? (stats.wishlist / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Row 2: Applied */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-secondary">{STATUS_LABELS.applied}</span>
                  <span className="text-on-surface">{stats.applied}</span>
                </div>
                <div className="h-3 bg-surface border border-outline-variant/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${stats.total > 0 ? (stats.applied / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Row 3: Interviewing */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-secondary">{STATUS_LABELS.interviewing}</span>
                  <span className="text-on-surface">{stats.interviewing}</span>
                </div>
                <div className="h-3 bg-surface border border-outline-variant/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-500 animate-pulse"
                    style={{ width: `${stats.total > 0 ? (stats.interviewing / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Row 4: Offered */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-secondary">{STATUS_LABELS.offered}</span>
                  <span className="text-on-surface">{stats.offered}</span>
                </div>
                <div className="h-3 bg-surface border border-outline-variant/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${stats.total > 0 ? (stats.offered / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Location Distribution & High Paying List */}
        <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-5 shadow-md flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5 border-b border-outline-variant/20 pb-3">
            <MapPin className="w-4 h-4 text-primary" />
            Hình thức làm việc
          </h3>

          <div className="grid grid-cols-3 gap-3 py-2 text-center">
            <div className="bg-surface border border-outline-variant/20 rounded-lg p-3">
              <span className="text-2xl font-bold text-primary font-mono block">{stats.remote}</span>
              <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block mt-1">{LOCATION_LABELS.remote}</span>
            </div>
            <div className="bg-surface border border-outline-variant/20 rounded-lg p-3">
              <span className="text-2xl font-bold text-primary font-mono block">{stats.hybrid}</span>
              <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block mt-1">{LOCATION_LABELS.hybrid}</span>
            </div>
            <div className="bg-surface border border-outline-variant/20 rounded-lg p-3">
              <span className="text-2xl font-bold text-primary font-mono block">{stats.onsite}</span>
              <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block mt-1">{LOCATION_LABELS.onsite}</span>
            </div>
          </div>

          <div className="border-t border-outline-variant/20 pt-4 flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-3 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-primary" />
              Các vị trí lương cao nhất
            </h4>
            <div className="space-y-2">
              {stats.highPaying.length > 0 ? (
                stats.highPaying.map(app => (
                  <div key={app.id} className="flex justify-between items-center bg-surface border border-outline-variant/10 rounded-lg p-2.5">
                    <div>
                      <span className="text-xs font-bold text-on-surface block font-sans">{app.companyName}</span>
                      <span className="text-[10px] text-secondary font-medium mt-0.5 block">{app.jobTitle}</span>
                    </div>
                    <span className="text-xs font-mono font-semibold text-primary">{app.salaryRange}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-secondary italic text-center py-6 font-sans">
                  Chưa có thông tin mức lương nào được ghi nhận. Hãy điền mức lương trong hồ sơ để xem xếp hạng.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
