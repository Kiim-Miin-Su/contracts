import type { ID, ISODate } from './common';

export type CounselStatus = 'requested' | 'pending' | 'registered' | 'dropped';
export type CounselSource = 'internal_form' | 'naver_form' | 'google_form' | 'manual' | 'etc';
/** 상담 폼을 실제 작성한 주체. 기존 데이터는 추정하지 않고 unknown으로 보존한다. */
export type CounselSubmitterType = 'parent' | 'student' | 'staff' | 'unknown';
export type DesiredStartTime = 'immediately' | 'within_1_month' | 'within_2_3_months' | 'undecided';
export type LearningAtmosphere = 'self_directed' | 'normal' | 'needs_management';
export type StudentIntention = 'student_wants' | 'parent_only' | 'unknown';
export type CounselResult = 'positive' | 'neutral' | 'negative' | 'no_response' | 'registered';

export type CounselForm = {
  id: ID;
  applicantName: string;
  applicantPhone?: string | null;
  parentId?: ID | null;
  studentId?: ID | null;
  assignedStaffId?: ID | null;
  status: CounselStatus;
  source: CounselSource;
  submitterType: CounselSubmitterType;
  interestSubjectId?: ID | null;
  interestCourseId?: ID | null;
  academyExpectation?: string | null;
  desiredStartTime?: DesiredStartTime | null;
  learningAtmosphere?: LearningAtmosphere | null;
  studentIntention?: StudentIntention | null;
  weakness?: string | null;
  nextContactAt?: ISODate | null;
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
