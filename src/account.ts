import type { ID } from './common';

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
