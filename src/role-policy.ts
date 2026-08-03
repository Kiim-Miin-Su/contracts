import type { StaffRole } from './account';
export type { StaffRole } from './account';

export type RoleCapability =
  | 'staff.login'
  | 'executive.manage'
  | 'access.manage'
  | 'admin.area'
  | 'approval.manage'
  | 'signup.decide'
  | 'finance.access'
  | 'payout.readiness'
  | 'calendar.manage'
  | 'calendar.request-own'
  | 'attendance.manage'
  | 'instructor.self'
  | 'counsel.manage'
  | 'student.hard-delete'
  | 'security.events.read';

export type CapabilityOverrideEffect = 'allow' | 'deny';
export type CapabilityOverrideMode = CapabilityOverrideEffect | 'default';
export type CapabilityCategory = 'account' | 'calendar' | 'attendance' | 'approval' | 'student' | 'finance' | 'security';

export type CapabilityDefinition = {
  capability: RoleCapability;
  category: CapabilityCategory;
  label: string;
  description: string;
  configurable: boolean;
  executiveOnly: boolean;
};

export type UserCapabilityPermission = CapabilityDefinition & {
  roleDefault: boolean;
  override: CapabilityOverrideEffect | null;
  effective: boolean;
  manageable: boolean;
};

export type UserPermissionsProjection = {
  userId: number;
  role: StaffRole;
  permissions: UserCapabilityPermission[];
};

export type SetUserCapabilityInput = {
  mode: CapabilityOverrideMode;
  reason: string;
};

export const ROLE_GROUPS = {
  executive: ['super_admin'],
  operations: ['super_admin', 'manager', 'admin'],
  staff: ['instructor', 'manager', 'admin', 'super_admin'],
} as const satisfies Record<string, readonly StaffRole[]>;

export const CAPABILITY_ROLES = {
  'staff.login': ROLE_GROUPS.staff,
  'executive.manage': ROLE_GROUPS.executive,
  'access.manage': ['super_admin', 'admin'],
  'admin.area': ROLE_GROUPS.operations,
  'approval.manage': ROLE_GROUPS.operations,
  'signup.decide': ROLE_GROUPS.operations,
  'finance.access': ROLE_GROUPS.executive,
  'payout.readiness': ROLE_GROUPS.operations,
  'calendar.manage': ROLE_GROUPS.operations,
  'calendar.request-own': ROLE_GROUPS.staff,
  'attendance.manage': ROLE_GROUPS.executive,
  'instructor.self': ['instructor'],
  'counsel.manage': ROLE_GROUPS.operations,
  'student.hard-delete': ['super_admin', 'admin'],
  'security.events.read': ['super_admin', 'admin'],
} as const satisfies Record<RoleCapability, readonly StaffRole[]>;

export const CAPABILITY_CATALOG = [
  { capability: 'staff.login', category: 'account', label: '백오피스 로그인', description: '직원용 서비스에 로그인합니다.', configurable: false, executiveOnly: false },
  { capability: 'executive.manage', category: 'account', label: '대표자 관리', description: '대표 전용 계정·조직 작업을 수행합니다.', configurable: true, executiveOnly: true },
  { capability: 'access.manage', category: 'security', label: '권한 설정', description: '사용자별 업무 권한을 설정합니다.', configurable: true, executiveOnly: true },
  { capability: 'admin.area', category: 'account', label: '관리 업무 조회', description: '관리자용 원부와 운영 화면을 조회합니다.', configurable: true, executiveOnly: false },
  { capability: 'approval.manage', category: 'approval', label: '승인 처리', description: '수업 변경과 업무 요청을 승인하거나 반려합니다.', configurable: true, executiveOnly: false },
  { capability: 'signup.decide', category: 'account', label: '가입 승인', description: '직원 가입 신청을 승인하거나 반려합니다.', configurable: true, executiveOnly: false },
  { capability: 'finance.access', category: 'finance', label: '재무 접근', description: '금액·수납·지출·정산 정보를 조회하고 처리합니다.', configurable: true, executiveOnly: true },
  { capability: 'payout.readiness', category: 'finance', label: '정산 준비 조회', description: '시수와 정산 준비 상태를 확인합니다.', configurable: true, executiveOnly: false },
  { capability: 'calendar.manage', category: 'calendar', label: '캘린더 관리', description: '수업과 일정을 생성·변경·삭제합니다.', configurable: true, executiveOnly: false },
  { capability: 'calendar.request-own', category: 'calendar', label: '본인 일정 요청', description: '본인 일정의 변경 승인을 요청합니다.', configurable: true, executiveOnly: false },
  { capability: 'attendance.manage', category: 'attendance', label: '출결 변경', description: '학생·강사·직원의 출결을 생성·수정·초기화합니다.', configurable: true, executiveOnly: false },
  { capability: 'instructor.self', category: 'account', label: '강사 본인 범위', description: '담당 수업과 학생을 본인 범위로 조회합니다.', configurable: false, executiveOnly: false },
  { capability: 'counsel.manage', category: 'student', label: '상담 관리', description: '상담 원부와 회차를 조회하고 변경합니다.', configurable: true, executiveOnly: false },
  { capability: 'student.hard-delete', category: 'student', label: '학생 원부 삭제', description: '학생 원부를 위험 작업으로 삭제합니다.', configurable: true, executiveOnly: true },
  { capability: 'security.events.read', category: 'security', label: '보안 이력 조회', description: '로그인과 인증 보안 이력을 조회합니다.', configurable: true, executiveOnly: true },
] as const satisfies readonly CapabilityDefinition[];

export const ROLE_CAPABILITIES = CAPABILITY_CATALOG.map((definition) => definition.capability);

export const isRoleCapability = (value: string): value is RoleCapability =>
  (ROLE_CAPABILITIES as readonly string[]).includes(value);

export const roleHasCapability = (role: string, capability: RoleCapability): boolean =>
  (CAPABILITY_ROLES[capability] as readonly string[]).includes(role);
