import type { ID, ISODate } from './common';

export type SessionStatus = 'scheduled' | 'held' | 'canceled' | 'no_show' | 'makeup';

export type ClassSession = {
  id: ID;
  courseId: ID;
  instructorId: ID;
  sessionDate: ISODate;
  durationMinutes: number;
  status: SessionStatus;
  topic?: string;
};

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';

export type Attendance = {
  id: ID;
  sessionId: ID;
  studentId: ID;
  status: AttendanceStatus;
};

export type ReportStatus = 'draft' | 'submitted' | 'sent';

export type SessionReport = {
  id: ID;
  sessionId: ID;
  studentId: ID;
  instructorId: ID;
  content: string;
  homework?: string;
  status: ReportStatus;
};
