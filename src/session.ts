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
  memo?: string; // 자유 메모(캘린더 상세에서 편집)
  color?: string; // 세션 색상 라벨(오버라이드). 미지정 시 코스 색 → 과목 색.
  makeupForSessionId?: ID; // 보강 세션이면 원본(취소·미진행) 세션 id를 가리킴(보강 이력 추적)
};

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';

export type Attendance = {
  id: ID;
  sessionId: ID;
  studentId: ID;
  status: AttendanceStatus;
};

export type ReportStatus = 'draft' | 'submitted' | 'sent';

// TBO-05 정산 게이트용 승인 라이프사이클. 'approved'가 시수 적격 게이트.
// (draft→submitted→approved / rejected). 알림 발송 단계('sent')와 분리.
export type ReportApprovalStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export type SessionReport = {
  id: ID;
  sessionId: ID;
  studentId: ID;
  instructorId: ID;
  subjectId?: ID; // 과목 스냅샷(작성 시점) — TBO-05
  content: string;
  homework?: string;
  status: ReportStatus;
  // 승인 워크플로우(TBO-05) — status와 별개로 정산 적격 판정에 사용.
  approvalStatus?: ReportApprovalStatus;
  submittedAt?: ISODate;
  approvedAt?: ISODate;
  approvedBy?: ID;
  rejectedReason?: string;
};
