import type { ID, ISODate, Audited } from './common';

export type EventType = 'notice' | 'exam' | 'holiday' | 'closure' | 'event';
// high = 학생/학부모 기본 캘린더에도 노출되는 '중요' 이벤트
export type EventPriority = 'low' | 'normal' | 'high';

// 학원 이벤트/공지 (admin 발행). 캘린더에 표시.
export type AcademyEvent = {
  id: ID;
  title: string;
  type: EventType;
  priority: EventPriority;
  startDate: ISODate;
  endDate: ISODate; // 단일일이면 startDate === endDate
  allDay?: boolean;
  memo?: string;
} & Audited;
