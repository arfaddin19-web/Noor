"use client";

import { FormEvent, useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabase";
import { DonationInfo } from "@/lib/types";

const EMPTY: DonationInfo = {
  message: "",
  bank_name: "",
  account_name: "",
  account_number: "",
  esewa_id: "",
  khalti_id: "",
};

const FIELDS: { key: keyof DonationInfo; label: string; placeholder: string }[] = [
  { key: "bank_name", label: "Bank name", placeholder: "e.g. Nepal Bank Ltd." },
  { key: "account_name", label: "Account holder name", placeholder: "e.g. Noor Foundation" },
  { key: "account_number", label: "Account number", placeholder: "e.g. 0123456789012" },
  { key: "esewa_id", label: "eSewa ID", placeholder: "e.g. 98XXXXXXXX" },
  { key: "khalti_id", label: "Khalti ID", placeholder: "e.g. 98XXXXXXXX" },
];

function DonationManager() {
  const [form, setForm] = useState<DonationInfo>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "donation_info")
        .maybeSingle();
      if (data?.value) setForm({ ...EMPTY, ...(data.value as Partial<DonationInfo>) });
      setLoading(false);
    })();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await supabase
      .from("app_settings")
      .upsert({ key: "donation_info", value: form, updated_at: new Date().toISOString() });
    setSaving(false);
    setSaved(true);
  }

  if (loading) {
    return <p className="text-gray-400">Loading…</p>;
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Donation</h1>
      <p className="mb-6 text-gray-500">
        This information is shown on the app&apos;s Donate screen. Leave any field blank
        to hide that row — the message is shown even with everything else empty.
      </p>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl space-y-4 rounded-xl border border-gray-200 bg-white p-6"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Message</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Your support helps keep prayer times, masjid listings, and the Qur'an accessible to everyone, free of charge."
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="mb-1 block text-xs font-medium text-gray-500">{f.label}</label>
            <input
              value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        ))}

        <div className="flex items-center gap-3">
          <button
            disabled={saving}
            className="rounded-md bg-noor-600 px-4 py-2 text-sm font-medium text-white hover:bg-noor-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          {saved && <span className="text-xs text-green-600">Saved.</span>}
        </div>
      </form>
    </div>
  );
}

export default function DonationPage() {
  return (
    <AuthGate>
      <DashboardShell>
        <DonationManager />
      </DashboardShell>
    </AuthGate>
  );
}
