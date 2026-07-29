import type { ID, ISODate, ISOInstant } from './common';
import type { StudentAggregate } from './people';

export type CounselStatus = 'requested' | 'pending' | 'registered' | 'dropped';
export type CounselSource = 'internal_form' | 'naver_form' | 'google_form' | 'manual' | 'etc';
/** 상담 폼을 실제 작성한 주체. 기존 데이터는 추정하지 않고 unknown으로 보존한다. */
export type CounselSubmitterType = 'parent' | 'student' | 'staff' | 'unknown';
export type CounselResult = 'positive' | 'neutral' | 'negative' | 'no_response' | 'registered';

export type CounselForm = {
  id: ID;
  /** 현재 학생 프로필은 students aggregate가 유일한 권위다. */
  studentId: ID;
  assignedStaffId?: ID | null;
  status: CounselStatus;
  source: CounselSource;
  submitterType: CounselSubmitterType;
  referenceNotes?: string | null;
  nextContactAt?: ISOInstant | null;
  createdAt: ISODate;
};

/** 각 상담 차수가 생성된 시점의 전체 상담 페이지. 이후 최초 폼 수정과 독립적으로 보존한다. */
export type CounselFormSnapshot = Omit<CounselForm, 'id' | 'createdAt'>;
/** 내부 상담 UI가 회차 snapshot에서 수정할 수 있는 필드. 작성 메타데이터는 서버가 현재 폼에서 병합한다. */
export type CounselFormInputSnapshot = Pick<
  CounselFormSnapshot,
  'studentId' | 'status' | 'referenceNotes' | 'nextContactAt'
>;

export type CounselRound = {
  id: ID;
  counselFormId: ID;
  roundNo: number;
  counselorId?: ID | null;
  scheduledAt?: ISODate | null;
  completedAt?: ISODate | null;
  isCompleted: boolean;
  summary?: string | null;
  detail?: string | null;
  result?: CounselResult | null;
  nextAction?: string | null;
  nextContactAt?: ISOInstant | null;
  formSnapshot: CounselFormSnapshot;
};

export type CounselAggregate = {
  form: CounselForm;
  rounds: CounselRound[];
  student?: StudentAggregate | null;
};
