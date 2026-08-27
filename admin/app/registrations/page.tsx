"use client";

import { useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabase";
import { Registration } from "@/lib/types";

function RegistrationsManager() {
  const [items, setItems] = useState<Registration[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data as Registration[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function togglePremium(item: Registration) {
    setSavingId(item.id);
    await supabase.from("registrations").update({ is_premium: !item.is_premium }).eq("id", item.id);
    setItems((prev) =>
      prev.map((r) => (r.id === item.id ? { ...r, is_premium: !r.is_premium } : r))
    );
    setSavingId(null);
  }

  const filtered = items.filter((r) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      r.full_name.toLowerCase().includes(q) ||
      r.city?.toLowerCase().includes(q) ||
      r.occupation?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Registrations</h1>
      <p className="mb-6 text-gray-500">
        Everyone who registered in the app (name, city, gender, occupation — no password, no
        phone number, self-reported and not verified). Toggle <strong>Premium</strong> to
        manually grant a user Noor Premium — there's no in-app purchase flow yet, so this is
        the only way to grant it until the app is live on the App Store / Play Store.
      </p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, city, or occupation…"
        className="mb-4 w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm"
      />

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">City</th>
              <th className="px-3 py-2">Gender</th>
              <th className="px-3 py-2">Occupation</th>
              <th className="px-3 py-2">Registered</th>
              <th className="px-3 py-2">Premium</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="px-3 py-4 text-gray-400" colSpan={6}>Loading…</td></tr>}
            {!loading && filtered.length === 0 && (
              <tr><td className="px-3 py-4 text-gray-400" colSpan={6}>No registrations found.</td></tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-gray-100">
                <td className="px-3 py-2 font-medium">{r.full_name}</td>
                <td className="px-3 py-2 text-gray-500">{r.city ?? "—"}</td>
                <td className="px-3 py-2 capitalize text-gray-500">{r.gender ?? "—"}</td>
                <td className="px-3 py-2 text-gray-500">{r.occupation ?? "—"}</td>
                <td className="px-3 py-2 text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => togglePremium(r)}
                    disabled={savingId === r.id}
                    className={`rounded-full px-2 py-1 text-xs disabled:opacity-50 ${
                      r.is_premium ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {r.is_premium ? "★ Premium" : "Free"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function RegistrationsPage() {
  return (
    <AuthGate>
      <DashboardShell>
        <RegistrationsManager />
      </DashboardShell>
    </AuthGate>
  );
}
