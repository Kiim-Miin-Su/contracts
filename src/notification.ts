import type { ID, ISODate } from './common';

// 인앱 알림 — "누구에게 어떤 이벤트가 대기 중인지"를 표현. 프론트 벨/배지의 단일 소스.
// 현재는 파생(계산)으로 표시하지만, TBO-08에서 DB 영속화(누가 얼마나 처리했는지 자산화).
export type NotificationKind =
  | 'report_pending'     // 강사: 작성해야 할 수업 보고서
  | 'makeup_needed'      // 강사: 취소·미진행으로 보강 필요(월 시수 부족 과목)
  | 'payout_pending'     // 관리자: 정산(산정) 대기
  | 'payout_confirmed'   // 관리자: 지급 대기(확정됨)
  | 'report_approval'    // 관리자: 보고서 승인 대기
  | 'expense_approval'   // 관리자: 지출 승인 대기
  | 'counsel_followup'   // 관리자: 다음 상담일 미정
  | 'payment_due';       // 관리자: 미수(수납) 대기

// 알림이 가리키는 참조 엔티티 종류(클릭 시 해당 화면으로 이동).
export type NotificationRefType =
  | 'session' | 'report' | 'payout' | 'expense' | 'counsel' | 'payment';

export type Notification = {
  id: ID;
  recipientId: ID;              // 수신 직원(user) id
  kind: NotificationKind;
  title: string;
  body?: string;
  refType?: NotificationRefType;
  refId?: ID;                   // 참조 엔티티 id
  read: boolean;
  createdAt: ISODate;
  readAt?: ISODate;
};
