import type { ID, ISOInstant } from './common';
import type { CounselForm, CounselResult, CounselStatus } from './counsel';
import type { Enrollment } from './enrollment';
import type {
  Parent,
  ParentStudent,
  Student,
  StudentFamilyRelation,
} from './people';

export type StudentFamilyMemberCounsel = Pick<
  CounselForm,
  'id' | 'status' | 'source' | 'createdAt'
> & {
  nextContactAt: ISOInstant | null;
};

export type StudentFamilyMember = {
  relationId: ID;
  relationType: StudentFamilyRelation['relationType'];
  relationLabel: string | null;
  student: Student;
  guardians: Array<{ parent: Parent; relation: ParentStudent }>;
  activeEnrollmentCount: number;
  counselForms: StudentFamilyMemberCounsel[];
  sharedGuardianParentIds: ID[];
};

export type StudentFamilyAggregate = {
  studentId: ID;
  members: StudentFamilyMember[];
};

export type RegistrationGuardian = {
  parent: Parent;
  relation: ParentStudent;
  linkedExisting: boolean;
};

export type RegistrationResult = {
  student: Student;
  guardian: RegistrationGuardian | null;
  guardians: RegistrationGuardian[];
  enrollment: Enrollment | null;
};

export type StudentCounselIntakeResult = {
  registration: RegistrationResult;
  counsel: CounselForm;
  correlationId: string;
};

export type CounselAnalyticsRange = {
  from?: string | null;
  to?: string | null;
};

export type CounselFunnel = {
  range: { from: string | null; to: string | null };
  total: number;
  statusCounts: Record<CounselStatus, number>;
  roundReach: Array<{ minRounds: number; count: number }>;
  dropAfterRounds: Array<{ rounds: number; count: number }>;
  resultDistribution: Record<CounselResult, number>;
  conversionRate: number;
  dropRate: number;
  avgRoundsToConversion: number | null;
  avgDaysToConversion: number | null;
};

export type CounselCorrelationRow = {
  interestKey: string;
  counselCount: number;
  convertedCount: number;
  conversionRate: number;
  enrolledBySubject: Array<{ subject: string; count: number }>;
};

export type CounselCorrelation = {
  range: { from: string | null; to: string | null };
  totalForms: number;
  rows: CounselCorrelationRow[];
  enrolledSubjects: string[];
};
