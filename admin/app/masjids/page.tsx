"use client";

import { FormEvent, useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabase";
import { Masjid } from "@/lib/types";

const emptyForm = {
  name: "", address: "", latitude: "", longitude: "", phone: "", description: "",
};

const JAMAT_FIELDS: { key: keyof Masjid; label: string }[] = [
  { key: "fajr_jamat", label: "Fajr" },
  { key: "dhuhr_jamat", label: "Dhuhr" },
  { key: "asr_jamat", label: "Asr" },
  { key: "maghrib_jamat", label: "Maghrib" },
  { key: "isha_jamat", label: "Isha" },
  { key: "jumma_jamat", label: "Jumu'ah" },
];

function MasjidsManager() {
  const [items, setItems] = useState<Masjid[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("masjids").select("*").order("created_at", { ascending: false });
    setItems((data as Masjid[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await supabase.from("masjids").insert({
      name: form.name,
      address: form.address || null,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      phone: form.phone || null,
      description: form.description || null,
      is_approved: true,
    });
    setForm(emptyForm);
    setSubmitting(false);
    load();
  }

  function updateJamat(item: Masjid, field: keyof Masjid, value: string) {
    setItems((prev) =>
      prev.map((m) => (m.id === item.id ? { ...m, [field]: value } : m))
    );
  }

  async function saveJamat(item: Masjid) {
    setSavingId(item.id);
    await supabase
      .from("masjids")
      .update({
        fajr_jamat: item.fajr_jamat || null,
        dhuhr_jamat: item.dhuhr_jamat || null,
        asr_jamat: item.asr_jamat || null,
        maghrib_jamat: item.maghrib_jamat || null,
        isha_jamat: item.isha_jamat || null,
        jumma_jamat: item.jumma_jamat || null,
      })
      .eq("id", item.id);
    setSavingId(null);
  }

  async function toggleApproved(item: Masjid) {
    await supabase.from("masjids").update({ is_approved: !item.is_approved }).eq("id", item.id);
    load();
  }

  async function remove(item: Masjid) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    await supabase.from("masjids").delete().eq("id", item.id);
    load();
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Masjids</h1>
      <p className="mb-6 text-gray-500">
        Manage masjid listings shown in "Masjids near me". The prayer times shown
        app-wide are the national <em>Adhan</em> times — each masjid can additionally
        set its own <em>Jamat</em> (congregation) time below for each prayer.
      </p>

      <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-2 gap-3 rounded-xl border border-gray-200 bg-white p-5 sm:grid-cols-4">
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm sm:col-span-1" />
        <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <input required placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <input required placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm sm:col-span-2" />
        <button disabled={submitting} className="rounded-md bg-noor-600 px-3 py-2 text-sm font-medium text-white hover:bg-noor-700 disabled:opacity-50">
          {submitting ? "Adding…" : "Add masjid"}
        </button>
      </form>

      <p className="mb-2 text-xs text-gray-400">
        Set each masjid's Jamat times below, then click Save on that row. Times are 24h (e.g. 13:15).
      </p>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-3 py-2">Name</th>
              {JAMAT_FIELDS.map((f) => (
                <th key={f.key} className="px-3 py-2">{f.label}</th>
              ))}
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="px-3 py-4 text-gray-400" colSpan={9}>Loading…</td></tr>}
            {!loading && items.length === 0 && <tr><td className="px-3 py-4 text-gray-400" colSpan={9}>No masjids yet.</td></tr>}
            {items.map((item) => (
              <tr key={item.id} className="border-t border-gray-100">
                <td className="px-3 py-2 font-medium">
                  {item.name}
                  {item.address && <div className="text-xs font-normal text-gray-400">{item.address}</div>}
                </td>
                {JAMAT_FIELDS.map((f) => (
                  <td key={f.key} className="px-3 py-1">
                    <input
                      value={(item[f.key] as string) ?? ""}
                      onChange={(e) => updateJamat(item, f.key, e.target.value)}
                      placeholder="--:--"
                      className="w-16 rounded border border-gray-200 px-2 py-1 text-xs"
                    />
                  </td>
                ))}
                <td className="px-3 py-2">
                  <button
                    onClick={() => toggleApproved(item)}
                    className={`rounded-full px-2 py-1 text-xs ${item.is_approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {item.is_approved ? "Approved" : "Pending"}
                  </button>
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <button
                    onClick={() => saveJamat(item)}
                    disabled={savingId === item.id}
                    className="mr-3 rounded bg-noor-600 px-2 py-1 text-xs text-white hover:bg-noor-700 disabled:opacity-50"
                  >
                    {savingId === item.id ? "Saving…" : "Save"}
                  </button>
                  <button onClick={() => remove(item)} className="text-xs text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function MasjidsPage() {
  return (
    <AuthGate>
      <DashboardShell>
        <MasjidsManager />
      </DashboardShell>
    </AuthGate>
  );
}
