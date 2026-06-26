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
} & Audited;

export type PayoutStatus = 'pending' | 'confirmed' | 'paid';

export type InstructorPayout = {
  id: ID;
  instructorId: ID;
  periodStart: ISODate;
  periodEnd: ISODate;
  amount: number;
  status: PayoutStatus;
};
