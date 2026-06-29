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
  hourlyRate: number; // 강사 시급(원/시간) — 페이 산정 기준
};

// 로드맵: 코스 묶음(코스·과목·강사 M:N). roadmapCourses 조인으로 연결.
export type Roadmap = {
  id: ID;
  title: string;
  description?: string;
  targetGrade?: number;
  durationWeeks?: number;
  isActive: boolean;
};

export type RoadmapCourse = {
  id: ID;
  roadmapId: ID;
  courseId: ID;
  sortOrder: number;
};
