"use client";

import React, { FormEvent, useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import DashboardShell from "@/components/DashboardShell";
import JamatCalendarUpload from "@/components/JamatCalendarUpload";
import { supabase } from "@/lib/supabase";
import { Masjid } from "@/lib/types";

const emptyForm = {
  name: "", address: "", city: "", latitude: "", longitude: "", phone: "", description: "",
};

// Each Jamat field pairs the flat masjids column (the fallback, used when a
// masjid has no yearly calendar uploaded) with the matching column on
// today's row in masjid_jamat_times (used when it does — see JAMAT_TODAY
// below for why the boxes need to show *that*, not the flat columns, once a
// calendar exists).
const JAMAT_FIELDS: { key: keyof Masjid; todayKey: keyof TodayJamat; label: string }[] = [
  { key: "fajr_jamat", todayKey: "fajr", label: "Fajr" },
  { key: "dhuhr_jamat", todayKey: "dhuhr", label: "Dhuhr" },
  { key: "asr_jamat", todayKey: "asr", label: "Asr" },
  { key: "maghrib_jamat", todayKey: "maghrib", label: "Maghrib" },
  { key: "isha_jamat", todayKey: "isha", label: "Isha" },
  { key: "jumma_jamat", todayKey: "jumma", label: "Jumu'ah" },
];

interface TodayJamat {
  fajr: string | null;
  dhuhr: string | null;
  asr: string | null;
  maghrib: string | null;
  isha: string | null;
  jumma: string | null;
}

function trimSeconds(t: string | null): string {
  return t ? t.slice(0, 5) : "";
}

function todayMonthDay() {
  const now = new Date();
  return { month: now.getMonth() + 1, day: now.getDate() };
}

function MasjidsManager() {
  const [items, setItems] = useState<Masjid[]>([]);
  // Today's row from each masjid's yearly calendar (masjid_id -> row), for
  // masjids that have uploaded one. Once a masjid has this, the quick-edit
  // boxes below show (and Save writes to) *this*, not the flat masjids
  // columns — otherwise the boxes looked permanently blank after uploading
  // a CSV, since the CSV only ever wrote to masjid_jamat_times.
  const [todayJamat, setTodayJamat] = useState<Record<string, TodayJamat>>({});
  // Local, unsaved edits to the boxes, keyed by masjid id then field.
  const [edits, setEdits] = useState<Record<string, Partial<Record<keyof TodayJamat, string>>>>({});
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { month, day } = todayMonthDay();
    const [{ data }, { data: jamatRows }] = await Promise.all([
      supabase.from("masjids").select("*").order("created_at", { ascending: false }),
      supabase
        .from("masjid_jamat_times")
        .select("masjid_id, fajr, dhuhr, asr, maghrib, isha, jumma")
        .eq("month", month)
        .eq("day", day),
    ]);
    setItems((data as Masjid[]) ?? []);
    const map: Record<string, TodayJamat> = {};
    (jamatRows as (TodayJamat & { masjid_id: string })[] | null ?? []).forEach((r) => {
      map[r.masjid_id] = r;
    });
    setTodayJamat(map);
    setEdits({});
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function displayValue(item: Masjid, field: (typeof JAMAT_FIELDS)[number]): string {
    const edited = edits[item.id]?.[field.todayKey];
    if (edited !== undefined) return edited;
    const today = todayJamat[item.id];
    if (today) return trimSeconds(today[field.todayKey]);
    return (item[field.key] as string) ?? "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await supabase.from("masjids").insert({
      name: form.name,
      address: form.address || null,
      city: form.city || null,
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

  function updateJamat(item: Masjid, todayKey: keyof TodayJamat, value: string) {
    setEdits((prev) => ({ ...prev, [item.id]: { ...prev[item.id], [todayKey]: value } }));
  }

  async function saveJamat(item: Masjid) {
    setSavingId(item.id);
    const values: Record<keyof TodayJamat, string> = {
      fajr: "", dhuhr: "", asr: "", maghrib: "", isha: "", jumma: "",
    };
    for (const f of JAMAT_FIELDS) values[f.todayKey] = displayValue(item, f);

    if (todayJamat[item.id]) {
      // This masjid has a yearly calendar — the edit is a correction to
      // *today's* row specifically, not the flat fallback fields.
      const { month, day } = todayMonthDay();
      await supabase
        .from("masjid_jamat_times")
        .update({
          fajr: values.fajr || null,
          dhuhr: values.dhuhr || null,
          asr: values.asr || null,
          maghrib: values.maghrib || null,
          isha: values.isha || null,
          jumma: values.jumma || null,
        })
        .eq("masjid_id", item.id)
        .eq("month", month)
        .eq("day", day);
      setTodayJamat((prev) => ({ ...prev, [item.id]: values }));
    } else {
      // No yearly calendar for this masjid — same as before, a single
      // fixed time per prayer.
      await supabase
        .from("masjids")
        .update({
          fajr_jamat: values.fajr || null,
          dhuhr_jamat: values.dhuhr || null,
          asr_jamat: values.asr || null,
          maghrib_jamat: values.maghrib || null,
          isha_jamat: values.isha || null,
          jumma_jamat: values.jumma || null,
        })
        .eq("id", item.id);
      setItems((prev) =>
        prev.map((m) =>
          m.id === item.id
            ? {
                ...m,
                fajr_jamat: values.fajr || null,
                dhuhr_jamat: values.dhuhr || null,
                asr_jamat: values.asr || null,
                maghrib_jamat: values.maghrib || null,
                isha_jamat: values.isha || null,
                jumma_jamat: values.jumma || null,
              }
            : m
        )
      );
    }
    setEdits((prev) => ({ ...prev, [item.id]: {} }));
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
        <input placeholder="City / District (e.g. Kathmandu)" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
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
        For a masjid with a yearly calendar uploaded (see "Yearly ▾"), these boxes show and edit
        <em> today's</em> row from that calendar, not a single fixed time — a quick way to fix one
        day without re-uploading the whole file. For a masjid with no yearly calendar, they edit its
        one fixed time as before.
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
              <React.Fragment key={item.id}>
              <tr className="border-t border-gray-100">
                <td className="px-3 py-2 font-medium">
                  {item.name}
                  {(item.city || item.address) && (
                    <div className="text-xs font-normal text-gray-400">
                      {[item.city, item.address].filter(Boolean).join(" — ")}
                    </div>
                  )}
                  {todayJamat[item.id] && (
                    <div className="mt-0.5 text-[10px] font-normal text-noor-700">
                      Today's row from yearly calendar
                    </div>
                  )}
                </td>
                {JAMAT_FIELDS.map((f) => (
                  <td key={f.key} className="px-3 py-1">
                    <input
                      value={displayValue(item, f)}
                      onChange={(e) => updateJamat(item, f.todayKey, e.target.value)}
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
                  <button
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="mr-3 text-xs text-noor-700 hover:underline"
                  >
                    {expandedId === item.id ? "Hide yearly ▴" : "Yearly ▾"}
                  </button>
                  <button onClick={() => remove(item)} className="text-xs text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
              {expandedId === item.id && (
                <tr className="border-t border-gray-100 bg-gray-50/50">
                  <td colSpan={9} className="px-3 py-3">
                    <JamatCalendarUpload masjidId={item.id} masjidName={item.name} onChange={load} />
                  </td>
                </tr>
              )}
              </React.Fragment>
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
