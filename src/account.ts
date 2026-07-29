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
