// 스케줄 엔진(Lantiv형) 자원: 강의실 · 가용/불가 시간. (상세: docs/scheduling.md)
import type { ID, ISODate } from './common';
import type { ClassSession } from './session';

// 강의실(Room/Location). 일간 뷰 컬럼 · 이중예약/capacity 충돌 기준.
export type Room = {
  id: ID;
  name: string;
  buildingId?: ID; // 상위 위치(건물) — 계층(선택)
  capacity?: number; // 최대 인원(capacity 충돌)
  color?: string; // 뷰 색
  isActive: boolean;
};

export type AvailabilityOwner = 'student' | 'instructor' | 'room';
// available = 가용(슬롯 추천 화이트리스트), unavailable = 불가시간(Block, 고정 회색/검정)
export type AvailabilityKind = 'available' | 'unavailable';

// 가용/불가 시간 블록 — 학생·강사·강의실 공통. 주간 반복 + (선택)기간 한정.
export type AvailabilityBlock = {
  id: ID;
  ownerType: AvailabilityOwner;
  ownerId: ID;
  kind: AvailabilityKind;
  weekday: number; // 0(일)~6(토)
  startTime: string; // 'HH:mm'
  endTime: string; // 'HH:mm'
  effectiveFrom?: ISODate;
  effectiveTo?: ISODate;
};

// 시간 구간(엔진 공통) — 충돌·슬롯 추천에서 사용
export type TimeRange = {
  date: ISODate;
  start: string; // 'HH:mm'
  end: string; // 'HH:mm'
};

// 충돌(엔진·API 공통). 빈 배열이면 충돌 없음.
export type ConflictType = 'double_book' | 'unavailable' | 'room_capacity';
export type ConflictResource = 'instructor' | 'room' | 'student';
export type Conflict = {
  type: ConflictType;
  resource?: ConflictResource;
  resourceId?: ID;
  sessionId?: ID; // 충돌 상대 세션(있으면)
  detail?: string;
};

// 주간 표/캘린더용 enriched 읽기모델(세션 + 라벨·색). 백엔드 GET /schedule 응답.
export type ScheduleRow = ClassSession & {
  weekday: number; // 0(일)~6(토)
  courseName: string;
  subjectName: string;
  instructorName: string;
  roomName?: string;
  color?: string; // 과목 색(없으면 프론트 해시 색)
};
