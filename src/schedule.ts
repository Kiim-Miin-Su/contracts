// 스케줄 엔진(Lantiv형) 자원: 강의실 · 가용/불가 시간. (상세: docs/scheduling.md)
import type { ID, ISODate, ISOInstant } from './common';
import type { AccountRole } from './account';
import type {
  ClassSession,
  RecurrenceScope,
  SessionKind,
  SessionMode,
  SessionStatus,
} from './session';

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
export type AvailabilityKind = 'available' | 'unavailable' | 'online_only';

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

export type SessionAccountingProjection = {
  teachingMinutes: number;
  payoutEligibleMinutes: number;
  computedAmount: number;
};

export type SessionAccountingImpact = {
  changed: boolean;
  payoutId?: ID | null;
  before: SessionAccountingProjection;
  after: SessionAccountingProjection;
  delta: SessionAccountingProjection;
};

export type SessionAccountingImpactCode =
  | 'ACCOUNTING_IMPACT_ACK_REQUIRED'
  | 'PAYOUT_REVERSAL_REQUIRED';

export type SessionAccountingImpactConflict = {
  code: SessionAccountingImpactCode;
  message: string;
  impact: SessionAccountingImpact;
  impactHash?: string;
  sessionIds?: ID[];
};

export type AvailabilityImpactReason =
  | 'available_removed'
  | 'unavailable_overlap'
  | 'online_only_overlap';

export type AvailabilityImpact = {
  sessionId: ID;
  sessionDate: ISODate;
  startTime?: string;
  endTime?: string;
  instructorId?: ID;
  instructorName?: string;
  courseId?: ID;
  topic?: string;
  reason: AvailabilityImpactReason;
};

export type AvailabilityImpactResponse = {
  impactedSessions: AvailabilityImpact[];
};

export type AvailabilityImpactConflict = AvailabilityImpactResponse & {
  message: string;
  approvalRequired: true;
};

/**
 * 세션 참여자 단일 규칙: 명시 코호트가 있으면 그것을 우선하고, 비어 있을 때만
 * 해당 코스의 활성 수강생을 사용한다. backend와 frontend가 같은 정렬·중복 제거를 소비한다.
 */
export function resolveSessionParticipantIds(
  explicitStudentIds: readonly ID[] | null | undefined,
  activeEnrollmentStudentIds: readonly ID[],
): ID[] {
  const source = explicitStudentIds?.length
    ? explicitStudentIds
    : activeEnrollmentStudentIds;
  return [...new Set(source.map(Number))].sort((a, b) => a - b);
}

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
  // 종료된 수업에서 강사 또는 학생 출결이 비어 있으면 true. 상태 뱃지/출결 탭이 같은 서버 파생값을 사용한다.
  attendanceRequired: boolean;
  missingAttendance: {
    instructor: boolean;
    studentIds: ID[];
  };
  seriesVersion?: number; // [TBO-29C C3] series edit CAS — scope 편집/삭제 시 expectedSeriesVersion으로 회신
};

// ── [TBO-29C C2] 반복 시리즈 자산 — 서버가 series ID를 발급하고 규칙·생성자·기간을 DB에 영속화 ──
// class_sessions.series_id가 이 표를 FK로 참조한다. course/instructor/room/student snapshot은
// 각 occurrence(class_sessions)가 소유하며 시리즈 표에 복제하지 않는다.
export type ScheduleSeriesRepeatKind = 'weekly' | 'custom';

export type ScheduleSeries = {
  id: ID;
  repeatKind: ScheduleSeriesRepeatKind; // weekly=시작일 요일 1개, custom=선택 요일들
  weekdays: number[]; // 0(일)~6(토) — 중복 없음
  startsOn: ISODate; // 첫 occurrence 후보일(KST)
  endsOn: ISODate; // 마지막 occurrence 후보일(KST) — startsOn <= endsOn
  startTime: string; // 'HH:mm' (KST)
  durationMinutes: number; // 10~480 (자정 크로스 포함 — endTime은 occurrence가 파생)
  timeZone: string; // MVP 'Asia/Seoul' — 규칙이 해석되는 기준 시간대
  version: number; // series edit CAS(동시 수정 감지 — C3)
  createdBy?: ID;
  updatedBy?: ID;
};

