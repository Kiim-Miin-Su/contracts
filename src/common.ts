// 공용 기본 타입. 본 패키지는 프론트/백 공유 단일 소스이며, 기본적으로 type 사용.
export type ID = number;

// ISO 날짜 문자열 (YYYY-MM-DD 또는 datetime)
export type ISODate = string;

// 영속 엔티티의 감사 필드(생성/수정). API 응답엔 포함되나, mock/입력엔 없을 수 있어 optional.
export type Audited = {
  createdAt?: ISODate;
  updatedAt?: ISODate;
};
