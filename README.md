# @kms545487/contracts

프론트엔드(Next.js)와 백엔드(NestJS)가 공유하는 **도메인 계약** 단일 소스. 도메인 타입·enum·요청 DTO 형상을 담습니다.

빌드 시 `dist/`에 `.d.ts`(+빈 `.js`)를 emit합니다. 소비측은 `import type`으로만 가져가 런타임 의존이 없습니다.

## 빌드

```bash
npm install
npm run build      # → dist/index.d.ts, dist/index.js
```

## 배포 (npm 레지스트리)

repo가 분리되어 있어 **원격/CI 빌드에서는 `file:../contracts`가 동작하지 않습니다** (옆에 contracts 폴더가 없음).
따라서 이 패키지를 배포하고, 소비측은 **버전**으로 의존해야 합니다.

> ⚠️ `@taco` 스코프: 공개 npm에 올리려면 `@taco` 조직을 소유해야 합니다.
> 소유하지 않으면 (a) 본인 스코프(`@yourorg/contracts`)로 이름을 바꾸거나,
> (b) **GitHub Packages**(조직 스코프) 사용을 권장합니다.

### 1) 배포

```bash
cd contracts
npm version patch               # 0.1.0 → 0.1.1 (변경 시마다)
npm publish --access public     # prepublishOnly가 자동 build
```

#### 2FA 오류(E403) 해결
npm은 publish에 2단계 인증을 요구합니다. 둘 중 하나:

- **일회성(OTP)**: 인증앱 6자리 코드로 즉시 publish
  ```bash
  npm publish --access public --otp=123456
  ```
- **토큰(반복·CI 권장)**: npmjs.com → Access Tokens → **Granular/Automation token**
  (publish 시 2FA bypass 가능)를 발급 → 환경변수로 주입 (이 폴더의 `.npmrc`가 `${NPM_TOKEN}` 사용)
  ```bash
  export NPM_TOKEN=npm_xxxxx
  npm publish --access public
  ```
  CI에서는 `NPM_TOKEN`을 시크릿으로 등록하면 됩니다.

> 비공개로 두려면 `--access public` 대신 `publishConfig.access: "restricted"`(유료 플랜 필요).

### 2) 소비측(frontend·backend) 의존 전환

```jsonc
// package.json
{ "dependencies": { "@kms545487/contracts": "^0.1.0" } }   // file:../contracts → 버전
```

```bash
npm install        # 레지스트리에서 설치 → CI 빌드 통과
```

### 로컬 개발 (미배포 변경분 사용)

배포 전 로컬에서 최신 계약을 쓰려면 `npm link` 사용:

```bash
cd contracts && npm run build && npm link
cd ../frontend && npm link @kms545487/contracts
cd ../backend  && npm link @kms545487/contracts
```

## 구성

```
src/
├─ common.ts      # ID, ISODate, Audited
├─ account.ts     # Account, AccountRole, WebIdCheckResult
├─ people.ts      # Student, Parent, ParentStudent, Instructor
├─ catalog.ts     # Subject, Course(hourlyRate)
├─ enrollment.ts  # Enrollment
├─ session.ts     # ClassSession, Attendance, SessionReport
├─ finance.ts     # Payment, Transaction, Expense(ApprovalStatus), InstructorPayout
├─ counsel.ts     # CounselForm, CounselRound
├─ event.ts       # AcademyEvent, EventType, EventPriority
└─ inputs.ts      # Create*Input (요청 DTO 형상)
```

## 변경 이력 (2026-06-29)

- `ScheduleRow`: `studentIds`/`studentNames`(코호트) 추가.
- `ScheduleResource`·`ScheduleResources`·`ScheduleCourseOption` 신규(자원 피커).
- `CreateClassSessionInput`: `roomId`·`endTime`·`seriesId` 추가(추천→배정).

과거 TBO 진행 메모는 `docs/archive/`에 보존되어 있습니다. 현재 프로젝트 문서 입구는 루트 `docs/README.md`와 `docs/CODEX.md`입니다.
