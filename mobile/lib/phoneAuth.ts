/** Supabase's email/password auth is repurposed here to let people sign up
 *  with just a phone number: no SMS/OTP provider is configured (that costs
 *  money and needs a paid provider set up in the Supabase Dashboard), so the
 *  phone number is NOT verified — anyone can type any number, the same way
 *  nothing stopped a fake email address before. It trades verification for
 *  being usable today at no cost. Real phone verification could be added
 *  later via Supabase's native phone-auth + an SMS provider if it's worth
 *  the ongoing per-message cost. */

export function normalizePhone(raw: string): string {
  return raw.replace(/[^\d]/g, "");
}

export function isValidPhone(raw: string): boolean {
  const digits = normalizePhone(raw);
  return digits.length >= 7 && digits.length <= 15;
}

/** Supabase's signUp/signInWithPassword need an email-shaped string — this
 *  synthesizes one from the phone number so the phone itself is the real
 *  identifier throughout the rest of the app. */
export function phoneToSyntheticEmail(raw: string): string {
  return `${normalizePhone(raw)}@noor.local`;
}
