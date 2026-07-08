# Contracts — TBO-05 완료 / TBO-06 계획

작성일: 2026-06-30 (화) · `@kms545487/contracts` 공유 도메인 타입. 상세 종합: `../docs/TODO.md`.

## ✅ TBO-05 완료 (정산 공유 타입 승격) — v0.1.7 게시

- `finance.ts`
  - `PayoutStatus`에 `'rejected'` 추가(반려=세션 회수).
  - `PayoutLine`(세션별 산정 스냅샷), `PayoutMeasure`(읽기 전용 산정 결과) 신설.
  - `InstructorPayout` 비파괴 확장: `computedAmount`/`adjustedAmount`/`adjustReason`/`lines`/`rejectedReason`/`confirmedAt`.
- `session.ts`
  - `ReportApprovalStatus`(`draft|submitted|approved|rejected`) — 정산 적격 게이트.
  - `SessionReport` 확장: `subjectId`/`approvalStatus`/`submittedAt`/`approvedAt`/`approvedBy`/`rejectedReason`.
- 빌드(`tsc -p tsconfig.build.json`) → dist 갱신, **v0.1.7 npm 게시 완료**.

## 🔜 TBO-06 (단일 소스화 + 인증 타입)

- [ ] **소비 전환** — 백엔드 `modules/payouts`·`modules/reports`, 프론트 `lib/api.ts`의 로컬 타입을 contracts 타입으로 교체(현재 구조 동일하나 중복). 단일 소스화.
- [ ] **인증/권한 타입** — 로그인(JWT claims)·역할 권한 매트릭스 관련 공유 타입 추가(TBO-06 auth).
- [ ] **버전** — 타입 변경 시 `npm version patch`(→ 0.1.8) 후 게시, 소비자 재설치/재배포.

> 게시·배포 절차: `../DEPLOY.md` · `../scripts/release.zsh`. 종합 계획: `../docs/TODO.md` TBO-06.
