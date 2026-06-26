import type { ID, ISODate, Audited } from './common';

export type EnrollmentStatus = 'active' | 'paused' | 'completed' | 'canceled';

export type Enrollment = {
  id: ID;
  studentId: ID;
  courseId: ID;
  roadmapId?: ID;
  status: EnrollmentStatus;
  totalSessions?: number;
  completedSessions?: number;
  memo?: string;
  enrolledAt: ISODate;
} & Audited;
