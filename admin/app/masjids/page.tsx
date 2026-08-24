"use client";

import { FormEvent, useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabase";
import { Masjid } from "@/lib/types";

const emptyForm = {
  name: "", address: "", latitude: "", longitude: "", phone: "", jumma_time: "", description: "",
};

function MasjidsManager() {
  const [items, setItems] = useState<Masjid[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

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
      jumma_time: form.jumma_time || null,
      description: form.description || null,
      is_approved: true,
    });
    setForm(emptyForm);
    setSubmitting(false);
    load();
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
      <p className="mb-6 text-gray-500">Manage masjid listings shown in "Masjids near me".</p>

      <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-2 gap-3 rounded-xl border border-gray-200 bg-white p-5 sm:grid-cols-4">
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm sm:col-span-1" />
        <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <input required placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <input required placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <input placeholder="Jumu'ah time (e.g. 13:15)" value={form.jumma_time} onChange={(e) => setForm({ ...form, jumma_time: e.target.value })} className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm sm:col-span-3" />
        <button disabled={submitting} className="rounded-md bg-noor-600 px-3 py-2 text-sm font-medium text-white hover:bg-noor-700 disabled:opacity-50">
          {submitting ? "Adding…" : "Add masjid"}
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Address</th>
              <th className="px-3 py-2">Jumu'ah</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="px-3 py-4 text-gray-400" colSpan={5}>Loading…</td></tr>}
            {!loading && items.length === 0 && <tr><td className="px-3 py-4 text-gray-400" colSpan={5}>No masjids yet.</td></tr>}
            {items.map((item) => (
              <tr key={item.id} className="border-t border-gray-100">
                <td className="px-3 py-2 font-medium">{item.name}</td>
                <td className="px-3 py-2 text-gray-500">{item.address}</td>
                <td className="px-3 py-2">{item.jumma_time ?? "—"}</td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => toggleApproved(item)}
                    className={`rounded-full px-2 py-1 text-xs ${item.is_approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {item.is_approved ? "Approved" : "Pending"}
                  </button>
                </td>
                <td className="px-3 py-2 text-right">
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
