# @kms545487/contracts

TACO ERP의 frontend와 backend가 함께 소비하는 도메인 계약 단일 소스입니다. 도메인 타입, enum,
command input, projection, capability 정책과 FE/BE가 공유해야 하는 순수 규칙만 포함합니다.

- 현재 버전: `0.2.59`
- 런타임 기준: Node 22.22.3
- 산출물: `dist/index.d.ts`, `dist/index.js`
- 소비자: `backend`, `frontend`

## 로컬 검증

```bash
nvm use
npm ci
npm run build
npm run typecheck
```

도메인 변경 뒤에는 계약만 통과한 것으로 완료하지 않습니다. workspace release가 로컬 `dist`를 두
소비자의 `node_modules`에 stage한 뒤 backend/frontend typecheck·test·build를 같은 계약으로 검사합니다.

```bash
cd ..
PREFLIGHT_ONLY=1 ./scripts/release.zsh
```

## 버전과 배포 규칙

1. exported d.ts 표면이 바뀌면 `package.json` 버전을 올립니다.
2. `npm publish` 전에 backend/frontend가 새 버전으로 빌드되는지 stage gate를 통과합니다.
3. publish 뒤 실제 npm tarball을 소비자 lockfile에 반영하고 전체 gate를 다시 실행합니다.
4. `dist`가 npm의 같은 버전과 다른데 버전을 올리지 않으면 release가 중단됩니다.
5. 수동 `npm link`는 lockfile과 실제 배포 계약을 가릴 수 있으므로 release 증거로 사용하지 않습니다.

publish와 소비자 lock 갱신은 루트 `./scripts/release.zsh`가 담당합니다. registry token과 OTP는 환경변수나
보안 저장소에서만 주입하며 문서·Git·로그에 기록하지 않습니다.

## 소스 구성

```text
src/
├─ account.ts / role-policy.ts        # 계정·역할·capability
├─ people.ts / staff-attendance.ts    # 학생·보호자·강사·직원 근태
├─ catalog.ts / enrollment.ts         # 과목·코스·수강
├─ schedule.ts / session.ts           # 캘린더·수업·출결·리포트
├─ counsel.ts / event.ts              # 상담·학원 이벤트
├─ finance.ts / workload.ts           # 수납·지출·정산·업무량
├─ notification.ts / projections.ts   # 알림·읽기 투영
├─ rrn.ts                              # FE/BE 공용 RRN 정규화·검증
├─ inputs.ts                           # command input 계약
└─ index.ts                            # 공개 barrel
```

DB column과 계약이 같아야 한다는 이유만으로 DB 전용 필드를 브라우저 계약에 노출하지 않습니다.
영속 shape는 `docs/erd.dbml`과 migration이, wire shape는 contracts와 OpenAPI가 각각 소유하며
backend parity gate가 양쪽의 필요한 접점을 검증합니다.

전체 운영 계약과 릴리스 기준은 [docs/README.md](../docs/README.md)에서 시작합니다.
