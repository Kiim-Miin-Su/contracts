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
  paidAt?: ISODate;
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

export type Expense = {
  id: ID;
  category: string;
  title: string;
  amount: number;
  spentAt: ISODate;
};

export type PayoutStatus = 'pending' | 'confirmed' | 'paid';

export type InstructorPayout = {
  id: ID;
  instructorId: ID;
  periodStart: ISODate;
  periodEnd: ISODate;
  amount: number;
  status: PayoutStatus;
};
