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
  // 코호트(코스 수강생) — 학생 차원 색/라벨·필터·개인 스케줄용(enrollment status != drop만)
  studentIds: ID[];
  studentNames: string[];
};

// 자원 피커(좌측 레일·필터)용 경량 읽기모델. GET /schedule/resources 응답.
export type ScheduleResource = {
  type: AvailabilityOwner; // 'student' | 'instructor' | 'room'
  id: ID;
  name: string;
  color?: string;
  sub?: string; // 보조 라벨(과목·학년·정원 등)
};
// 배정(추천→세션 생성) 폼용 코스 옵션 — 스케줄 FK 유니버스와 정렬.
export type ScheduleCourseOption = {
  id: ID;
  name: string;
  instructorId: ID;
  instructorName?: string;
  subjectName: string;
  color?: string;
  durationMinutes: number; // 코스 진행시간(세션에서 파생, 없으면 기본값)
};
export type ScheduleResources = {
  instructors: ScheduleResource[];
  rooms: ScheduleResource[];
  students: ScheduleResource[];
  courses: ScheduleCourseOption[];
};

// ── 캘린더 뷰 프리셋(TBO-12 P1, v0.1.12) ──────────────────────
// 필터·스플릿·국가(시차) 조합을 이름으로 저장 — "미국 학생 주간"처럼 반복 조회를 원클릭화.
// [자산화] localStorage가 아닌 DB 컬렉션(calendar_view_presets): 직원 공용 프리셋 = 사내 자산.
// paneCountry는 표(스플릿)별 override — 'KR'을 저장하면 그 표는 KST 고정(강제 null 대신 코드로 직렬화).
export type CalendarViewPreset = {
  id: ID;
  name: string;
  view: 'month' | 'week' | 'day';
  periodFrom?: ISODate; // 기간 뷰(from~to) — 없으면 주간/월간 기본
  periodTo?: ISODate;
  instructorIds: ID[];
  studentIds: ID[];
  roomIds: ID[];
  subjects: string[];
  statuses: string[]; // StatusFilter('present'|'late'|'canceled'|'makeup')
  groupOnly: boolean;
  q?: string;
  colorBy?: string; // 'subject'|'instructor'|'room'|'student'
  countryCode?: string; // 전역 시차 국가(lib/domain/tz COUNTRIES 코드)
  paneCountryInstructor?: string; // 강사 표 override
  paneCountryStudent?: string; // 학생 표 override
};

export type CreateViewPresetInput = Omit<CalendarViewPreset, 'id'>;
