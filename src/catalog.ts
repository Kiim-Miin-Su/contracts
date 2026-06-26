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
};
