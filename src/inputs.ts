// 요청(생성/수정) DTO의 공유 형상. 백엔드 DTO class가 implements 하여 일치 보장.
// 프론트 store/mock 함수의 매개변수도 동일 타입을 사용한다(단일 소스).
// 복합 UI 폼(여러 엔드포인트로 분해)은 단일 DTO로 합치지 않고 DTO 조합으로 모델링한다.
import type { ID, ISODate, ISOInstant } from './common';
import type { StudentGender, StudentStatus, ResidenceType } from './people';
import type { PaymentMethod, ExpenseCategory } from './finance';
import type { EventType, EventPriority } from './event';
import type {
  AttendanceStatus,
  SessionStatus,
  RecurrenceScope,
  SessionKind,
  SessionMode,
  InstructorAttendanceStatus,
} from './session';
import type {
  AvailabilityOwner,
  AvailabilityKind,
  Conflict,
  ScheduleRequestKind,
  ScheduleRow,
  ScheduleSeries,
  ScheduleSeriesRepeatKind,
} from './schedule';
import type { Course, Subject } from './catalog';
import type { Enrollment, EnrollmentStatus } from './enrollment';
import type {
  CounselFormInputSnapshot,
  CounselResult,
  CounselStatus,
} from './counsel';

// ─────────── 학생/학부모 ───────────
export type CreateInstructorInput = {
  webId: string;
  name: string;
  password: string;
  email?: string;
  phone?: string;
  university?: string;
  major?: string;
  birthYear?: number;
  countryCode?: string;
  timeZone?: string;
  defaultHourlyRate?: number;
  canTeachKinder?: boolean;
};

export type UpdateInstructorInput = {
  name?: string;
  phone?: string;
  email?: string;
  university?: string | null;
  major?: string | null;
  birthYear?: number | null;
  countryCode?: string | null;
  timeZone?: string | null;
  defaultHourlyRate?: number;
  canTeachKinder?: boolean;
};

export type CreateStudentInput = {
  name: string;
  englishName?: string;
  gender?: StudentGender;
  birthDate: ISODate;
  phone?: string;
  grade: number; // 0=Kinder, 1..13=G1..G13
  schoolName?: string;
  residenceType?: ResidenceType;
  address?: string;
  addressDetail?: string;
  kakaoId?: string;
  counselTopic?: string;
  status?: StudentStatus;
  memo?: string;
  webId?: string;
  // [v0.1.14 — A1 drift 보정] 국가·시차 기능(v0.1.11)의 Student.country가 Input에 누락돼 있었음.
  country?: string; // ISO 3166-1 alpha-2(예: KR·US·VN)
};

export type UpdateStudentInput = Partial<CreateStudentInput>;

export type StudentInterestInput = {
  courseId?: ID;
  customLabel?: string;
  priority: number;
};

export type CreateStudentFamilyRelationInput = {
  /** URL의 기준 학생과 연결할 상대 학생. DB에는 canonical a<b pair로 저장된다. */
  relatedStudentId: ID;
  relationType: 'sibling' | 'other';
  relationLabel?: string;
};

export type UpdateStudentFamilyRelationInput = Partial<Pick<
  CreateStudentFamilyRelationInput,
  'relationType' | 'relationLabel'
>>;

export type CreateStudentAcademicHistoryInput = {
  studentId: ID;
  grade: number;
  schoolName: string;
  startedOn: ISODate;
  endedOn?: ISODate | null;
};

export type UpdateStudentAcademicHistoryInput = Partial<Omit<CreateStudentAcademicHistoryInput, 'studentId'>>;

export type UpsertAttendanceInput = {
  sessionId: ID;
  studentId: ID;
  status: AttendanceStatus;
};

export type ClearAttendanceInput = {
  reason: string;
};

// 학생 등록 시 함께 연결되는 학부모(임베드용 — studentId는 신규 학생으로 자동 결정)
export type ParentLinkInput = {
  name: string;
  phone?: string;
  webId?: string;
  relation?: string;
  isPayer?: boolean;
  isPrimary?: boolean;
};

