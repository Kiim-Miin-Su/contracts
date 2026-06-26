# @taco/contracts

프론트엔드(Next.js)와 백엔드(NestJS)가 공유하는 **도메인 계약** 단일 소스. 도메인 타입·enum·요청 DTO 형상을 담습니다.

소스 전용 패키지입니다 — `types`/`main`이 `src/index.ts`를 직접 가리키므로 별도 빌드가 없습니다. 소비측은 모두 `import type`으로 가져가 런타임 의존이 없습니다.

## 사용 (로컬, repo 분리 전)

각 repo의 package.json:

```json
{ "dependencies": { "@taco/contracts": "file:../contracts" } }
```

```ts
import type { Student, CreateStudentInput, CounselStatus } from '@taco/contracts';
```

repo를 완전히 분리하면 이 패키지를 npm(또는 git URL)로 배포하고 `file:` 대신 버전으로 의존하면 됩니다.

## 구성

```
src/
├─ common.ts      # ID, ISODate, Audited
├─ people.ts      # Student, Parent, ParentStudent, Instructor
├─ catalog.ts     # Subject, Course
├─ enrollment.ts  # Enrollment
├─ session.ts     # ClassSession, Attendance, SessionReport
├─ finance.ts     # Payment, Transaction, Expense, InstructorPayout
├─ counsel.ts     # CounselForm, CounselRound
└─ inputs.ts      # Create*Input (요청 DTO 형상)
```
