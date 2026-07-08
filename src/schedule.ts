// 스케줄 엔진(Lantiv형) 자원: 강의실 · 가용/불가 시간. (상세: docs/scheduling.md)
import type { ID, ISODate } from './common';
import type { ClassSession, SessionKind } from './session';

// 강의실(Room/Location). 일간 뷰 컬럼 · 이중예약/capacity 충돌 기준.
export type Room = {
  id: ID;
  name: string;
  buildingId?: ID; // 상위 위치(건물) — 계층(선택)
  capacity?: number; // 최대 인원(capacity 충돌)
  color?: string; // 뷰 색
  isActive: boolean;
};

export type AvailabilityOwner = 'student' | 'instructor' | 'room';
// available = 가용(슬롯 추천 화이트리스트), unavailable = 불가시간(Block, 고정 회색/검정)
export type AvailabilityKind = 'available' | 'unavailable';

// 가용/불가 시간 블록 — 학생·강사·강의실 공통. 주간 반복 + (선택)기간 한정.
export type AvailabilityBlock = {
  id: ID;
  ownerType: AvailabilityOwner;
  ownerId: ID;
  kind: AvailabilityKind;
  weekday: number; // 0(일)~6(토)
  startTime: string; // 'HH:mm'
  endTime: string; // 'HH:mm'
  effectiveFrom?: ISODate;
  effectiveTo?: ISODate;
};

// 시간 구간(엔진 공통) — 충돌·슬롯 추천에서 사용
export type TimeRange = {
  date: ISODate;
  start: string; // 'HH:mm'
  end: string; // 'HH:mm'
};

// 충돌(엔진·API 공통). 빈 배열이면 충돌 없음.
export type ConflictType = 'double_book' | 'unavailable' | 'room_capacity';
export type ConflictResource = 'instructor' | 'room' | 'student';
export type Conflict = {
  type: ConflictType;
  resource?: ConflictResource;
  resourceId?: ID;
  sessionId?: ID; // 충돌 상대 세션(있으면)
  detail?: string;
};

// 주간 표/캘린더용 enriched 읽기모델(세션 + 라벨·색). 백엔드 GET /schedule 응답.
export type ScheduleRow = ClassSession & {
  weekday: number; // 0(일)~6(토)
  courseName: string;
  subjectName: string;
  instructorName: string;
  roomName?: string;
  color?: string; // 과목 색(없으면 프론트 해시 색)
  // 코호트(코스 수강생) — 학생 차원 색/라벨·필터·개인 스케줄용(enrollment status != drop만)
  studentIds: ID[];
  studentNames: string[];
};

// 자원 피커(좌측 레일·필터)용 경량 읽기모델. GET /schedule/resources 응답.
export type ScheduleResource = {
  type: AvailabilityOwner; // 'student' | 'instructor' | 'room'
  id: ID;
  name: string;
  color?: string;
  sub?: string; // 보조 라벨(과목·학년·정원 등)
};
// 배정(추천→세션 생성) 폼용 코스 옵션 — 스케줄 FK 유니버스와 정렬.
export type ScheduleCourseOption = {
  id: ID;
  name: string;
  instructorId: ID;
  instructorName?: string;
  subjectName: string;
  color?: string;
  durationMinutes: number; // 코스 진행시간(세션에서 파생, 없으면 기본값)
};
export type ScheduleResources = {
  instructors: ScheduleResource[];
  rooms: ScheduleResource[];
  students: ScheduleResource[];
  courses: ScheduleCourseOption[];
};

