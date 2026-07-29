import type { ID, ISODate, ISOInstant, Audited } from './common';

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'refunded' | 'partial_refund';
export type PaymentMethod = 'card' | 'transfer' | 'cash' | 'point' | 'etc';

export type Payment = {
  id: ID;
  enrollmentId?: ID;
  studentId: ID;
  payerParentId?: ID;
  amount: number; // 청구액(원)
  paidAmount?: number; // 누적 수납액
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  dueAt?: ISODate; // 납부 기한
  paidAt?: ISODate; // 수납 완료일
  memo?: string;
} & Audited;

export type TxDirection = 'in' | 'out';

export type Transaction = {
  id: ID;
  direction: TxDirection;
  category: string;
  label: string;
  amount: number;
  method?: string;
  occurredAt: ISODate;
  // 출처 역참조(어느 문서에서 발생한 입·출금인지) — 자산 추적·집계의 조인 키.
  //  수납(markPaid)=paymentId · 정산 지급(pay)=payoutId · 지출 승인(approve)=expenseId.
  //  (v0.1.10, 2026-07-02 자산화 점검 — dbml transactions의 payment_id/payout_id/expense_id와 정합)
  paymentId?: ID;
  payoutId?: ID;
  expenseId?: ID;
};

// super_admin 승인 워크플로우
export type ApprovalStatus = 'requested' | 'approved' | 'rejected';

export type ExpenseCategory =
  | 'supplies' // 비품
  | 'equipment' // 기자재
  | 'books' // 교재
  | 'rent' // 임대료
  | 'utility' // 공과금
  | 'marketing' // 마케팅/홍보
  | 'meal' // 식비/다과
  | 'etc'; // 기타

export type Expense = {
  id: ID;
  category: ExpenseCategory;
  title: string;
  amount: number;
  spentAt: ISODate;
  vendor?: string;
  memo?: string;
  receiptUrl?: string; // 영수증 사진 (데모: data URL, 실제: 업로드 URL)
  status: ApprovalStatus; // 요청 → super_admin 승인 시 출금 반영
  rejectedReason?: string; // 반려 사유(v0.1.12 — 자산화: 클라 임시 보관 → 서버 저장)
} & Audited;

/** 대표가 관리하는 강사 기간 계약. 시수·시급 비교 기준이며 지급 snapshot과는 분리한다. */
export type InstructorContract = {
  id: ID;
  instructorId: ID;
  monthlyHours: number;
  hourlyRate: number;
  periodStart: ISODate;
  periodEnd?: ISODate | null;
  active: boolean;
  memo?: string | null;
} & Audited;

// 'rejected' = 관리자 반려(연결 세션 회수 → 재산정). TBO-05에서 추가.
export type PayoutStatus = 'pending' | 'confirmed' | 'paid' | 'rejected';

// 정산서에 묶인 세션 1건의 산정 명세(감사 추적 스냅샷). TBO-05.
export type PayoutLine = {
  sessionId: ID;
  courseId: ID;
  courseName: string;
  sessionDate: ISODate;
  durationMinutes: number; // 시수(분)
  hourlyRate: number; // 코스 조인 시급(원/시간) 스냅샷
  amount: number; // round(분/60 × 시급)
};

// 시수 측정(읽기 전용) 결과 — preview/generate 공통. TBO-05.
export type PayoutMeasure = {
  instructorId: ID;
  periodStart: ISODate;
  periodEnd: ISODate;
  sessionCount: number;
  totalMinutes: number;
  computedAmount: number; // 시수×시급 자동 산정액
  lines: PayoutLine[];
};

/**
 * 수업 1건이 정산 가능 상태가 되기 전에 남은 조치.
 * 보고서 계열은 (sessionId, studentId)마다 정확히 한 건을 반환한다.
 */
export type PayReadinessIssueType =
  | 'session_execution_missing'
  | 'session_roster_missing'
  | 'report_missing'
  | 'report_draft'
  | 'report_pending_approval'
  | 'report_rejected'
  | 'rate_missing';

export type PayReadinessIssue = {
  id: string;
  type: PayReadinessIssueType;
  sessionId: ID;
  instructorId: ID;
  studentId?: ID;
  reportId?: ID;
  sessionDate: ISODate;
  startTime?: string;
  topic?: string;
  rejectedReason?: string;
};

/** 백엔드가 판정한 시수·페이 준비 상태. 프론트는 이 결과를 재계산하지 않는다. */
export type PayReadiness = {
  periodStart: ISODate;
  periodEnd: ISODate;
  instructorId?: ID;
  eligibleSessionIds: ID[];
  issues: PayReadinessIssue[];
  issueCount: number;
};

export type InstructorPayout = {
  id: ID;
  instructorId: ID;
  periodStart: ISODate;
  periodEnd: ISODate;
  sessionCount: number; // 정산 대상 수업 수
  totalMinutes: number; // 총 시수(분)
  computedAmount: number; // 자동 산정액(불변 기준) — TBO-05
  adjustedAmount?: number; // 관리자 급여 수정액(있으면 우선) — TBO-05
  adjustReason?: string;
  amount: number; // 실효 지급액 = adjustedAmount ?? computedAmount
  status: PayoutStatus;
  lines: PayoutLine[]; // 산정 명세(세션별) — TBO-05
  rejectedReason?: string;
  confirmedAt?: ISOInstant;
  paidAt?: ISOInstant;
  /** paid→rejected 지급 회수 시각. payout_reversal 원장과 같은 transaction에 기록한다. */
  reversedAt?: ISOInstant;
  /** 단순 반려와 지급 회수를 구분하는 회수 사유. */
  reversedReason?: string;
};
