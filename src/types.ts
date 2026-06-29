/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ApplicationStatus = 'wishlist' | 'applied' | 'interviewing' | 'offered' | 'rejected';

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  wishlist: 'Ý định / Ước mơ',
  applied: 'Đã nộp đơn',
  interviewing: 'Đang phỏng vấn',
  offered: 'Nhận đề nghị (Offer)',
  rejected: 'Bị từ chối',
};

export type LocationType = 'remote' | 'onsite' | 'hybrid';

export const LOCATION_LABELS: Record<LocationType, string> = {
  remote: 'Từ xa',
  onsite: 'Tại văn phòng',
  hybrid: 'Kết hợp (Hybrid)',
};

export interface Contact {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  notes?: string;
}

export interface JobApplication {
  id: string;
  companyName: string;
  jobTitle: string;
  status: ApplicationStatus;
  appliedDate: string; // YYYY-MM-DD
  salaryRange?: string;
  locationType: LocationType;
  notes?: string;
  round?: string; // e.g. "Round 2", "HR", "System Design"
  updatedAt: string; // YYYY-MM-DD
  contacts?: Contact[];
  events?: TimelineEvent[];
}

export interface DashboardStats {
  totalApplied: number;
  activeInterviews: number;
  offersReceived: number;
  rejections: number;
}

export interface UserProfile {
  name: string;
  role: string;
  avatarUrl: string;
  resumeText?: string;
  resumePdf?: string;
  resumePdfName?: string;
}
