import type { ID, ISODate } from './common';

export type SessionStatus = 'scheduled' | 'held' | 'canceled' | 'no_show' | 'makeup';

// 강사 본인 출결(세션 status와 별개 — status는 일정 상태, 이건 강사의 참석 기록). '지각' 포함.
export type InstructorAttendanceStatus = 'present' | 'late' | 'absent' | 'makeup';

// 반복 일정 편집 적용 범위(구글 캘린더식)
export type RecurrenceScope = 'this' | 'this_and_following' | 'all';

// [v0.1.14] 세션 종류(캘린더 필터 축) — 구 erd schedule_type 어휘 승계(TBO-16 dbml v8 §26).
//  counsel = 수업 캘린더 내 상담 일정 표기용(상담 카드 counsel_forms 도메인과 별개).
//  시수·정산 규칙은 kind 무관(status held·makeup 기준 — Q1 결정 2026-07-06).
export type SessionKind = 'class' | 'level_test' | 'counsel';

export type ClassSession = {
  id: ID;
  seriesId?: ID; // 반복 생성 시 동일 시리즈 묶음(시리즈 편집용)
  courseId: ID;
  instructorId: ID;
  roomId?: ID; // 강의실(스케줄 v5) — 일간뷰·이중예약·capacity
  sessionDate: ISODate;
  startTime?: string; // 'HH:mm' 시작 시각 — 주간(시간표) 캘린더용
  endTime?: string; // 'HH:mm' 종료(미지정 시 start+duration 파생). [R-9] 자정 크로스(익일 종료) 세션은 미저장 — durationMinutes로 파생(단일 레코드·sessionDate=시작일)
  durationMinutes: number;
  status: SessionStatus;
  topic?: string;
  memo?: string; // 자유 메모(캘린더 상세에서 편집)
  color?: string; // 세션 색상 라벨(오버라이드). 미지정 시 코스 색 → 과목 색.
  makeupForSessionId?: ID; // 보강 세션이면 원본(취소·미진행) 세션 id를 가리킴(보강 이력 추적)
  instructorAttendance?: InstructorAttendanceStatus; // 강사 출결(출석/지각/결석/보강) — 강사 출결 현황 집계용
  // [v0.1.13] 명시 코호트(피드백 2026-07-03) — 수업 추가 시 학생 선택(여러 명=단체).
  //  미지정 = 기존대로 코스 활성 수강생 전원 파생. 지정 시 그 코스 활성 수강생의 부분집합만 허용(무결성).
  studentIds?: ID[];
  // [v0.1.14 — TBO-16] 종류(미지정=class 하위호환)·세션 단건 가격(상담 등 — 코스 정가 courses.price와 별개)
  kind?: SessionKind;
  price?: number;
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

// ── 리포트 템플릿(v0.1.12) ─────────────────────────────────────
// [자산화] 강사가 자주 쓰는 리포트 내용/숙제 — zustand(휘발)에서 DB 컬렉션(report_templates)으로 이관.
export type ReportTemplate = {
  id: ID;
  name: string;
  content: string;
  homework?: string;
};