// ── 캘린더 뷰 프리셋(TBO-12 P1, v0.1.12) ──────────────────────
// 필터·스플릿·국가(시차) 조합을 이름으로 저장 — "미국 학생 주간"처럼 반복 조회를 원클릭화.
// [자산화] localStorage가 아닌 DB 컬렉션(calendar_view_presets): 직원 공용 프리셋 = 사내 자산.
// paneCountry는 표(스플릿)별 override — 'KR'을 저장하면 그 표는 KST 고정(강제 null 대신 코드로 직렬화).
export type CalendarViewPreset = {
  id: ID;
  name: string;
  view: 'month' | 'week' | 'day';
  periodFrom?: ISODate; // 기간 뷰(from~to) — 없으면 주간/월간 기본
  periodTo?: ISODate;
  instructorIds: ID[];
  studentIds: ID[];
  roomIds: ID[];
  subjects: string[];
  statuses: string[]; // StatusFilter('present'|'late'|'canceled'|'makeup')
  kinds?: string[]; // [v0.1.14 #2] SessionKind('class'|'level_test'|'counsel') — 전역 종류 필터(미지정=전체)
  groupOnly: boolean;
  q?: string;
  colorBy?: string; // 'subject'|'instructor'|'room'|'student'
  countryCode?: string; // 전역 시차 국가(lib/domain/tz COUNTRIES 코드)
  paneCountryInstructor?: string; // 강사 표 override
  paneCountryStudent?: string; // 학생 표 override
  // v0.1.17: 실제 작업 뷰 저장. 기존 필터만 저장하면 split layout/order/timezone state가 유실되어
  // "뷰 저장"이 캘린더 비교 작업을 복원하지 못했다. 모두 optional로 두어 기존 프리셋과 호환한다.
  modeFilters?: string[]; // SessionModeFilter[] — in_person|online
  kstFixed?: boolean; // true면 모든 표를 00-24 KST 축으로 정렬하고 해외 현지시각은 칩에 병기
  compactCols?: boolean;
  manualPanes?: CalendarViewPresetPane[];
};

export type CreateViewPresetInput = Omit<CalendarViewPreset, 'id'>;

export type CalendarViewPresetPane = {
  uid?: ID;
  dim: 'instructor' | 'student' | 'room' | 'subject';
  ids: ID[];
  countryCode?: string;
  modeFilters?: string[];
  rangeFrom?: ISODate;
  rangeTo?: ISODate;
  pickedDates?: ISODate[];
};

// ── 강사 수업 요청 → 매니저 승인/반려 (TBO-16 #9, v0.1.14) ──────
// 평면 컬럼(JSON payload 아님) — 요청 시점에도 course/instructor/room FK·코호트 무결성 검증.
// 승인 = 기존 createSession 경로 재사용(충돌 409·force 재검사) 후 createdSessionId 역참조(transactions 패턴).
export type ScheduleRequestStatus = 'pending' | 'approved' | 'rejected';

export type ScheduleRequest = {
  id: ID;
  requesterId: ID; // 요청자(강사) = JWT sub
  courseId: ID;
  instructorId: ID; // 수업 담당 강사(요청 시 본인 — 백엔드 강제는 TBO-06 정합 후속)
  roomId?: ID;
  sessionDate: ISODate;
  startTime: string; // 'HH:mm' — KST 단일 진실원(세션과 동일 규약)
  endTime?: string;
  durationMinutes: number;
  kind?: SessionKind;
  topic?: string;
  studentIds?: ID[]; // 명시 코호트 — 코스 활성 수강생 부분집합(세션과 동일 검증)
  status: ScheduleRequestStatus;
  reason?: string; // 반려 사유(반려 시 필수 — Q2 결정 2026-07-06)
  decidedBy?: ID; // 승인/반려한 매니저
  decidedAt?: string; // ISO datetime
  createdSessionId?: ID; // 승인 산출물 세션 역참조
};

// ── 범용 변경 이력 audit_log (TBO-16 #7, v0.1.14) ──────────────
// 누가·언제·무엇을·어떻게. 기록: 세션 CRUD·요청 승인/반려·availability 변경(Q3).
// delete는 changes에 before 전체 스냅샷(복원 근거), update는 변경 필드 diff만.
export type AuditAction = 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'status_change';

export type AuditLog = {
  id: ID;
  entity: string; // 'class_sessions' | 'schedule_requests' | 'availability_blocks' | ...
  entityId: ID;
  action: AuditAction;
  actorId: ID; // JWT sub
  at: string; // ISO datetime
  changes?: Record<string, { before?: unknown; after?: unknown }>;
  reason?: string;
};