/** 학생 원부+희망 수업+보호자 관계를 한 transaction으로 생성하는 command 계약. */
export type CreateStudentAggregateInput = {
  student: CreateStudentInput;
  /** 관심 희망 수업은 선택 사항이다. 생략/빈 배열은 아직 희망 수업이 정해지지 않은 상태를 뜻한다. */
  interests?: StudentInterestInput[];
  guardians?: ParentLinkInput[];
  /** v0.2.5 이하 클라이언트 전환용. guardians와 동시 사용 금지. */
  guardian?: ParentLinkInput;
  courseId?: ID;
};

/** 학생 원부와 희망 수업 전체를 원자 교체한다. 보호자 관계는 독립 relation CRUD를 사용한다. */
export type UpdateStudentAggregateInput = {
  student?: UpdateStudentInput;
  interests?: StudentInterestInput[];
};

// 학부모 단독 등록(POST /parents) — 연결할 학생 지정 필요
export type CreateParentInput = ParentLinkInput & { studentId: ID };

// [v0.1.14 — A1] 기존 보호자 ↔ 학생 연결(POST /parents/link — 형제 케이스).
//  ParentLinkInput(신규 학생 등록 임베드용)과 다른 계약이라 별도 타입으로 명문화.
export type LinkParentInput = {
  parentId: ID;
  studentId: ID;
  relation?: string;
  isPayer?: boolean;
  isPrimary?: boolean;
};

// ─────────── 수강/카탈로그/로드맵 ───────────
export type CreateEnrollmentInput = {
  studentId: ID;
  courseId: ID;
  counselCardId?: ID;
  roadmapId?: ID;
  startDate?: ISODate;
  endDate?: ISODate;
  totalSessions?: number;
  memo?: string;
};

/** 수강 원부의 업무 상태/기간 수정. reason은 audit command metadata이며 enrollments 컬럼이 아니다. */
export type UpdateEnrollmentInput = {
  status?: EnrollmentStatus;
  startDate?: ISODate | null;
  endDate?: ISODate | null;
  totalSessions?: number | null;
  memo?: string | null;
  reason: string;
};

export type CreateInstructorContractInput = {
  instructorId: ID;
  monthlyHours: number;
  hourlyRate: number;
  periodStart: ISODate;
  periodEnd?: ISODate | null;
  memo?: string | null;
};

export type UpdateInstructorContractInput = {
  monthlyHours?: number;
  hourlyRate?: number;
  periodStart?: ISODate;
  periodEnd?: ISODate | null;
  active?: boolean;
  memo?: string | null;
  reason: string;
};

export type CreateSubjectInput = {
  code: string;
  name: string;
};

export type CreateCourseInput = {
  name: string;
  subjectId: ID;
  instructorId: ID;
  price: number;
  /** @deprecated v0.2.7 write는 hourlyRateOverride를 사용. legacy client 호환용. */
  hourlyRate?: number;
  hourlyRateOverride?: number | null;
  isKinder?: boolean;
  color?: string; // 캘린더 색상 라벨(개설 시 선택)
};

export type CreateRoadmapInput = {
  title: string;
  description?: string;
  targetGrade?: number;
  courseIds?: ID[]; // 연결할 코스(M:N, 순서대로)
};

// ─────────── 수업/출석/보고서 ───────────
// [v0.1.14] BE CreateScheduleDto와 정합(implements 강제 — TBO-16 감사 A1 해소):
//  instructorId 선택(미지정=코스 기본 강사)·startTime 필수·studentIds·status·force·kind·price.
export type CreateClassSessionInput = {
  courseId: ID;
  instructorId?: ID; // 미지정 시 코스 기본 강사
  roomId?: ID; // 강의실(스케줄 v5) — 추천→배정·일간뷰
  sessionDate: ISODate;
  startTime: string; // 'HH:mm'
  endTime?: string; // 'HH:mm' (미지정 시 start+duration 파생). [R-9] startTime보다 이르면 익일 종료(자정 크로스)로 해석
  durationMinutes?: number; // endTime 없을 때 사용(기본 60)
  studentIds?: ID[]; // 명시 코호트(v0.1.13) — 코스 활성 수강생 부분집합
  topic?: string;
  memo?: string;
  color?: string;
  seriesId?: ID; // 반복 시리즈로 묶을 때
  status?: SessionStatus;
  force?: boolean; // 충돌 무시 강제(기본 false → 409)
  kind?: SessionKind; // [v0.1.14] 종류(기본 class)
  price?: number; // [v0.1.14] 세션 단건 가격(상담 등 — 코스 정가와 별개)
  mode?: SessionMode; // [v0.1.16] 수업방식(기본 in_person)
  isPublic?: boolean; // 공통 일정: 승인된 전 직원에게 조회 공개(수정 권한은 확장하지 않음)
};

