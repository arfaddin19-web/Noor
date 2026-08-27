export const metadata = {
  title: "Privacy Policy — Noor",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-gray-800">
      <h1 className="mb-1 text-3xl font-bold text-noor-700">Noor — Privacy Policy</h1>
      <p className="mb-8 text-sm text-gray-400">Last updated: {new Date().toISOString().slice(0, 10)}</p>

      <p className="mb-6">
        Noor is a companion app for daily Islamic practice — prayer times, Qibla direction,
        Qur'an, hadith collections, and masjid/halal food directories — built by AR Technohub.
        This page explains what information the app collects and how it's used, in plain
        language.
      </p>

      <h2 className="mb-2 mt-8 text-lg font-semibold text-gray-900">What we collect</h2>
      <ul className="mb-6 list-disc space-y-2 pl-5">
        <li>
          <strong>Registration details (optional):</strong> if you choose to register in the
          app, we store your name, city, gender, and occupation. There's no password and no
          phone number — registration is just a one-time form, stored to personalize your
          greeting and (self-reported, not verified) for aggregate community statistics we use
          to understand who the app is reaching.
        </li>
        <li>
          <strong>Location:</strong> used on-device to sort nearby masjids/halal food places by
          distance and to calculate Qibla direction. Your location is not uploaded to or stored
          on our servers.
        </li>
        <li>
          <strong>Ask AI questions:</strong> if you use the "Ask AI" feature, your question and
          the AI's answer are logged so we can review answer quality and flag anything
          inaccurate. Questions are not linked to your registration details.
        </li>
        <li>
          <strong>Local preferences:</strong> things like your saved home masjid, dark/light
          theme, bookmarks, and prayer-tracking checklist are stored only on your device, never
          uploaded anywhere.
        </li>
      </ul>

      <h2 className="mb-2 mt-8 text-lg font-semibold text-gray-900">What we don't do</h2>
      <ul className="mb-6 list-disc space-y-2 pl-5">
        <li>We don't sell or share your data with advertisers or third parties.</li>
        <li>We don't run ads or third-party analytics/tracking SDKs in the app.</li>
        <li>We don't require an account, login, or password to use the app.</li>
      </ul>

      <h2 className="mb-2 mt-8 text-lg font-semibold text-gray-900">Notifications</h2>
      <p className="mb-6">
        Prayer time and daily hadith reminders are scheduled entirely on your device — they
        don't involve a push notification server and aren't tracked by us.
      </p>

      <h2 className="mb-2 mt-8 text-lg font-semibold text-gray-900">Noor Premium</h2>
      <p className="mb-6">
        Noor Premium is a planned optional paid tier for extra features. No payment information
        is collected by us directly — purchases, once available, go through the Apple App Store
        or Google Play billing systems, which handle payment details under their own privacy
        policies.
      </p>

      <h2 className="mb-2 mt-8 text-lg font-semibold text-gray-900">Data deletion</h2>
      <p className="mb-6">
        Since there's no login, you can clear your local app data (registration, preferences)
        any time from Account → "Not you? Switch profile", or by uninstalling the app. To
        request deletion of a registration record from our servers, contact us using the details
        below.
      </p>

      <h2 className="mb-2 mt-8 text-lg font-semibold text-gray-900">Contact</h2>
      <p className="mb-6">
        Questions about this policy or your data? Contact AR Technohub at{" "}
        <span className="font-medium text-gray-500">[add your support email here]</span>.
      </p>
    </main>
  );
}
