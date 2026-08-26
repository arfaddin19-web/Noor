"use client";

import { FormEvent, useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabase";
import { Notice } from "@/lib/types";

const emptyForm = { title: "", body: "" };

function NoticesManager() {
  const [items, setItems] = useState<Notice[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("notices")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data as Notice[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await supabase.from("notices").insert({
      title: form.title,
      body: form.body,
      is_active: true,
    });
    setForm(emptyForm);
    setSubmitting(false);
    load();
  }

  async function toggleActive(item: Notice) {
    await supabase.from("notices").update({ is_active: !item.is_active }).eq("id", item.id);
    load();
  }

  async function remove(item: Notice) {
    if (!confirm(`Delete "${item.title}"?`)) return;
    await supabase.from("notices").delete().eq("id", item.id);
    load();
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Notices</h1>
      <p className="mb-6 text-gray-500">
        Short announcements shown in a banner on the app&apos;s Home screen — e.g. Eid
        prayer timings, a masjid closure, or a community event. Only <em>active</em>{" "}
        notices are shown to users, most recent first.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mb-8 grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-5 sm:grid-cols-2"
      >
        <input
          required
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm sm:col-span-2"
        />
        <textarea
          required
          placeholder="Notice text"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          rows={3}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm sm:col-span-2"
        />
        <button
          disabled={submitting}
          className="rounded-md bg-noor-600 px-3 py-2 text-sm font-medium text-white hover:bg-noor-700 disabled:opacity-50 sm:col-span-2 sm:w-fit"
        >
          {submitting ? "Publishing…" : "Publish notice"}
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Body</th>
              <th className="px-3 py-2">Published</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-3 py-4 text-gray-400" colSpan={5}>
                  Loading…
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-gray-400" colSpan={5}>
                  No notices yet.
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id} className="border-t border-gray-100 align-top">
                <td className="px-3 py-2 font-medium">{item.title}</td>
                <td className="max-w-md px-3 py-2 text-gray-600">{item.body}</td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => toggleActive(item)}
                    className={`rounded-full px-2 py-1 text-xs ${
                      item.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {item.is_active ? "Active" : "Hidden"}
                  </button>
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <button onClick={() => remove(item)} className="text-xs text-red-600 hover:underline">
                    Delete
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

export default function NoticesPage() {
  return (
    <AuthGate>
      <DashboardShell>
        <NoticesManager />
      </DashboardShell>
    </AuthGate>
  );
}
