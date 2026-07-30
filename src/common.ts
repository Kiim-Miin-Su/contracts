// 공용 기본 타입. 본 패키지는 프론트/백 공유 단일 소스이며, 기본적으로 type 사용.
export type ID = number;

// ISO 달력 날짜 문자열 (YYYY-MM-DD)
export type ISODate = string;

// 시간대가 포함된 ISO 8601 instant (예: 2026-07-28T09:30:00+09:00 또는 ...Z)
export type ISOInstant = string;

// 영속 엔티티의 감사 필드(생성/수정). API 응답엔 포함되나, mock/입력엔 없을 수 있어 optional.
export type Audited = {
  createdAt?: ISODate;
  updatedAt?: ISODate;
};

/**
 * [TBO-79 I2] soft-delete 명령의 공용 응답.
 *
 * 12개 backend 서비스와 9개 frontend 호출부가 `{ id: number; deleted: true }`를 각자 인라인으로
 * 선언하고 있었다. 모양이 같아 지금은 문제가 없지만, 사본이 21개면 한 곳만 `deleted: boolean`으로
 * 바뀌어도 아무도 모른다(실제로 schedule-requests·availability는 이미 `boolean`으로 갈라져 있다).
 *
 * `deleted: true`는 "이 응답이 왔다 = 삭제됐다"는 뜻이다 — 실패는 예외로 전달되지 응답 본문의
 * `false`로 오지 않는다. 그래서 리터럴 true가 정확하다.
 */
export type DeletedResult = {
  id: ID;
  deleted: true;
};

/** 본문 없는 성공 응답 — `{ ok: true }`. 실패는 예외(4xx/5xx)로 전달된다. */
export type OkResult = {
  ok: boolean;
};
