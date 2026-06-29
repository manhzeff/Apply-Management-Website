/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Mail, FileText, Check, Copy, AlertTriangle, ArrowRight, Brain, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { JobApplication, UserProfile } from '../types';

interface AIAssistantProps {
  application: JobApplication;
  userProfile: UserProfile;
}

type EmailType = 'cover_letter' | 'follow_up' | 'thank_you' | 'negotiation';

export default function AIAssistant({ application, userProfile }: AIAssistantProps) {
  const [activeSubTab, setActiveSubTab] = useState<'writer' | 'matcher'>('writer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PDF CV States (pre-loaded from settings or uploaded locally)
  const [localPdf, setLocalPdf] = useState<string>(userProfile.resumePdf || '');
  const [localPdfName, setLocalPdfName] = useState<string>(userProfile.resumePdfName || '');
  const [localPdfError, setLocalPdfError] = useState<string | null>(null);

  // Email Writer States
  const [emailType, setEmailType] = useState<EmailType>('cover_letter');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Resume Matcher States
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [matchResult, setMatchResult] = useState<{
    strengths: string[];
    gaps: string[];
    recommendations: string[];
  } | null>(null);

  const apiKey = process.env.GEMINI_API_KEY;
  const isApiKeyMissing = !apiKey || apiKey === 'YOUR_API_KEY_HERE';

  // Initialize Gemini AI Client
  const getAIClient = () => {
    if (isApiKeyMissing) {
      throw new Error('Chưa cấu hình API Key. Vui lòng thiết lập GEMINI_API_KEY trong tệp .env.local và khởi động lại server.');
    }
    return new GoogleGenAI({ apiKey });
  };

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setLocalPdfError('Vui lòng chỉ chọn tệp định dạng PDF.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setLocalPdfError('Kích thước tệp quá lớn. Vui lòng chọn tệp dưới 2MB.');
      return;
    }

    setLocalPdfError(null);
    setError(null);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      setLocalPdf(base64Data);
      setLocalPdfName(file.name);
    };
    reader.onerror = () => {
      setLocalPdfError('Có lỗi xảy ra khi đọc tệp.');
    };
  };

  const handleRemoveLocalPdf = () => {
    setLocalPdf('');
    setLocalPdfName('');
    setLocalPdfError(null);
  };

  // 1. Generate Email / Cover Letter Handler
  const handleGenerateEmail = async () => {
    setLoading(true);
    setError(null);
    setCopiedEmail(false);
    
    try {
      const ai = getAIClient();

      const typeLabels: Record<EmailType, string> = {
        cover_letter: 'Thư xin việc (Cover Letter)',
        follow_up: 'Email hỏi kết quả ứng tuyển (Follow-up)',
        thank_you: 'Email cảm ơn sau phỏng vấn (Thank you)',
        negotiation: 'Thư đàm phán lương (Salary Negotiation)',
      };

      const prompt = `
Bạn là một chuyên gia tư vấn tuyển dụng và viết lách chuyên nghiệp. Hãy viết một ${typeLabels[emailType]} bằng tiếng Việt chuyên nghiệp, tự nhiên và cuốn hút dựa trên thông tin sau:
- Tên ứng viên: ${userProfile.name}
- Vị trí hiện tại/mong muốn của ứng viên: ${userProfile.role}
- Công ty ứng tuyển: ${application.companyName}
- Vị trí ứng tuyển: ${application.jobTitle}
- Hình thức làm việc: ${application.locationType}
- Trạng thái hồ sơ hiện tại: ${application.status}
${application.round ? `- Vòng phỏng vấn hiện tại: ${application.round}` : ''}
${application.notes ? `- Mô tả công việc / Ghi chú bổ sung: ${application.notes}` : ''}

${localPdf ? 'Chú ý: Đọc và sử dụng thông tin kinh nghiệm, kỹ năng của ứng viên từ tệp CV PDF đính kèm để đưa vào email.' : ''}

Yêu cầu cụ thể:
1. Trình bày chuyên nghiệp, đúng định dạng thư hoặc email tiêu chuẩn (có tiêu đề email cụ thể nếu viết email).
2. Tông giọng tự tin, lịch thiệp, tôn trọng.
3. Liên kết kỹ năng nổi bật của ứng viên trong CV (nếu có) với vị trí ứng tuyển một cách thuyết phục.
4. Chừa trống hoặc đánh dấu [Thông tin bổ sung] nếu cần điền thêm thông tin cụ thể (ngày giờ, địa điểm...).
5. Chỉ trả về nội dung của thư/email, không kèm theo bất kỳ lời dẫn hay ghi chú giải thích nào bên ngoài.
`;

      const contents: any[] = [];
      if (localPdf) {
        contents.push({
          inlineData: {
            data: localPdf,
            mimeType: 'application/pdf',
          },
        });
      }
      contents.push(prompt);

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
      });

      if (response && response.text) {
        setGeneratedEmail(response.text);
      } else {
        throw new Error('Không nhận được phản hồi từ AI. Vui lòng thử lại.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Có lỗi xảy ra trong quá trình kết nối với AI.');
    } finally {
      setLoading(false);
    }
  };

  // 2. CV Compatibility Matcher Handler
  const handleMatchResume = async () => {
    if (!localPdf) {
      setError('Vui lòng tải lên CV định dạng PDF để thực hiện phân tích tương thích.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ai = getAIClient();

      const jdText = application.notes || `Vị trí công việc: ${application.jobTitle} tại công ty ${application.companyName}.`;
      
      const prompt = `
Bạn là một chuyên gia nhân sự và hệ thống sàng lọc hồ sơ tự động (ATS).
Hãy phân tích sự tương thích giữa CV định dạng PDF được đính kèm của ứng viên và Mô tả công việc (JD) được cung cấp dưới đây.

Mô tả công việc (JD) & Thông tin vị trí tuyển dụng:
"""
Vị trí: ${application.jobTitle}
Công ty: ${application.companyName}
Chi tiết JD/Ghi chú: ${jdText}
"""

Yêu cầu trả về kết quả định dạng JSON duy nhất, không sử dụng khối bao bọc bên ngoài ngoài chuỗi JSON này, cấu trúc như sau:
{
  "score": <số nguyên từ 0 đến 100 biểu thị phần trăm tương thích dựa trên kỹ năng, kinh nghiệm và yêu cầu công việc trong PDF CV so với JD>,
  "strengths": [<danh sách tối đa 4 điểm mạnh, điểm tương thích lớn nhất giữa PDF CV và JD>],
  "gaps": [<danh sách tối đa 4 kỹ năng quan trọng, từ khóa ATS hoặc chứng chỉ cần thiết có trong JD nhưng thiếu hoặc chưa nổi bật trong PDF CV>],
  "recommendations": [<danh sách tối đa 3 đề xuất hành động cụ thể để cải tiến/chỉnh sửa bản CV phù hợp hơn với vị trí này>]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              data: localPdf,
              mimeType: 'application/pdf',
            },
          },
          prompt
        ],
      });

      if (response && response.text) {
        // Strip code block markers if AI returned them
        const cleanedText = response.text
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        
        const data = JSON.parse(cleanedText);
        setMatchScore(data.score);
        setMatchResult({
          strengths: data.strengths || [],
          gaps: data.gaps || [],
          recommendations: data.recommendations || [],
        });
      } else {
        throw new Error('Không nhận được phản hồi phân tích từ AI.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Có lỗi xảy ra khi phân tích hồ sơ. Vui lòng kiểm tra lại kết nối hoặc khóa API.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEmail = () => {
    if (generatedEmail) {
      navigator.clipboard.writeText(generatedEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-5 overflow-hidden">
      {/* Tab Header Controls */}
      <div className="flex border-b border-outline-variant/20 shrink-0">
        <button
          onClick={() => {
            setActiveSubTab('writer');
            setError(null);
          }}
          className={`pb-3 font-sans text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'writer'
              ? 'text-primary border-primary font-bold'
              : 'text-secondary hover:text-primary border-transparent'
          }`}
        >
          <Mail className="w-4 h-4" />
          Viết Thư & Email AI
        </button>
        <button
          onClick={() => {
            setActiveSubTab('matcher');
            setError(null);
          }}
          className={`pb-3 ml-6 font-sans text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'matcher'
              ? 'text-primary border-primary font-bold'
              : 'text-secondary hover:text-primary border-transparent'
          }`}
        >
          <FileText className="w-4 h-4" />
          Phân tích & Tương thích CV (PDF)
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar pb-2">
        {/* API Key Missing Alert */}
        {isApiKeyMissing && (
          <div className="p-4 mb-4 bg-error/10 border border-error/20 rounded-xl text-xs text-error flex gap-3 leading-relaxed">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-bold block uppercase mb-1">Chưa cấu hình API Key</span>
              Vui lòng mở tệp <span className="font-mono bg-error/5 px-1 py-0.5 rounded">.env.local</span> và gán khóa Gemini API Key của bạn vào biến <span className="font-mono bg-error/5 px-1 py-0.5 rounded">GEMINI_API_KEY</span> để sử dụng tính năng này. Sau đó khởi động lại server phát triển.
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 mb-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex gap-3 leading-relaxed">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div className="flex-1">
              <span className="font-bold block uppercase mb-0.5">Thông báo</span>
              {error}
            </div>
          </div>
        )}

        {/* PDF File upload zone for local override / preview (Available in both tabs) */}
        <div className="bg-surface-low/50 border border-outline-variant/30 rounded-xl p-4 mb-5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-on-surface uppercase tracking-wider">File CV (PDF) dùng để phân tích</span>
            {localPdfName && (
              <button
                onClick={handleRemoveLocalPdf}
                className="text-[10px] font-bold text-error hover:underline cursor-pointer"
              >
                Gỡ file
              </button>
            )}
          </div>

          {localPdfName ? (
            <div className="flex items-center gap-2.5 p-3 bg-surface border border-outline-variant/20 rounded-lg">
              <div className="w-8 h-8 rounded bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-xs shrink-0">
                PDF
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-on-surface truncate font-mono">{localPdfName}</p>
                <p className="text-[9px] text-secondary">
                  {userProfile.resumePdfName === localPdfName ? 'Dữ liệu được lấy từ Cài đặt cá nhân' : 'Dữ liệu tải lên tạm thời'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-outline-variant/50 rounded-xl cursor-pointer bg-surface/10 hover:bg-surface/30 hover:border-primary/50 transition-all">
                <div className="flex flex-col items-center justify-center text-center px-4">
                  <span className="text-sm font-bold text-primary font-sans">↑ Chọn CV PDF của bạn</span>
                  <span className="text-[9px] text-secondary font-sans mt-0.5">Hỗ trợ file PDF dung lượng nhỏ hơn 2MB</span>
                </div>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleLocalFileChange}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {localPdfError && (
            <p className="text-xs text-error font-medium">{localPdfError}</p>
          )}
        </div>

        {/* Tab 1: AI Email Writer */}
        {activeSubTab === 'writer' && (
          <div className="space-y-5">
            <div className="bg-surface border border-outline-variant/10 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary">Chọn loại văn bản muốn viết</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(['cover_letter', 'follow_up', 'thank_you', 'negotiation'] as EmailType[]).map((type) => {
                    const labels: Record<EmailType, string> = {
                      cover_letter: 'Thư xin việc',
                      follow_up: 'Hỏi kết quả',
                      thank_you: 'Cảm ơn phỏng vấn',
                      negotiation: 'Đàm phán lương',
                    };
                    return (
                      <button
                        key={type}
                        onClick={() => setEmailType(type)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-sans border transition-all cursor-pointer ${
                          emailType === type
                            ? 'bg-primary/10 text-primary border-primary/30'
                            : 'bg-surface-lowest text-secondary border-outline-variant/30 hover:border-outline'
                        }`}
                      >
                        {labels[type]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleGenerateEmail}
                disabled={loading || isApiKeyMissing}
                className="w-full md:w-auto px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-lg hover:bg-primary-fixed-dim hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0"
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{loading ? 'Đang viết...' : 'Tạo văn bản với AI'}</span>
              </button>
            </div>

            {/* Response Output Container */}
            {generatedEmail ? (
              <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-5 shadow-lg flex flex-col gap-4 relative">
                <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                    <Brain className="w-4 h-4" /> Trợ lý Gemini đã soạn
                  </span>
                  <button
                    onClick={handleCopyEmail}
                    className="flex items-center gap-1 text-[10px] font-bold text-secondary hover:text-primary transition-colors hover:bg-surface px-2.5 py-1.5 rounded-lg border border-outline-variant/20 cursor-pointer"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Đã sao chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-sm leading-relaxed text-on-surface font-sans whitespace-pre-wrap select-text selection:bg-primary/20 pr-1">
                  {generatedEmail}
                </div>
              </div>
            ) : (
              !loading && (
                <div className="py-16 text-center border-2 border-dashed border-outline-variant/30 rounded-xl bg-surface-lowest/10">
                  <Sparkles className="w-10 h-10 text-secondary/30 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-on-surface-variant font-sans">Sẵn sàng hỗ trợ bạn</h4>
                  <p className="text-xs text-secondary/70 max-w-xs mx-auto mt-1 leading-relaxed">
                    Chọn loại thư và nhấn nút phía trên để Gemini AI giúp bạn tạo một bản thảo hoàn hảo.
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {/* Tab 2: Resume Matcher */}
        {activeSubTab === 'matcher' && (
          <div className="space-y-5">
            {/* Analyze Trigger */}
            <div className="bg-surface border border-outline-variant/10 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">Phân tích CV PDF đối chiếu JD</h4>
                <p className="text-[11px] text-secondary leading-relaxed">
                  Bấm bắt đầu phân tích để AI đọc nội dung file PDF đính kèm phía trên và đối chiếu với mô tả vị trí.
                </p>
              </div>

              <button
                onClick={handleMatchResume}
                disabled={loading || isApiKeyMissing || !localPdf}
                className="w-full md:w-auto px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-lg hover:bg-primary-fixed-dim hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0"
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{loading ? 'Đang phân tích...' : 'Bắt đầu phân tích CV'}</span>
              </button>
            </div>

            {/* Matcher Results Output */}
            {matchScore !== null && matchResult && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Compatibility Score Circle */}
                <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-5 shadow-lg flex flex-col items-center justify-center text-center gap-4">
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider">Độ tương thích</span>
                  
                  {/* Visual Circle Meter */}
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    {/* SVG Progress Circle */}
                    <svg className="w-full h-full transform -rotate-90">
                      {/* background */}
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        className="stroke-surface-low fill-none"
                        strokeWidth="10"
                      />
                      {/* progress indicator */}
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        className={`fill-none transition-all duration-1000 ${
                          matchScore >= 80 
                            ? 'stroke-emerald-400' 
                            : matchScore >= 50 
                            ? 'stroke-amber-400' 
                            : 'stroke-error'
                        }`}
                        strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 60}
                        strokeDashoffset={2 * Math.PI * 60 * (1 - matchScore / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-3xl font-extrabold text-on-surface font-mono">
                      {matchScore}%
                    </span>
                  </div>

                  <p className="text-xs text-secondary font-medium px-4 leading-relaxed">
                    {matchScore >= 80 
                      ? 'Tuyệt vời! CV của bạn có độ khớp rất cao với các yêu cầu cốt lõi của công việc này.'
                      : matchScore >= 50
                      ? 'Khá tốt. CV của bạn đáp ứng được một số yêu cầu nhưng cần bổ sung thêm từ khóa quan trọng.'
                      : 'Độ khớp thấp. Bạn nên cập nhật CV theo các đề xuất chi tiết bên cạnh để cải thiện khả năng lọc.'
                    }
                  </p>
                </div>

                {/* Bullet Results lists */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Strengths */}
                  <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-5 shadow-md space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 border-b border-outline-variant/10 pb-2">
                      ✓ Điểm mạnh tương thích
                    </h4>
                    <ul className="text-xs leading-relaxed text-secondary space-y-2 list-none">
                      {matchResult.strengths.map((str, idx) => (
                        <li key={idx} className="flex gap-2 items-start text-on-surface-variant font-sans">
                          <span className="text-emerald-400 shrink-0 mt-0.5">✦</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Gaps (Missing ATS keywords) */}
                  <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-5 shadow-md space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5 border-b border-outline-variant/10 pb-2">
                      ⚠ Điểm thiếu sót (ATS Keywords)
                    </h4>
                    <ul className="text-xs leading-relaxed text-secondary space-y-2 list-none">
                      {matchResult.gaps.map((gap, idx) => (
                        <li key={idx} className="flex gap-2 items-start text-on-surface-variant font-sans">
                          <span className="text-amber-300 shrink-0 mt-0.5">✦</span>
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-5 shadow-md space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-outline-variant/10 pb-2">
                      ⚙ Đề xuất tối ưu CV
                    </h4>
                    <ul className="text-xs leading-relaxed text-secondary space-y-2 list-none">
                      {matchResult.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex gap-2 items-start text-on-surface-variant font-sans">
                          <span className="text-primary shrink-0 mt-0.5"><ArrowRight className="w-3 h-3" /></span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Initial empty helper */}
            {matchScore === null && !loading && (
              <div className="py-16 text-center border-2 border-dashed border-outline-variant/30 rounded-xl bg-surface-lowest/10">
                <FileText className="w-10 h-10 text-secondary/30 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-on-surface-variant font-sans">Phân tích CV thông minh</h4>
                <p className="text-xs text-secondary/70 max-w-xs mx-auto mt-1 leading-relaxed">
                  So sánh nội dung CV PDF với yêu cầu mô tả công việc (JD) để tối ưu hóa khả năng vượt qua vòng lọc CV.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Global Loading Overlay inside tab container */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            {/* Pulsing ring loader */}
            <div className="relative flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <Sparkles className="w-4 h-4 text-primary absolute animate-pulse" />
            </div>
            <span className="text-xs font-medium text-secondary font-sans animate-pulse">
              Trí tuệ nhân tạo Gemini đang đọc và phân tích CV PDF...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