/**
 * 관리자 수업 개설 화면의 제품 계약.
 * 사용자는 courseId를 선행 생성하지 않고 과목명을 입력한다. 서버가 subject → instructor별 course →
 * 선택 학생 enrollment → session을 한 transaction으로 resolve/create한다.
 */
export type OpenClassCatalogInput = {
  subjectName: string;
  instructorId: ID;
  studentIds?: ID[];
  hourlyRateOverride?: number | null;
  coursePrice?: number;
  isKinder?: boolean;
  color?: string;
};

export type OpenClassInput = OpenClassCatalogInput & Omit<
  CreateClassSessionInput,
  'courseId' | 'instructorId' | 'studentIds' | 'seriesId' | 'makeupForSessionId'
>;

export type OpenClassSeriesInput = OpenClassCatalogInput & {
  roomId?: ID;
  repeat: {
    kind: ScheduleSeriesRepeatKind;
    weekdays: number[];
    startsOn: ISODate;
    endsOn: ISODate;
  };
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  timeZone?: string;
  topic?: string;
  memo?: string;
  status?: SessionStatus;
  kind?: SessionKind;
  price?: number;
  mode?: SessionMode;
  isPublic?: boolean;
  force?: boolean;
};

export type OpenClassResult = {
  subject: Subject;
  course: Course;
  enrollments: Enrollment[];
  row: ScheduleRow;
  conflicts: Conflict[];
};

export type OpenClassSeriesResult = {
  subject: Subject;
  course: Course;
  enrollments: Enrollment[];
  series: ScheduleSeries;
  rows: ScheduleRow[];
  conflicts: Conflict[];
};

// 기간 + 요일 반복 생성(시리즈)
export type CreateRecurringInput = {
  courseId: ID;
  instructorId: ID;
  startDate: ISODate;
  endDate: ISODate;
  weekdays: number[]; // 0(일)~6(토)
  startTime?: string;
  durationMinutes: number;
  topic?: string;
};

// [v0.1.14] BE UpdateScheduleDto와 정합(모든 필드 선택 — 이동·리사이즈·상세편집 공용).
export type UpdateClassSessionInput = {
  sessionDate?: ISODate;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  studentIds?: ID[]; // 명시 코호트(v0.1.13)
  roomId?: ID;
  instructorId?: ID;
  courseId?: ID;
  topic?: string;
  memo?: string;
  color?: string;
  status?: SessionStatus;
  instructorAttendance?: InstructorAttendanceStatus;
  scope?: RecurrenceScope; // 시리즈 편집 적용 범위
  expectedSeriesVersion?: number; // [TBO-29C C3] series edit CAS — 불일치 시 409 SERIES_VERSION_STALE
  force?: boolean;
  kind?: SessionKind; // [v0.1.14]
  price?: number; // [v0.1.14]
  mode?: SessionMode; // [v0.1.16] 수업방식
  isPublic?: boolean;
};

// [v0.1.14 — TBO-16 #9] 강사 수업 요청 생성(승인 대기). 세션 생성 Input과 동일 검증 규약.
export type CreateScheduleRequestInput = {
  requestKind?: ScheduleRequestKind; // 기본 session_create
  targetSessionId?: ID; // session_update/session_delete 대상 세션
  courseId?: ID;
  instructorId?: ID; // 미지정 시 코스 기본 강사
  roomId?: ID;
  sessionDate?: ISODate;
  startTime?: string; // 'HH:mm'
  endTime?: string;
  durationMinutes?: number;
  studentIds?: ID[];
  topic?: string;
  memo?: string; // 요청 단계 보존 후 승인 세션 memo로 전달
  kind?: SessionKind;
  mode?: SessionMode; // [C2D] 수업방식 보존(session_create)
  requestReason?: string; // 요청자가 제출한 사유(반려 사유 reason과 분리)
  scope?: RecurrenceScope; // session_update 반복 적용 범위(this|this_and_following|all)
  targetAvailabilityId?: ID;
  availabilityOwnerType?: AvailabilityOwner;
  availabilityOwnerId?: ID;
  availabilityKind?: AvailabilityKind;
  availabilityWeekday?: number;
  availabilityStartTime?: string;
  availabilityEndTime?: string;
  availabilityEffectiveFrom?: ISODate;
  availabilityEffectiveTo?: ISODate;
};

