import type { ID, ISOInstant } from './common';

export type AccountRole =
  | 'student'
  | 'parent'
  | 'instructor'
  | 'manager'
  | 'admin'
  | 'super_admin';

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
