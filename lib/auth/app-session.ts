export const sessionCookieName = 'padaeng_session';

export function expectedSessionValue() {
  return process.env.PADAENG_ACCESS_TOKEN || null;
}

export function isValidSessionValue(value: string | undefined) {
  const expected = expectedSessionValue();
  return Boolean(expected && value && value === expected);
}
