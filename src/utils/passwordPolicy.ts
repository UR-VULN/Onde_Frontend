export type PasswordPolicyLevel = 'USER' | 'ADMIN';

const WEAK_PASSWORDS = new Set([
  'password',
  'password1',
  'password12',
  'password123',
  '12345678',
  '123456789',
  'qwerty123',
  'qwertyuiop',
  'abcde123',
  'admin123',
  'admin1234',
  'onde1234',
  '11111111',
  'aaaaaaaa',
  'abcd1234',
]);

function countCategories(password: string): number {
  let upper = false;
  let lower = false;
  let digit = false;
  let special = false;

  for (const ch of password) {
    if (ch >= 'A' && ch <= 'Z') upper = true;
    else if (ch >= 'a' && ch <= 'z') lower = true;
    else if (ch >= '0' && ch <= '9') digit = true;
    else special = true;
  }

  return [upper, lower, digit, special].filter(Boolean).length;
}

function hasWhitespace(password: string): boolean {
  return /\s/.test(password);
}

function hasInvalidCharset(password: string): boolean {
  return !/^[\x21-\x7E]+$/.test(password);
}

export function validatePassword(
  password: string,
  level: PasswordPolicyLevel = 'USER'
): string | null {
  if (!password) {
    return '비밀번호는 필수 입력값입니다.';
  }
  if (password.length > 128) {
    return '비밀번호는 128자 이하여야 합니다.';
  }
  if (hasWhitespace(password)) {
    return '비밀번호에 공백을 포함할 수 없습니다.';
  }
  if (hasInvalidCharset(password)) {
    return '비밀번호에 허용되지 않은 문자가 포함되어 있습니다.';
  }
  if (WEAK_PASSWORDS.has(password.toLowerCase())) {
    return '사용할 수 없는 비밀번호입니다. 더 강력한 비밀번호를 설정해 주세요.';
  }

  const categories = countCategories(password);

  if (level === 'ADMIN') {
    if (categories < 4) {
      return '관리자 비밀번호는 영문 대·소문자, 숫자, 특수문자를 모두 포함해야 합니다.';
    }
    if (password.length < 10) {
      return '관리자 비밀번호는 10자 이상이어야 합니다.';
    }
    return null;
  }

  if (categories < 2) {
    return '비밀번호는 영문, 숫자, 특수문자 중 2가지 이상을 조합해야 합니다.';
  }
  if (categories >= 3) {
    if (password.length < 8) {
      return '3가지 이상 조합 시 비밀번호는 8자 이상이어야 합니다.';
    }
  } else if (password.length < 10) {
    return '2가지 조합 시 비밀번호는 10자 이상이어야 합니다.';
  }

  return null;
}

export const PASSWORD_POLICY_HINT =
  '영문·숫자·특수문자 중 3가지 이상 조합 시 8자 이상, 2가지 조합 시 10자 이상';
