import type { ID, ISODate, Audited } from './common';

export type EventType = 'notice' | 'exam' | 'holiday' | 'closure' | 'event';

// 학원 이벤트/공지 (admin 발행). 캘린더에 표시.
export type AcademyEvent = {
  id: ID;
  title: string;
  type: EventType;
  startDate: ISODate;
  endDate: ISODate; // 단일일이면 startDate === endDate
  allDay?: boolean;
  memo?: string;
} & Audited;
