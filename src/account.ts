import type { ID, ISOInstant } from './common';

export type AccountRole =
  | 'student'
  | 'parent'
  | 'instructor'
  | 'manager'
  | 'admin'
  | 'super_admin';

export type StaffRole = Extract<AccountRole, 'instructor' | 'manager' | 'admin' | 'super_admin'>;
export type StaffAccountStatus = 'pending' | 'active' | 'rejected';

// 로그인 계정 (users). web id = nickname/username.
export type Account = {
  id: ID;
  webId: string;
  name: string;
  role: AccountRole;
};

// web id 존재 확인 응답
export type WebIdCheckResult = {
  webId: string;
  exists: boolean;
  name?: string;
  role?: AccountRole;
};

export type StaffProfile = {
  id: ID;
  webId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: StaffRole;
  status: StaffAccountStatus;
  countryCode?: string | null;
  timeZone?: string | null;
  profileVersion: number;
  smsVerificationAvailable?: boolean;
  emailVerified?: boolean;
};

export type StaffAccountSummary = StaffProfile & {
  createdAt?: ISOInstant;
  updatedAt?: ISOInstant;
  deletedAt?: ISOInstant | null;
};

export type PendingStaffAccount = Pick<
  StaffAccountSummary,
  'id' | 'webId' | 'name' | 'role' | 'status' | 'emailVerified'
> & {
  // [TBO-79 E1] 서버는 email 미기재 가입 행을 그대로 돌려준다(users.email은 nullable이고
  //  auth.controller가 `as string`으로 캐스팅하고 있었다). 필수 string 선언은 거짓말이었다.
  email?: string | null;
  createdAt: ISOInstant;
  phone?: string | null;
  university?: string | null;
  major?: string | null;
  birthYear?: number | null;
};

export type StaffLoginResult = {
  account: Pick<StaffProfile, 'id' | 'name' | 'role'> & { mustChangePassword: boolean };
};

export type StaffSignupResult = {
  ok: boolean;
  message: string;
  account: Pick<StaffProfile, 'id' | 'webId' | 'name' | 'role' | 'status'>;
};

export type ProfileChangeFields = Partial<{
  name: string;
  webId: string;
  email: string;
  phone: string | null;
  countryCode: string | null;
  timeZone: string | null;
}>;

export type ProfileChangeRequestStatus = 'pending' | 'approved' | 'rejected';

export type ProfileChangeRequest = {
  id: ID;
  requesterId: ID;
  baseProfileVersion: number;
  beforeValues: ProfileChangeFields;
  requestedChanges: ProfileChangeFields;
  reason: string;
  status: ProfileChangeRequestStatus;
  decidedBy?: ID | null;
  decidedAt?: ISOInstant | null;
  rejectionReason?: string | null;
  appliedProfileVersion?: number | null;
  createdAt: ISOInstant;
  updatedAt: ISOInstant;
};

export type AuthEventType =
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'recover_id_requested'
  | 'recover_id_completed'
  | 'password_reset_requested'
  | 'password_reset_completed'
  | 'refresh_reuse_blocked'
  | 'csrf_origin_blocked';

/** 관리자 조회용 최소 projection. hash·request id·user-agent는 응답에 포함하지 않는다. */
export type AuthEventRecord = {
  id: ID;
  eventType: AuthEventType;
  userId?: ID | null;
  success: boolean;
  failureCode?: string | null;
  at: ISOInstant;
};

export type AuthEventQuery = {
  userId?: ID;
  eventType?: AuthEventType;
  success?: boolean;
  from?: ISOInstant;
  to?: ISOInstant;
  limit?: number;
};
