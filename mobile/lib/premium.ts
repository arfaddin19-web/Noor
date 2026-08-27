import { Registration } from "./registration";

/** Whether this device's registration has Noor Premium. Currently only
 *  ever granted manually by an admin from the dashboard (see
 *  admin/app/registrations/page.tsx) — there's no in-app purchase flow
 *  until the app is actually distributed through the App Store / Play
 *  Store. Unregistered devices are never premium. */
export function isPremium(registration: Registration | null): boolean {
  return !!registration?.is_premium;
}
