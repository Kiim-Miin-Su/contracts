# @taco/contracts

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
npm login                       # (GitHub Packages면 .npmrc에 레지스트리/토큰 설정)
npm version patch               # 0.1.0 → 0.1.1 (변경 시마다)
npm publish                     # prepublishOnly가 자동 build
```

### 2) 소비측(frontend·backend) 의존 전환

```jsonc
// package.json
{ "dependencies": { "@taco/contracts": "^0.1.0" } }   // file:../contracts → 버전
```

```bash
npm install        # 레지스트리에서 설치 → CI 빌드 통과
```

### 로컬 개발 (미배포 변경분 사용)

배포 전 로컬에서 최신 계약을 쓰려면 `npm link` 사용:

```bash
cd contracts && npm run build && npm link
cd ../frontend && npm link @taco/contracts
cd ../backend  && npm link @taco/contracts
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
