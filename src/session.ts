import type { ID, ISODate } from './common';

export type SessionStatus = 'scheduled' | 'held' | 'canceled' | 'no_show' | 'makeup';

// 반복 일정 편집 적용 범위(구글 캘린더식)
export type RecurrenceScope = 'this' | 'this_and_following' | 'all';

export type ClassSession = {
  id: ID;
  seriesId?: ID; // 반복 생성 시 동일 시리즈 묶음(시리즈 편집용)
  courseId: ID;
  instructorId: ID;
  roomId?: ID; // 강의실(스케줄 v5) — 일간뷰·이중예약·capacity
  sessionDate: ISODate;
  startTime?: string; // 'HH:mm' 시작 시각 — 주간(시간표) 캘린더용
  endTime?: string; // 'HH:mm' 종료(미지정 시 start+duration 파생)
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
