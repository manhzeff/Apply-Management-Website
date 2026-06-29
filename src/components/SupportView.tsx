/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HelpCircle, ClipboardList, Lock, Sparkles } from 'lucide-react';

export default function SupportView() {
  const faqs = [
    {
      q: 'Làm thế nào để kéo và thả các thẻ trên bảng Kanban?',
      a: 'Trên máy tính, chỉ cần nhấp và giữ bất kỳ thẻ công việc nào, kéo thẻ đó sang cột trạng thái khác (ví dụ: từ cột Ý định sang Đang phỏng vấn) rồi thả ra. Số lượng cột, thống kê và lịch sử cập nhật sẽ lập tức đồng bộ theo thời gian thực.',
    },
    {
      q: 'Tôi có thể thêm chi tiết các vòng phỏng vấn và người liên hệ không?',
      a: 'Có! Từ danh sách ứng tuyển, nhấp vào nút Xem chi tiết để mở trang Chi tiết hồ sơ. Tại đây, bạn có thể thêm người liên hệ (như nhà tuyển dụng, quản lý tuyển dụng) và ghi lại dòng thời gian các vòng phỏng vấn (như Portfolio Review hoặc System Design).',
    },
    {
      q: 'Dữ liệu ứng tuyển của tôi được lưu trữ ở đâu?',
      a: 'CareerFlow tôn trọng quyền riêng tư của bạn. Tất cả dữ liệu ứng tuyển, danh sách liên hệ, lịch trình và cài đặt cá nhân đều được lưu trữ an toàn trong bộ nhớ cache trình duyệt của bạn (localStorage). Không có dữ liệu nào bị gửi đi hoặc lưu trữ trên máy chủ bên ngoài.',
    },
    {
      q: 'Làm cách nào để xóa toàn bộ dữ liệu ứng tuyển?',
      a: 'Nếu bạn muốn làm sạch bảng dữ liệu của mình, hãy đi tới phần Cài đặt và nhấp vào nút "Xóa toàn bộ dữ liệu".',
    },
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1 select-none custom-scrollbar pb-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-on-surface font-sans mb-1">Trung tâm Hỗ trợ CareerFlow</h2>
        <p className="text-sm text-secondary font-sans">Các câu hỏi thường gặp và hướng dẫn sử dụng phần mềm.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* FAQs list */}
        <div className="lg:col-span-2 bg-surface-lowest border border-outline-variant/30 rounded-xl p-6 shadow-md space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5 border-b border-outline-variant/20 pb-3 mb-1">
            <HelpCircle className="w-4 h-4 text-primary" />
            Các câu hỏi thường gặp
          </h3>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="p-4 bg-surface rounded-lg border border-outline-variant/10">
                <h4 className="text-xs font-bold text-on-surface font-sans mb-1.5">{faq.q}</h4>
                <p className="text-xs text-secondary leading-relaxed font-sans">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security & System Info Column */}
        <div className="space-y-6">
          <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-5 shadow-md flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5 border-b border-outline-variant/20 pb-3">
              <Lock className="w-4 h-4 text-primary" />
              Quyền riêng tư & Bảo mật
            </h3>
            <p className="text-xs text-secondary leading-relaxed font-sans">
              CareerFlow hoạt động trên mô hình ưu tiên ngoại tuyến để bảo vệ quyền riêng tư. Thông tin công việc, danh sách liên hệ và nhật ký phỏng vấn cá nhân của bạn hoàn toàn nằm trong trình duyệt của bạn. Chúng tôi không bao giờ chia sẻ, bán hoặc theo dõi dữ liệu của bạn, giúp bạn hoàn toàn làm chủ dữ liệu của mình.
            </p>
          </div>

          <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-5 shadow-md flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5 border-b border-outline-variant/20 pb-3">
              <ClipboardList className="w-4 h-4 text-primary" />
              Thông tin phiên bản
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-secondary">Phiên bản phát hành</span>
                <span className="text-on-surface font-mono text-[10px]">v1.2.0-stable</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-secondary">Môi trường chạy</span>
                <span className="text-on-surface font-mono text-[10px]">React 19 + Vite 6</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
