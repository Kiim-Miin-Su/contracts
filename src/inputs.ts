// 요청(생성/수정) DTO의 공유 형상. 백엔드 DTO class가 implements 하여 일치 보장.
// 프론트 store/mock 함수의 매개변수도 동일 타입을 사용한다(단일 소스).
// 복합 UI 폼(여러 엔드포인트로 분해)은 단일 DTO로 합치지 않고 DTO 조합으로 모델링한다.
import type { ID, ISODate } from './common';
import type { StudentGender, StudentStatus, ResidenceType } from './people';
import type { PaymentMethod, ExpenseCategory } from './finance';
import type { EventType, EventPriority } from './event';
import type { SessionStatus, RecurrenceScope, SessionKind, SessionMode, InstructorAttendanceStatus } from './session';
import type { AvailabilityOwner, AvailabilityKind, ScheduleRequestKind } from './schedule';
import type {
  CounselSource,
  CounselSubmitterType,
  CounselFormSnapshot,
  CounselResult,
  CounselStatus,
  DesiredStartTime,
  LearningAtmosphere,
  StudentIntention,
} from './counsel';

// ─────────── 학생/학부모 ───────────
export type CreateStudentInput = {
  name: string;
  englishName?: string;
  gender?: StudentGender;
  birthDate: ISODate;
  phone?: string;
  grade: number; // 0=Kinder, 1..12=G1..G12
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
  interests: StudentInterestInput[];
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
  roadmapId?: ID;
  totalSessions?: number;
  memo?: string;
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
  homework?: string;
  // [v0.1.14 — A1 drift 보정] BE CreateReportDto·FE api.reports.create가 이미 쓰던 필드를 계약에 편입.
  instructorId?: ID; // 미지정 시 세션 강사로 채움
  status?: 'draft' | 'submitted'; // 기본 submitted(승인 요청)
};

// ─────────── 상담 ───────────
export type CreateCounselInput = {
  applicantName: string;
  applicantPhone?: string;
  source: CounselSource;
  /** 폼 작성 주체. 외부 연동/legacy 호출은 생략 시 unknown으로 저장된다. */
  submitterType?: CounselSubmitterType;
  assignedStaffId?: ID;
  interestSubjectId?: ID;
  interestCourseId?: ID;
  academyExpectation?: string;
  desiredStartTime?: DesiredStartTime;
  learningAtmosphere?: LearningAtmosphere;
  studentIntention?: StudentIntention;
  weakness?: string;
  /** 상담 예약 캘린더의 현재 예정일. counsel_forms.next_contact_at 단일 진실원에 저장된다. */
  nextContactAt?: ISODate;
};

export type UpdateCounselInput = {
  status?: CounselStatus;
  source?: CounselSource;
  submitterType?: CounselSubmitterType;
  applicantName?: string;
  applicantPhone?: string | null;
  assignedStaffId?: ID | null;
  interestSubjectId?: ID | null;
  interestCourseId?: ID | null;
  academyExpectation?: string | null;
  desiredStartTime?: DesiredStartTime | null;
  learningAtmosphere?: LearningAtmosphere | null;
  studentIntention?: StudentIntention | null;
  weakness?: string | null;
  /** null은 예약일 해제, undefined는 미변경이다. */
  nextContactAt?: ISODate | null;
};

export type CreateCounselRoundInput = {
  counselorId?: ID;
  summary?: string;
  detail?: string;
  result?: CounselResult;
  nextAction?: string;
  nextContactAt?: ISODate;
  /** 생략한 legacy 호출은 서버가 현재 상담 폼에서 생성한다. 신규 UI는 전체 페이지를 전송한다. */
  formSnapshot?: CounselFormSnapshot;
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
