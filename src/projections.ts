import type { ID, ISOInstant } from './common';
import type { CounselForm, CounselResult, CounselStatus } from './counsel';
import type { Roadmap } from './catalog';
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

/**
 * [TBO-79 E3] 로드맵 aggregate 읽기 투영 — backend service와 frontend api 클라이언트가
 * 같은 리터럴을 각자 선언하고 있었다(사본 2개). 조인된 코스 요약까지 한 wire로 고정한다.
 */
export type RoadmapAggregateCourse = {
  linkId: ID;
  courseId: ID;
  sortOrder: number;
  courseName: string;
  subjectId: ID;
};

export type RoadmapAggregate = Roadmap & {
  courses: RoadmapAggregateCourse[];
};