// 반복 생성 bulk command — 단건 create loop/클라이언트 seriesId(Date.now())를 대체한다.
// 서버가 날짜/요일/기간/시간/cohort/FK를 전체 정규화하고, series+occurrence 전체+audit를 한 transaction으로 저장.
export type CreateScheduleSeriesCommand = {
  courseId: ID;
  instructorId?: ID; // 미지정 시 코스 기본 강사
  roomId?: ID;
  studentIds?: ID[]; // 명시 코호트(부분 선택) — 미지정=코스 활성 수강생 파생
  repeat: {
    kind: ScheduleSeriesRepeatKind;
    weekdays: number[]; // 0~6, 중복 없음(weekly는 1개)
    startsOn: ISODate; // KST
    endsOn: ISODate; // KST — startsOn <= endsOn
  };
  startTime: string; // 'HH:mm' (KST)
  endTime?: string; // startTime보다 이르면 익일 종료(자정 크로스) — durationMinutes 파생 저장
  durationMinutes?: number; // endTime 없을 때 사용
  timeZone?: string; // 기본 'Asia/Seoul'
  topic?: string;
  memo?: string;
  color?: string;
  status?: SessionStatus;
  kind?: SessionKind;
  price?: number;
  mode?: SessionMode;
  isPublic?: boolean;
  force?: boolean; // 충돌 무시 강제(기본 false → 전체 충돌 목록과 함께 409)
};

export type CreateScheduleSeriesResult = {
  series: ScheduleSeries;
  rows: ScheduleRow[]; // 생성된 occurrence 전체(enriched)
  conflicts: Conflict[]; // force 통과 시 감수한 충돌 목록
};

// 자원 피커(좌측 레일·필터)용 경량 읽기모델. GET /schedule/resources 응답.
export type ScheduleResource = {
  type: AvailabilityOwner; // 'student' | 'instructor' | 'room'
  id: ID;
  name: string;
  color?: string;
  sub?: string; // 보조 라벨(과목·학년·정원 등)
  countryCode?: string; // owner 국가/시차 표시용. 예: KR, US, GB, US-W.
  timeZone?: string; // IANA timezone. countryCode보다 세밀한 owner timezone이 있을 때 사용.
  scheduleOwnerRole?: AccountRole; // 일정 담당자 옵션에서 강사/대표를 구분(현재 서버 후보는 두 역할만 반환)
};
// 배정(추천→세션 생성) 폼용 코스 옵션 — 스케줄 FK 유니버스와 정렬.
export type ScheduleCourseOption = {
  id: ID;
  name: string;
  subjectId: ID; // 캘린더 과목 split/filter가 별도 /subjects 전량 조회 없이 쓰는 FK
  instructorId: ID;
  instructorName?: string;
  subjectName: string;
  color?: string;
  durationMinutes: number; // 코스 진행시간(세션에서 파생, 없으면 기본값)
  studentIds: ID[]; // 이 코스의 활성 수강생 — 생성 모달 roster의 DB 권위 집합
};
export type ScheduleResources = {
  instructors: ScheduleResource[];
  rooms: ScheduleResource[];
  students: ScheduleResource[];
  courses: ScheduleCourseOption[];
};

export type ScheduleQuery = {
  from?: ISODate;
  to?: ISODate;
  instructorId?: ID;
  roomId?: ID;
  studentId?: ID;
};

export type ScheduleDeleteOptions = {
  scope?: RecurrenceScope;
  expectedSeriesVersion?: number;
  acknowledgeAccountingImpact?: boolean;
  expectedAccountingImpactHash?: string;
};

