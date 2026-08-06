import type { ID } from './common';

export type Subject = {
  id: ID;
  code: string; // english, math …
  name: string; // 영어, 수학 …
};

export type Course = {
  id: ID;
  name: string;
  subjectId: ID;
  /** null = 담당 강사 배정 전. 가짜 강사 ID를 사용하지 않는다. */
  instructorId: ID | null;
  price: number; // 정가(원)
  hourlyRate: number; // 유효 시급 = hourlyRateOverride ?? 강사 defaultHourlyRate
  hourlyRateOverride?: number | null; // 수업별 관리자 예외값. null이면 강사 기본 페이 사용
  isKinder: boolean;
  color?: string; // 캘린더 색상 라벨(개설 시 선택) → 세션 색 기본값
};

// 로드맵: 코스 묶음(코스·과목·강사 M:N). roadmapCourses 조인으로 연결.
export type Roadmap = {
  id: ID;
  title: string;
  // [TBO-79 E2] 서버는 undefined가 아니라 **null**을 쓴다(roadmaps.service의 `?? null`).
  //  종전 optional 선언은 `as unknown as` 이중 캐스팅으로 침묵당한 거짓말이었고, FE는
  //  lib/domain/roadmaps.ts에서 `number | null | undefined`로 로컬 우회 중이었다.
  description?: string | null;
  targetGrade?: number | null;
  durationWeeks?: number | null;
  isActive: boolean;
};

export type RoadmapCourse = {
  id: ID;
  roadmapId: ID;
  courseId: ID;
  sortOrder: number;
};

/**
 * [TBO-79 F1] 국가·시간대 참조 데이터 — `GET /catalog/countries`의 공유 wire.
 *
 * 종전엔 backend `catalog/country.entity.ts`와 frontend `lib/api/auth-account.ts`가 각자
 * 선언했고 이미 드리프트가 있었다(`flag`가 BE 필수 / FE optional). CRUD 표면 게이트는
 * `contract: ['Country']`를 초록으로 통과시켰는데, 공유 타입은 **존재하지 않았고**
 * `paneCountryInstructor`에 부분 문자열이 걸린 것뿐이었다(게이트 방법론 결손 F1).
 */
export type Country = {
  id: ID;
  /** ISO 3166-1 alpha-2 또는 권역 분할 코드(US-W) */
  code: string;
  nameKo: string;
  nameEn: string;
  /** 대표 IANA tz */
  timeZone: string;
  flag: string | null;
  sortOrder: number;
};
