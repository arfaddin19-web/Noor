/** Phone number formatting/validation, shared by lib/registration.ts.
 *
 *  This used to back a real Supabase Auth sign-up/sign-in flow (first a
 *  synthesized email, then Supabase's native phone provider) — both turned
 *  into repeated friction (the synthesized email was rejected outright by
 *  Supabase's validator, then the native Phone provider needed a dashboard
 *  toggle that didn't get switched on). Registration is now just a plain
 *  `registrations` table row with no password and no Supabase Auth session
 *  at all (see lib/registration.ts) — this file only normalizes/validates
 *  the phone number so the same real-world number doesn't create two
 *  different registration rows depending on how it's typed. */

const E164_SHAPE = /^[1-9][0-9]{1,14}$/;

/** Strips everything down to digits and, for a bare 10-digit Nepali mobile
 *  number (starts with 9), prepends the 977 country code — so "9812345678"
 *  and "+977 9812345678" both normalize to the same stored value. */
export function normalizePhone(raw: string): string {
  let digits = raw.replace(/[^\d]/g, "");
  if (digits.length === 10 && digits.startsWith("9")) {
    digits = `977${digits}`;
  }
  return digits;
}

export function isValidPhone(raw: string): boolean {
  return E164_SHAPE.test(normalizePhone(raw));
}
