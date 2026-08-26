/** Phone-number sign-up uses Supabase's native `phone` field on
 *  auth.signUp/signInWithPassword (not a synthesized email) — see
 *  git history for why: an earlier version faked an email address like
 *  `${phone}@noor.local`, but Supabase's Auth server rejected it outright
 *  ("invalid format") because `.local` is an IETF-reserved special-use
 *  domain its email validator refuses on sight. Using the real `phone`
 *  field sidesteps that entirely and is the officially supported way to
 *  do phone+password auth.
 *
 *  No SMS/OTP provider is configured (that costs money and needs a paid
 *  provider set up in the Supabase Dashboard), so the phone number is NOT
 *  verified — anyone can type any number, the same way nothing stopped a
 *  fake email address before. It trades verification for being usable
 *  today at no cost. Real phone verification could be added later via an
 *  SMS provider (e.g. Twilio) wired into Supabase's Phone provider, if
 *  it's worth the ongoing per-message cost. */

/** Supabase's Auth server validates phone numbers against E.164 shape:
 *  digits only (no "+"), first digit non-zero, 2-15 digits total. To keep
 *  the same real-world number from creating two different accounts
 *  depending on how someone types it (e.g. "9812345678" vs
 *  "+977 9812345678"), this strips everything down to digits and, for a
 *  bare 10-digit Nepali mobile number (starts with 9), prepends the 977
 *  country code so it's consistently stored the same way either time. */
export function normalizePhone(raw: string): string {
  let digits = raw.replace(/[^\d]/g, "");
  if (digits.length === 10 && digits.startsWith("9")) {
    digits = `977${digits}`;
  }
  return digits;
}

export function isValidPhone(raw: string): boolean {
  const digits = normalizePhone(raw);
  return /^[1-9][0-9]{1,14}$/.test(digits);
}
