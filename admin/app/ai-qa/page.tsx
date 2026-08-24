"use client";

import { useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabase";
import { AiQaHistory } from "@/lib/types";

function AiQaLog() {
  const [items, setItems] = useState<AiQaHistory[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("ai_qa_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    setItems((data as AiQaHistory[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleFlag(item: AiQaHistory) {
    await supabase.from("ai_qa_history").update({ flagged: !item.flagged }).eq("id", item.id);
    load();
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">AI Q&amp;A Log</h1>
      <p className="mb-6 text-gray-500">
        Recent questions asked in the "Ask about Islam" feature. Flag anything that needs review.
      </p>

      <div className="space-y-3">
        {loading && <p className="text-gray-400">Loading…</p>}
        {!loading && items.length === 0 && <p className="text-gray-400">No questions yet.</p>}
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-start justify-between gap-4">
              <p className="font-medium text-gray-900">{item.question}</p>
              <button
                onClick={() => toggleFlag(item)}
                className={`shrink-0 rounded-full px-2 py-1 text-xs ${
                  item.flagged ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"
                }`}
              >
                {item.flagged ? "Flagged" : "Flag"}
              </button>
            </div>
            <p className="whitespace-pre-wrap text-sm text-gray-600">{item.answer}</p>
            <p className="mt-2 text-xs text-gray-400">
              {new Date(item.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AiQaPage() {
  return (
    <AuthGate>
      <DashboardShell>
        <AiQaLog />
      </DashboardShell>
    </AuthGate>
  );
}
