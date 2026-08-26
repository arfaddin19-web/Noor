const ARABIC_INDIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/** Converts a non-negative integer to Arabic-Indic numerals (e.g. 12 -> "١٢"),
 *  as used for ayah numbers in a printed Mushaf. */
export function toArabicIndicDigits(n: number): string {
  return String(n)
    .split("")
    .map((c) => (c >= "0" && c <= "9" ? ARABIC_INDIC_DIGITS[Number(c)] : c))
    .join("");
}
