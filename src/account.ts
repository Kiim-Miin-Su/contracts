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

export const STAFF_ENGLISH_NAME_MAX_LENGTH = 80;
export const STAFF_ENGLISH_NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]*$/;
export const STAFF_ENGLISH_NAME_MESSAGE = "영문 이름은 영문자, 공백, 마침표, 작은따옴표, 하이픈만 사용할 수 있습니다.";

/** 직원 영문 이름 정본. 가입·내정보·강사 등록의 FE/BE 검증이 함께 사용한다. */
export const normalizeStaffEnglishName = (value: string): string => value.trim().replace(/\s+/g, ' ');

export const staffEnglishNameError = (value: string): string | null => {
  const normalized = normalizeStaffEnglishName(value);
  if (!normalized) return '영문 이름을 입력해 주세요.';
  if (normalized.length > STAFF_ENGLISH_NAME_MAX_LENGTH) return `영문 이름은 ${STAFF_ENGLISH_NAME_MAX_LENGTH}자 이하여야 합니다.`;
  return STAFF_ENGLISH_NAME_PATTERN.test(normalized) ? null : STAFF_ENGLISH_NAME_MESSAGE;
};

// 로그인 계정 (users). web id = nickname/username.
export type Account = {
  id: ID;
  webId: string;
  name: string;
  englishName: string;
  role: AccountRole;
};

// web id 존재 확인 응답
export type WebIdCheckResult = {
  webId: string;
  exists: boolean;
  name?: string;
  role?: AccountRole;
};

// smsVerificationAvailable·emailVerified는 서버가 항상 채운다(ProfileResponseDto가 implements).
export type StaffProfile = {
  id: ID;
  webId: string;
  name: string;
  englishName: string;
  email?: string | null;
  phone?: string | null;
  role: StaffRole;
  status: StaffAccountStatus;
  countryCode?: string | null;
  timeZone?: string | null;
  profileVersion: number;
  smsVerificationAvailable: boolean;
  emailVerified: boolean;
};

/**
 * `GET /users`·`/users/{id}`·`/auth/pending`·승인/반려 응답의 공유 wire.
 *
 * [TBO-79 E5] 종전 선언은 서버가 실제로 내보내는 것의 **진부분집합**이었다. backend `toSafe()`가
 * StaffAccount에서 비밀 6개만 빼고 전부 spread하므로 authVersion·mustChangePassword·approvedBy·
 * approvedAt·lastLoginAt·university·major·birthYear가 계약 밖으로 흘러나가고 있었다.
 * frontend는 그래서 `detail()` 호출부에서 `& { rrnMasked?; university?; major?; birthYear? }`를
 * 손으로 덧붙이고 있었다 — 계약이 부족하다는 걸 코드가 이미 알고 있었던 셈이다.
 *
 * ⚠ 이 타입은 backend `SafeAccount`와 **정확히 일치**해야 한다. user.entity.ts가 컴파일 타임
 * 양방향 단언으로 이를 강제한다(초과·누락 둘 다 빌드 실패). 필드를 늘릴 땐 양쪽을 함께 고칠 것.
 */
export type StaffAccountSummary = Omit<StaffProfile, 'smsVerificationAvailable'> & {
  // smsVerificationAvailable은 `GET /users/me/profile` 전용 파생값이라 계정 행 응답에는 없다.
  emailVerified: boolean;
  /** role/status/credential 변경 시 +1 — 구 토큰 즉시 무효화 기준. 미설정=1. */
  authVersion?: number;
  /** 임시 비밀번호 계정. 변경 완료 전 업무 API가 차단된다. */
  mustChangePassword?: boolean;
  approvedBy?: number | null;
  approvedAt?: ISOInstant | null;
  /** 최신 로그인 성공 시각 summary — 이력 진실원은 auth_events다. */
  lastLoginAt?: ISOInstant | null;
  university?: string | null;
  major?: string | null;
  birthYear?: number | null;
  createdAt: ISOInstant;
  updatedAt: ISOInstant;
  deletedAt?: ISOInstant | null;
  deletedBy?: number | null;
};

/**
 * 계정 상세·승인 대기 목록 — 요약에 마스킹된 주민등록번호를 더한다.
 * 평문·암호문은 어떤 응답에도 없다(복호 실패 시 null = fail-closed).
 */
export type StaffAccountDetail = StaffAccountSummary & {
  rrnMasked: string | null;
};

/**
 * [TBO-79 E5] 승인 대기 계정 = 상세와 같은 모양이다. 종전엔 Pick으로 좁혀 놓았지만 서버는
 * `SafeAccount & { rrnMasked }`를 통째로 돌려주고 있었다(좁힌 선언이 실제 응답을 가렸다).
 */
export type PendingStaffAccount = StaffAccountDetail;

export type StaffLoginResult = {
  /**
   * [TBO-79 E5] non-production에서만 발급되는 bearer 토큰. 운영에서는 HttpOnly 쿠키만 쓰므로
   * 응답 본문에 없다. 계약에 선언되지 않은 채 wire에만 존재하던 자격증명 필드였다.
   */
  accessToken?: string;
  account: Pick<StaffProfile, 'id' | 'name' | 'englishName' | 'role'> & { mustChangePassword: boolean };
};

export type StaffSignupResult = {
  ok: boolean;
  message: string;
  account: Pick<StaffProfile, 'id' | 'webId' | 'name' | 'englishName' | 'role' | 'status'>;
};

export type ProfileChangeFields = Partial<{
  name: string;
  englishName: string;
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
