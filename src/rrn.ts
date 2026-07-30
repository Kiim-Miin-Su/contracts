/**
 * [TBO-79 I1] 주민등록번호(RRN) 형식·정규화·마스킹의 **단일 구현**.
 *
 * 종전엔 backend `common/rrn-crypto.util.ts`와 frontend `lib/validation.ts`가 같은 규칙을
 * 각자 구현했고 이미 두 군데가 갈라져 있었다.
 *
 *  1. **공백 처리 불일치(실제 도달 가능)** — FE `isValidRrn`은 `value.trim()` 후 정규식을 돌리고
 *     BE `validateRrnFormat`은 원문 그대로 돌렸다. 그래서 `'950101-1234567 '`(뒤 공백)은
 *     FE에서 통과하고 BE에서 400이 된다. 사용자는 "형식 올바름"을 보고 저장에서 거절당한다.
 *  2. **하이픈 제거 불일치** — BE `digitsOf`는 `replace('-', '')`로 **첫 하이픈만** 지웠고
 *     FE는 `replace(/-/g, '')`로 전부 지웠다. 성별 자리(index 6)가 밀리면 `birthYearFromRrn`의
 *     세기 판정이 뒤집혀 **잘못된 birthYear가 영속**된다.
 *
 * 평문은 검증·암호화·파생 계산에만 쓰고, 노출은 `maskRrn` 결과만 허용한다.
 * 암호화(AES-256-GCM)는 서버 전용이므로 여기 두지 않는다 — 이 모듈은 순수 함수만 담는다.
 */

/** 앞 6자리(생년월일) + 성별자리 1~8(내국인 1-4·외국인 5-8) + 6자리. 하이픈 선택. */
export const RRN_REGEX = /^\d{6}-?[1-8]\d{6}$/;

export const RRN_FORMAT_MESSAGE = '주민등록번호 형식이 올바르지 않습니다(예: 950101-1234567).';

/** 하이픈·앞뒤 공백 제거 — 모든 파생 계산이 이 한 함수를 거친다. */
export const rrnDigits = (raw: string): string => raw.trim().replace(/-/g, '');

/**
 * 형식 검증 — 정규식 + 앞 6자리의 MM(01-12)·DD(01-31) 타당성만 본다.
 * **체크섬 검증은 하지 않는다**: 2020-10 이후 발급분은 뒷자리가 임의번호라 검증식이 폐지됐다
 * (구 검증식을 적용하면 합법 신규 번호를 거부하는 오류가 된다).
 */
export function isValidRrnFormat(raw: string): boolean {
  const trimmed = raw.trim();
  if (!RRN_REGEX.test(trimmed)) return false;
  const digits = rrnDigits(trimmed);
  const month = Number(digits.slice(2, 4));
  const day = Number(digits.slice(4, 6));
  return month >= 1 && month <= 12 && day >= 1 && day <= 31;
}

/** canonical 저장 형태 — 하이픈 포함('950101-1234567')으로 통일. 형식 검증 후 호출 전제. */
export function normalizeRrn(raw: string): string {
  const digits = rrnDigits(raw);
  return `${digits.slice(0, 6)}-${digits.slice(6)}`;
}

/** 성별 자리 1,2,5,6 → 19xx / 3,4,7,8 → 20xx (내국인·외국인 동일 세기 규칙). */
export function birthYearFromRrn(raw: string): number {
  const digits = rrnDigits(raw);
  const century = ['1', '2', '5', '6'].includes(digits[6]) ? 1900 : 2000;
  return century + Number(digits.slice(0, 2));
}

/** 노출용 마스킹 — 생년월일 6자리 + 성별 자리만 남긴다: '950101-1******'. */
export function maskRrn(raw: string): string {
  const digits = rrnDigits(raw);
  return `${digits.slice(0, 6)}-${digits[6]}******`;
}