export type ConflictCheckInput = {
  sessionDate: ISODate;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  instructorId?: ID;
  roomId?: ID;
  studentIds?: ID[];
  ignoreSessionId?: ID;
  mode?: SessionMode;
};

export type InstructorAttendanceSummary = {
  from?: ISODate;
  to?: ISODate;
  rows: Array<{
    instructorId: ID;
    instructorName: string;
    held: number;
    present: number;
    late: number;
    absent: number;
    makeup: number;
    unmarked: number;
    attendanceRate: number | null;
    teachingMinutes: number;
    teachingHours: number;
  }>;
  totals: {
    instructors: number;
    held: number;
    present: number;
    late: number;
    absent: number;
    makeup: number;
    unmarked: number;
    teachingHours: number;
  };
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
export type ScheduleRequestKind = 'session_create' | 'session_update' | 'session_delete' | 'availability_upsert' | 'availability_delete';

export type ScheduleRequest = {
  id: ID;
  requestKind?: ScheduleRequestKind; // 기본 session_create. availability_*는 강사 가용시간 변경 승인 요청.
  requesterId: ID; // 요청자(강사) = JWT sub
  targetSessionId?: ID; // session_update/session_delete 대상 세션
  courseId?: ID;
  instructorId?: ID; // 수업 담당 강사(요청 시 본인 — 백엔드 강제는 TBO-06 정합 후속)
  roomId?: ID;
  sessionDate?: ISODate;
  startTime?: string; // 'HH:mm' — KST 단일 진실원(세션과 동일 규약)
  endTime?: string;
  durationMinutes?: number;
  kind?: SessionKind;
  mode?: SessionMode; // [C2D 2026-07-08] 수업방식 보존 — 요청→승인 세션까지 전달(미지정=in_person)
  topic?: string;
  memo?: string; // 강사 입력 메모 — 요청 DB에 저장되고 승인 시 class_sessions.memo로 전달
  studentIds?: ID[]; // 명시 코호트 — 코스 활성 수강생 부분집합(세션과 동일 검증)
  requestReason?: string; // 요청자가 제출한 사유(반려 사유 reason과 분리)
  scope?: RecurrenceScope; // 반복 수업 변경 적용 범위(session_update)
  targetAvailabilityId?: ID;
  availabilityOwnerType?: AvailabilityOwner;
  availabilityOwnerId?: ID;
  availabilityKind?: AvailabilityKind;
  availabilityWeekday?: number;
  availabilityStartTime?: string;
  availabilityEndTime?: string;
  availabilityEffectiveFrom?: ISODate;
  availabilityEffectiveTo?: ISODate;
  impactSessionIds?: ID[];
  changeSummary?: string;
  status: ScheduleRequestStatus;
  reason?: string; // 반려 사유(반려 시 필수 — Q2 결정 2026-07-06)
  decidedBy?: ID; // 승인/반려한 매니저
  decidedAt?: ISOInstant;
  createdSessionId?: ID; // 승인 산출물 세션 역참조
  createdAt?: ISOInstant;
  updatedAt?: ISOInstant;
};

export type UpdateScheduleRequestInput = Partial<Pick<ScheduleRequest,
  | 'courseId'
  | 'instructorId'
  | 'roomId'
  | 'sessionDate'
  | 'startTime'
  | 'endTime'
  | 'durationMinutes'
  | 'studentIds'
  | 'topic'
  | 'memo'
  | 'kind'
  | 'mode'
  | 'requestReason'
  | 'scope'
  | 'availabilityKind'
  | 'availabilityWeekday'
  | 'availabilityStartTime'
  | 'availabilityEndTime'
  | 'availabilityEffectiveFrom'
  | 'availabilityEffectiveTo'
>>;

export type ScheduleRequestApprovalOptions = {
  forceConflicts?: boolean;
  acknowledgeAccountingImpact?: boolean;
  expectedAccountingImpactHash?: string;
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
