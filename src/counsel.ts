import type { ID, ISODate } from './common';

export type CounselStatus = 'requested' | 'pending' | 'registered' | 'dropped';
export type CounselSource = 'internal_form' | 'naver_form' | 'google_form' | 'manual' | 'etc';
export type DesiredStartTime = 'immediately' | 'within_1_month' | 'within_2_3_months' | 'undecided';
export type LearningAtmosphere = 'self_directed' | 'normal' | 'needs_management';
export type StudentIntention = 'student_wants' | 'parent_only' | 'unknown';
export type CounselResult = 'positive' | 'neutral' | 'negative' | 'no_response' | 'registered';

export type CounselForm = {
  id: ID;
  applicantName: string;
  applicantPhone?: string;
  parentId?: ID;
  studentId?: ID;
  assignedStaffId?: ID;
  status: CounselStatus;
  source: CounselSource;
  interestSubjectId?: ID;
  interestCourseId?: ID;
  academyExpectation?: string;
  desiredStartTime?: DesiredStartTime;
  learningAtmosphere?: LearningAtmosphere;
  studentIntention?: StudentIntention;
  weakness?: string;
  nextContactAt?: ISODate;
  createdAt: ISODate;
};

export type CounselRound = {
  id: ID;
  counselFormId: ID;
  roundNo: number;
  counselorId?: ID;
  scheduledAt?: ISODate;
  completedAt?: ISODate;
  isCompleted: boolean;
  summary?: string;
  detail?: string;
  result?: CounselResult;
  nextAction?: string;
  nextContactAt?: ISODate;
};
