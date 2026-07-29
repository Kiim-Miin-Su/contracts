import type { AccountRole } from './account';

export type StaffRole = Extract<AccountRole, 'instructor' | 'manager' | 'admin' | 'super_admin'>;

export type RoleCapability =
  | 'staff.login'
  | 'executive.manage'
  | 'admin.area'
  | 'approval.manage'
  | 'signup.decide'
  | 'finance.access'
  | 'payout.readiness'
  | 'calendar.manage'
  | 'calendar.request-own'
  | 'instructor.self'
  | 'counsel.manage'
  | 'student.hard-delete'
  | 'security.events.read';

export const ROLE_GROUPS = {
  executive: ['super_admin'],
  operations: ['super_admin', 'manager', 'admin'],
  staff: ['instructor', 'manager', 'admin', 'super_admin'],
} as const satisfies Record<string, readonly StaffRole[]>;

export const CAPABILITY_ROLES = {
  'staff.login': ROLE_GROUPS.staff,
  'executive.manage': ROLE_GROUPS.executive,
  'admin.area': ROLE_GROUPS.operations,
  'approval.manage': ROLE_GROUPS.operations,
  'signup.decide': ROLE_GROUPS.operations,
  'finance.access': ROLE_GROUPS.executive,
  'payout.readiness': ROLE_GROUPS.operations,
  'calendar.manage': ROLE_GROUPS.operations,
  'calendar.request-own': ROLE_GROUPS.staff,
  'instructor.self': ['instructor'],
  'counsel.manage': ROLE_GROUPS.operations,
  'student.hard-delete': ['super_admin', 'admin'],
  'security.events.read': ['super_admin', 'admin'],
} as const satisfies Record<RoleCapability, readonly StaffRole[]>;

export const roleHasCapability = (role: string, capability: RoleCapability): boolean =>
  (CAPABILITY_ROLES[capability] as readonly string[]).includes(role);
