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
  instructorId: ID;
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
