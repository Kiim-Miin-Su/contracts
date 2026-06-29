// 요청(생성/수정) DTO의 공유 형상. 백엔드 DTO class가 implements 하여 일치 보장.
// 프론트 store/mock 함수의 매개변수도 동일 타입을 사용한다(단일 소스).
// 복합 UI 폼(여러 엔드포인트로 분해)은 단일 DTO로 합치지 않고 DTO 조합으로 모델링한다.
import type { ID, ISODate } from './common';
import type { StudentStatus, ResidenceType } from './people';
import type { PaymentMethod, ExpenseCategory } from './finance';
import type { EventType, EventPriority } from './event';
import type { SessionStatus, RecurrenceScope } from './session';
import type {
  CounselSource,
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
  phone?: string;
  grade?: number;
  schoolName?: string;
  residenceType?: ResidenceType;
  status?: StudentStatus;
  memo?: string;
  webId?: string;
};

export type UpdateStudentInput = Partial<CreateStudentInput>;

// 학생 등록 시 함께 연결되는 학부모(임베드용 — studentId는 신규 학생으로 자동 결정)
export type ParentLinkInput = {
  name: string;
  phone?: string;
  webId?: string;
  relation?: string;
  isPayer?: boolean;
  isPrimary?: boolean;
};

// 학부모 단독 등록(POST /parents) — 연결할 학생 지정 필요
export type CreateParentInput = ParentLinkInput & { studentId: ID };

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
  hourlyRate: number;
};

export type CreateRoadmapInput = {
  title: string;
  description?: string;
  targetGrade?: number;
  courseIds?: ID[]; // 연결할 코스(M:N, 순서대로)
};

// ─────────── 수업/출석/보고서 ───────────
export type CreateClassSessionInput = {
  courseId: ID;
  instructorId: ID;
  sessionDate: ISODate;
  startTime?: string; // 'HH:mm'
  durationMinutes: number;
  topic?: string;
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

export type UpdateClassSessionInput = {
  sessionDate?: ISODate;
  startTime?: string;
  durationMinutes?: number;
  topic?: string;
  status?: SessionStatus;
  scope?: RecurrenceScope; // 시리즈 편집 적용 범위
};

export type UpsertSessionReportInput = {
  sessionId: ID;
  studentId: ID;
  content?: string;
  homework?: string;
};

// ─────────── 상담 ───────────
export type CreateCounselInput = {
  applicantName: string;
  applicantPhone?: string;
  source: CounselSource;
  assignedStaffId?: ID;
  interestSubjectId?: ID;
  interestCourseId?: ID;
  academyExpectation?: string;
  desiredStartTime?: DesiredStartTime;
  learningAtmosphere?: LearningAtmosphere;
  studentIntention?: StudentIntention;
  weakness?: string;
};

export type UpdateCounselInput = {
  status?: CounselStatus;
  assignedStaffId?: ID;
  interestSubjectId?: ID;
  interestCourseId?: ID;
  academyExpectation?: string;
  weakness?: string;
};

export type CreateCounselRoundInput = {
  counselorId?: ID;
  summary?: string;
  detail?: string;
  result?: CounselResult;
  nextAction?: string;
  nextContactAt?: ISODate;
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
