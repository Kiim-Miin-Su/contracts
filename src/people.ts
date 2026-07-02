import type { ID, Audited } from './common';

export type StudentStatus = 'lead' | 'active' | 'paused' | 'completed' | 'canceled';
export type ResidenceType = 'domestic' | 'overseas';

export type Student = {
  id: ID;
  name: string;
  englishName?: string;
  grade?: number; // 1~12
  phone?: string;
  status: StudentStatus;
  country?: string; // ISO 3166-1 alpha-2(예: KR·US·VN) — 해외 학생 시차 계산·국가 필터(v0.1.11)
  schoolName?: string;
  residenceType?: ResidenceType;
  memo?: string;
  webId?: string; // 로그인 계정(users.nickname) — 가입 시에만
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

// 강사 (staff_role=instructor)
export type Instructor = {
  id: ID;
  name: string;
  subjectName?: string;
};
