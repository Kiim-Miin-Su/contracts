import type { ID, ISODate, Audited } from './common';

export type EnrollmentStatus = 'active' | 'paused' | 'completed' | 'canceled';

export type Enrollment = {
  id: ID;
  studentId: ID;
  courseId: ID;
  /** 상담에서 수강으로 전환된 경우 원 상담카드 추적 키. */
  counselCardId?: ID | null;
  /** 코스 담당 강사와 다른 개별 배정이 필요한 경우에만 사용한다. */
  instructorId?: ID | null;
  roadmapId?: ID | null;
  status: EnrollmentStatus;
  startDate?: ISODate | null;
  endDate?: ISODate | null;
  totalSessions?: number | null;
  completedSessions?: number;
  memo?: string | null;
  enrolledAt: ISODate;
} & Audited;
