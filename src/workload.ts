import type { ID, ISODate } from './common';

// 보강 필요 항목 1건 — 취소·노쇼·과거 미진행 원본 세션에서 파생. 배지·알림·보강 이력의 단위.
export type MakeupReason = 'canceled' | 'no_show' | 'unheld_past';

export type MakeupNeed = {
  originalSessionId: ID;
  courseId: ID;
  instructorId: ID;
  sessionDate: ISODate;
  reason: MakeupReason;
  makeupSessionId?: ID;   // 보강 세션 연결(ClassSession.makeupForSessionId 역참조) — 있으면 해결됨
  resolved: boolean;      // 보강 세션이 잡혔거나 진행되면 true
};

// 강사 월간 업무 수행 요약 — "누가 얼마나 수업/보강했는지". 시수 부족(보강 필요) 과목 게이트.
// TBO-08에서 영속화(기간별 자산화·경영지표).
export type InstructorMonthlyWorkload = {
  instructorId: ID;
  yearMonth: string;         // 'YYYY-MM'
  heldSessions: number;      // 진행 완료 수업 수
  heldMinutes: number;       // 진행 시수(분)
  canceledSessions: number;  // 취소 수
  makeupSessions: number;    // 보강(makeup)으로 진행한 수
  shortfallCourseIds: ID[];  // 월 기준 시수 부족(보강 필요) 과목 id
};