export type UpsertSessionReportInput = {
  sessionId: ID;
  studentId: ID;
  content?: string;
  progressPage?: string;
  homework?: string;
  // [v0.1.14 — A1 drift 보정] BE CreateReportDto·FE api.reports.create가 이미 쓰던 필드를 계약에 편입.
  instructorId?: ID; // 미지정 시 세션 강사로 채움
  status?: 'draft' | 'submitted'; // 기본 submitted(승인 요청)
};

// ─────────── 상담 ───────────
export type CreateCounselInput = {
  studentId: ID;
  /** 내부 작성 source/submitter/assigned staff는 서버가 JWT actor에서 결정한다. */
  referenceNotes?: string;
  /** 상담 예약 캘린더의 현재 예정 시각. 타임존을 포함한 instant로 저장된다. */
  nextContactAt?: ISOInstant;
};

/** 신규 학생 원부와 첫 상담을 한 transaction으로 생성하는 내부 intake command. */
export type CreateStudentCounselIntakeInput = {
  registration: CreateStudentAggregateInput;
  /** studentId와 작성 메타데이터는 서버가 신규 학생/JWT actor에서 결정한다. */
  counsel: Omit<CreateCounselInput, 'studentId'>;
};

export type UpdateCounselInput = {
  status?: CounselStatus;
  studentId?: ID;
  /** source/submitter/assigned staff는 내부 API에서 수정할 수 없는 서버 소유 메타데이터다. */
  referenceNotes?: string | null;
  /** null은 예정 시각 해제, undefined는 미변경이다. */
  nextContactAt?: ISOInstant | null;
};

export type UpdateCounselRoundInput = {
  scheduledAt?: ISODate | null;
  completedAt?: ISODate | null;
  isCompleted?: boolean;
  summary?: string | null;
  detail?: string | null;
  result?: CounselResult | null;
  nextAction?: string | null;
  nextContactAt?: ISOInstant | null;
  formSnapshot?: CounselFormInputSnapshot;
};

export type CreateCounselRoundInput = {
  summary?: string;
  detail?: string;
  result?: CounselResult;
  nextAction?: string;
  nextContactAt?: ISOInstant;
  /** 생략 시 서버가 현재 폼을 snapshot하며, 입력 시에도 편집 가능 필드만 받는다. */
  formSnapshot?: CounselFormInputSnapshot;
};

// ─────────── 결제/지출/강사페이 ───────────
export type CreatePaymentInput = {
  studentId: ID;
  enrollmentId?: ID;
  payerParentId?: ID;
  amount: number;
  paymentMethod?: PaymentMethod;
  dueAt?: ISODate; // 납부 기한(청구 시 지정 가능)
};

export type UpdatePaymentInput = {
  amount?: number;
  paymentMethod?: PaymentMethod;
  dueAt?: ISODate;
  memo?: string;
};

export type CreateExpenseInput = {
  category: ExpenseCategory;
  title: string;
  amount: number;
  spentAt: ISODate;
  vendor?: string;
  memo?: string;
  receiptUrl?: string;
};

export type CreatePayoutInput = {
  instructorId: ID;
  periodStart: ISODate;
  periodEnd: ISODate;
  amount?: number; // 수동 보정 금액(미지정 시 시수×시급 자동 산정)
};

// ─────────── 스케줄 자원(강의실·가용/불가) ───────────
export type CreateRoomInput = {
  name: string;
  buildingId?: ID;
  capacity?: number;
  color?: string;
  isActive?: boolean;
};

export type UpsertAvailabilityInput = {
  id?: ID; // 있으면 수정, 없으면 생성
  ownerType: AvailabilityOwner;
  ownerId: ID;
  kind?: AvailabilityKind; // 기본 available
  weekday: number; // 0(일)~6(토)
  startTime: string; // 'HH:mm'
  endTime: string;
  effectiveFrom?: ISODate;
  effectiveTo?: ISODate;
};

// ─────────── 이벤트 ───────────
export type CreateEventInput = {
  title: string;
  type: EventType;
  priority?: EventPriority; // 기본 normal
  startDate: ISODate;
  endDate: ISODate;
  allDay?: boolean;
  memo?: string;
};
