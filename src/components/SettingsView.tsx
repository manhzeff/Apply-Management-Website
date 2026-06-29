/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, User, Sliders, RefreshCw, Check, AlertTriangle } from 'lucide-react';

import { UserProfile } from '../types';

interface SettingsViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onResetData: () => void;
}

export default function SettingsView({ userProfile, onUpdateProfile, onResetData }: SettingsViewProps) {
  const [name, setName] = useState(userProfile.name);
  const [role, setRole] = useState(userProfile.role);
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatarUrl);
  const [resumeText, setResumeText] = useState(userProfile.resumeText || '');
  const [resumePdf, setResumePdf] = useState(userProfile.resumePdf || '');
  const [resumePdfName, setResumePdfName] = useState(userProfile.resumePdfName || '');
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const avatars = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCUxdSSVnJrLoFK5jfRXKWg23Nw-Gg3yQCV9Gz2Uh8JHuUEbpn1APHgHcCCLVcliw6zOe_Ohvw7kaVH2mghfVZcdk4MSAhiBHtgRWqjowiH2r9P68l--OYboCTvwcil6BeiSQvuaCmAHTv4rQ-Bxb8wxg2ZfCFDt_GwMikUTUt5_uVyes8MiYHU4rf7bpjmft_Pz9ItDgepuGPZ1vEjnp9QAHSfp0souOFnICGfOY596QbpaPj2awgRiD7iO67w0o-leR9501SItQ',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuByw1MRJCq6WoBuTFlSbIl437xPSyAiCbG7aY5w8WTLbYz39tvNapGDi14v9W4dLCnjQ42iJR0w5dUKRqJy4sj26X-rIyGiYKpRLucX3rxdkJxrTcf0VKdwjQ_1KdvsPjIuc4DWxhhj19hLLLXIUyYWemkU3UfrEo6xWqraZRoDmMMKJuTnayOJaCqeX6SkyykphbdUTH4-fFm9I2Zv648ouJDPRitHoC1FAd0a-y7j3i0uGQLkJ-fnrDBogX4Hza1Ewtvo43AfYg',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name, role, avatarUrl, resumeText, resumePdf, resumePdfName });
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setPdfError('Vui lòng chỉ chọn tệp định dạng PDF.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPdfError('Kích thước tệp quá lớn. Vui lòng chọn tệp dưới 2MB.');
      return;
    }

    setPdfError(null);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      setResumePdf(base64Data);
      setResumePdfName(file.name);
    };
    reader.onerror = () => {
      setPdfError('Có lỗi xảy ra khi đọc tệp. Vui lòng thử lại.');
    };
  };

  const handleRemovePdf = () => {
    setResumePdf('');
    setResumePdfName('');
    setPdfError(null);
  };

  const handleResetDemo = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu? Thao tác này sẽ xóa vĩnh viễn tất cả các hồ sơ ứng tuyển hiện tại.')) {
      onResetData();
      alert('Xóa cơ sở dữ liệu CareerFlow thành công!');
      window.location.reload();
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1 select-none custom-scrollbar pb-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-on-surface font-sans mb-1">Cài đặt tài khoản & Tùy chọn</h2>
        <p className="text-sm text-secondary font-sans">Cấu hình thông tin cá nhân và quản lý dữ liệu của bạn.</p>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column: Profile Edit form */}
        <div className="lg:col-span-2 bg-surface-lowest border border-outline-variant/30 rounded-xl p-6 shadow-md flex flex-col gap-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5 border-b border-outline-variant/20 pb-3 mb-1">
            <User className="w-4 h-4 text-primary" />
            Thông tin ứng viên
          </h3>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm font-sans text-on-surface focus:border-primary outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">Vị trí mong muốn</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm font-sans text-on-surface focus:border-primary outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            {/* Avatar picker */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">Ảnh đại diện</label>
              <div className="flex flex-wrap items-center gap-4">
                <img
                  src={avatarUrl}
                  alt="Chosen Avatar"
                  className="w-16 h-16 rounded-full border border-primary object-cover"
                />
                <div className="flex gap-2.5">
                  {avatars.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                        avatarUrl === url ? 'border-primary scale-105' : 'border-transparent hover:border-outline-variant'
                      }`}
                    >
                      <img src={url} alt={`Avatar option ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1 pt-2">
                <span className="block text-[10px] text-secondary font-semibold uppercase tracking-wider">Đường dẫn ảnh tùy chỉnh</span>
                <input
                  type="url"
                  placeholder="Dán đường dẫn ảnh tại đây..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-1.5 text-xs font-sans text-on-surface focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            {/* Resume PDF Upload */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">Tải lên CV cá nhân (PDF)</label>
              
              <div className="flex flex-col gap-3">
                {resumePdfName ? (
                  <div className="flex items-center justify-between p-3.5 bg-surface border border-outline-variant/30 rounded-lg">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-xs shrink-0">
                        PDF
                      </div>
                      <span className="text-xs font-medium text-on-surface truncate font-mono">{resumePdfName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePdf}
                      className="text-xs font-bold text-error hover:underline cursor-pointer"
                    >
                      Xóa file
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-outline-variant/30 rounded-xl cursor-pointer bg-surface/20 hover:bg-surface/50 hover:border-primary/50 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                        <span className="text-2xl mb-2 text-primary">↑</span>
                        <p className="text-xs font-bold text-on-surface font-sans">Nhấp để tải lên CV (PDF)</p>
                        <p className="text-[10px] text-secondary font-sans mt-1">Hỗ trợ file PDF dung lượng nhỏ hơn 2MB</p>
                      </div>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {pdfError && (
                  <p className="text-xs text-error font-medium">{pdfError}</p>
                )}
              </div>
            </div>

            {/* Action Row */}
            <div className="flex justify-end gap-3 items-center border-t border-outline-variant/20 pt-4">
              {showSavedToast && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Đã lưu thành công!
                </span>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 bg-primary text-on-primary font-bold text-sm font-sans rounded-lg hover:bg-primary-fixed-dim transition-all shadow-md cursor-pointer"
              >
                Lưu cài đặt
              </button>
            </div>
          </form>
        </div>

        {/* Right column: Database Operations / System info */}
        <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-5 shadow-md flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5 border-b border-outline-variant/20 pb-3">
            <Sliders className="w-4 h-4 text-primary" />
            Bảo trì Cơ sở dữ liệu
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-xs leading-relaxed text-error flex gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block uppercase mb-1">Thao tác nguy hiểm</span>
                Xóa dữ liệu sẽ xóa vĩnh viễn tất cả các hồ sơ ứng tuyển hiện tại khỏi cơ sở dữ liệu trình duyệt của bạn.
              </div>
            </div>

            <button
              onClick={handleResetDemo}
              className="w-full bg-surface border border-outline-variant hover:border-error hover:text-error hover:bg-error/5 text-secondary font-sans font-bold text-xs py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Xóa toàn bộ dữ liệu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
