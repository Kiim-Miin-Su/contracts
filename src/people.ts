import type { ID, ISODate, Audited } from './common';

/** 학생 등록 상태. 삭제 여부는 status가 아니라 deletedAt으로 분리한다. */
export type StudentStatus = 'enrolled' | 'on_leave' | 'withdrawn' | 'registration_lost' | 'new_inquiry';
export type StudentGender = 'male' | 'female' | 'other' | 'undisclosed';
export type ResidenceType = 'domestic' | 'overseas';

export type Student = {
  id: ID;
  name: string;
  englishName?: string;
  gender?: StudentGender;
  birthDate?: ISODate;
  grade?: number; // 1~12
  phone?: string;
  status: StudentStatus;
  country?: string; // ISO 3166-1 alpha-2(예: KR·US·VN) — 해외 학생 시차 계산·국가 필터(v0.1.11)
  schoolName?: string;
  residenceType?: ResidenceType;
  address?: string;
  addressDetail?: string;
  kakaoId?: string;
  counselTopic?: string;
  memo?: string;
  webId?: string; // 로그인 계정(users.nickname) — 가입 시에만
} & Audited;

/** 실제 수강(enrollments)과 독립적인 학생의 희망 수업 우선순위. */
export type StudentInterest = {
  id: ID;
  studentId: ID;
  courseId?: ID | null;
  customLabel?: string | null;
  priority: number;
} & Audited;

export type Parent = {
  id: ID;
  name: string;
  phone: string;
  kakaoAvailable: boolean;
  webId?: string;
} & Audited;

export type ParentStudent = {
  id: ID;
  parentId: ID;
  studentId: ID;
  relation?: string;
  isPayer: boolean;
  isPrimary: boolean;
};

export type StudentGuardian = {
  parent: Parent;
  relation: ParentStudent;
};

export type StudentAggregate = {
  student: Student;
  interests: StudentInterest[];
  guardians: StudentGuardian[];
};

// 강사 (staff_role=instructor)
export type Instructor = {
  id: ID;
  name: string;
  subjectName?: string;
};
