import type { ID, ISODate, Audited } from './common';

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
} & Audited;

export type PayoutStatus = 'pending' | 'confirmed' | 'paid';

export type InstructorPayout = {
  id: ID;
  instructorId: ID;
  periodStart: ISODate;
  periodEnd: ISODate;
  sessionCount?: number; // 정산 대상 수업 수
  totalMinutes?: number; // 총 시수(분)
  amount: number;
  status: PayoutStatus;
  paidAt?: ISODate;
};
