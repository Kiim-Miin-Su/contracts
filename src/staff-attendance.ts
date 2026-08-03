import type { ID, ISODate, ISOInstant } from './common';
import type { InstructorAttendanceStatus } from './session';

/** 직원의 하루 근태. 수업 회차별 InstructorAttendanceStatus와 저장 원부를 분리한다. */
export type StaffAttendanceStatus =
  | 'present'
  | 'late'
  | 'absent'
  | 'paid_leave'
  | 'unpaid_leave'
  | 'sick_leave'
  | 'remote_work';

export type StaffAttendanceRecord = {
  id: ID;
  staffId: ID;
  workDate: ISODate;
  status: StaffAttendanceStatus;
  checkInAt?: ISOInstant | null;
  checkOutAt?: ISOInstant | null;
  memo?: string | null;
  createdBy: ID;
  updatedBy: ID;
  createdAt: ISOInstant;
  updatedAt: ISOInstant;
};

export type UpsertStaffAttendanceInput = {
  staffId: ID;
  workDate: ISODate;
  status: StaffAttendanceStatus;
  checkInAt?: ISOInstant | null;
  checkOutAt?: ISOInstant | null;
  memo?: string | null;
};

export type DeleteStaffAttendanceInput = {
  reason: string;
};

export type StaffAttendanceQuery = {
  from: ISODate;
  to: ISODate;
  staffId?: ID;
  status?: StaffAttendanceStatus;
};

export type InstructorAttendanceLedgerQuery = {
  from: ISODate;
  to: ISODate;
  instructorId?: ID;
  subjectId?: ID;
  q?: string;
};

export type InstructorAttendanceLedgerEntry = {
  key: string;
  source: 'class_session' | 'staff_day';
  recordId: ID;
  instructorId: ID;
  instructorName: string;
  date: ISODate;
  status: InstructorAttendanceStatus | StaffAttendanceStatus | 'unmarked';
  sessionId?: ID;
  courseId?: ID;
  courseName?: string;
  subjectId?: ID;
  subjectName?: string;
  startTime?: string;
  endTime?: string;
  teachingMinutes: number;
  countsForPay: boolean;
  memo?: string | null;
};

export type InstructorAttendanceLedgerSummary = {
  instructors: number;
  lessonEntries: number;
  staffEntries: number;
  teachingMinutes: number;
  lesson: Record<InstructorAttendanceStatus | 'unmarked', number>;
  staff: Record<StaffAttendanceStatus, number>;
};

export type InstructorAttendanceLedger = {
  from: ISODate;
  to: ISODate;
  entries: InstructorAttendanceLedgerEntry[];
  summary: InstructorAttendanceLedgerSummary;
};

