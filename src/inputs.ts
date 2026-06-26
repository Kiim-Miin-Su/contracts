// 요청(생성) DTO의 공유 형상. 백엔드 DTO class가 implements 하여 일치 보장.
import type { ID, ISODate } from './common';
import type { StudentStatus, ResidenceType } from './people';
import type { PaymentMethod, ExpenseCategory } from './finance';
import type { EventType, EventPriority } from './event';

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

export type CreateEnrollmentInput = {
  studentId: ID;
  courseId: ID;
  roadmapId?: ID;
  totalSessions?: number;
  memo?: string;
};

export type CreatePaymentInput = {
  studentId: ID;
  enrollmentId?: ID;
  payerParentId?: ID;
  amount: number;
  paymentMethod?: PaymentMethod;
};

export type CreateExpenseInput = {
  category: ExpenseCategory;
  title: string;
  amount: number;
  spentAt: ISODate;
  vendor?: string;
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
};

export type CreateEventInput = {
  title: string;
  type: EventType;
  priority?: EventPriority; // 기본 normal
  startDate: ISODate;
  endDate: ISODate;
  allDay?: boolean;
  memo?: string;
};

