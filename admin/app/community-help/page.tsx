"use client";

import { FormEvent, useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabase";
import { CommunityOrg } from "@/lib/types";

const emptyForm = {
  name: "", city: "", contact_person: "", designation: "", phone: "", description: "",
};

function CommunityHelpManager() {
  const [items, setItems] = useState<CommunityOrg[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("community_orgs")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data as CommunityOrg[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await supabase.from("community_orgs").insert({
      name: form.name,
      city: form.city || null,
      contact_person: form.contact_person || null,
      designation: form.designation || null,
      phone: form.phone || null,
      description: form.description || null,
      is_approved: true,
    });
    setForm(emptyForm);
    setSubmitting(false);
    load();
  }

  async function toggleApproved(item: CommunityOrg) {
    await supabase.from("community_orgs").update({ is_approved: !item.is_approved }).eq("id", item.id);
    load();
  }

  async function remove(item: CommunityOrg) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    await supabase.from("community_orgs").delete().eq("id", item.id);
    load();
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Community Help</h1>
      <p className="mb-6 text-gray-500">
        Masjid-affiliated social-work organizations and clubs that someone new to a
        city, or in difficulty, can contact directly. Shown in the app filtered by
        city.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mb-8 grid grid-cols-2 gap-3 rounded-xl border border-gray-200 bg-white p-5 sm:grid-cols-3"
      >
        <input required placeholder="Organization name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm sm:col-span-1" />
        <input placeholder="City / District" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <input placeholder="Contact person" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <input placeholder="Designation (e.g. Coordinator)" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <input placeholder="Description (what they help with)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm sm:col-span-1" />
        <button disabled={submitting} className="rounded-md bg-noor-600 px-3 py-2 text-sm font-medium text-white hover:bg-noor-700 disabled:opacity-50 sm:col-span-3 sm:w-fit">
          {submitting ? "Adding…" : "Add organization"}
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-3 py-2">Organization</th>
              <th className="px-3 py-2">City</th>
              <th className="px-3 py-2">Contact</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="px-3 py-4 text-gray-400" colSpan={6}>Loading…</td></tr>}
            {!loading && items.length === 0 && <tr><td className="px-3 py-4 text-gray-400" colSpan={6}>No organizations yet.</td></tr>}
            {items.map((item) => (
              <tr key={item.id} className="border-t border-gray-100 align-top">
                <td className="px-3 py-2 font-medium">
                  {item.name}
                  {item.description && (
                    <div className="text-xs font-normal text-gray-400">{item.description}</div>
                  )}
                </td>
                <td className="px-3 py-2 text-gray-600">{item.city ?? "—"}</td>
                <td className="px-3 py-2 text-gray-600">
                  {item.contact_person ?? "—"}
                  {item.designation && (
                    <div className="text-xs text-gray-400">{item.designation}</div>
                  )}
                </td>
                <td className="px-3 py-2 text-gray-600">{item.phone ?? "—"}</td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => toggleApproved(item)}
                    className={`rounded-full px-2 py-1 text-xs ${item.is_approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {item.is_approved ? "Approved" : "Pending"}
                  </button>
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
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

export default function CommunityHelpPage() {
  return (
    <AuthGate>
      <DashboardShell>
        <CommunityHelpManager />
      </DashboardShell>
    </AuthGate>
  );
}
