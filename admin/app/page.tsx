"use client";

import { useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabase";

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function Overview() {
  const [counts, setCounts] = useState<Record<string, number | string>>({
    masjids: "…",
    halalFood: "…",
    aiQuestions: "…",
    locations: "…",
  });

  useEffect(() => {
    async function load() {
      const [masjids, halalFood, aiQuestions, locations] = await Promise.all([
        supabase.from("masjids").select("*", { count: "exact", head: true }),
        supabase.from("halal_food_places").select("*", { count: "exact", head: true }),
        supabase.from("ai_qa_history").select("*", { count: "exact", head: true }),
        supabase.from("locations").select("*", { count: "exact", head: true }),
      ]);
      setCounts({
        masjids: masjids.count ?? 0,
        halalFood: halalFood.count ?? 0,
        aiQuestions: aiQuestions.count ?? 0,
        locations: locations.count ?? 0,
      });
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Overview</h1>
      <p className="mb-6 text-gray-500">Content at a glance.</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Locations" value={counts.locations} />
        <StatCard label="Masjids" value={counts.masjids} />
        <StatCard label="Halal food places" value={counts.halalFood} />
        <StatCard label="AI questions asked" value={counts.aiQuestions} />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthGate>
      <DashboardShell>
        <Overview />
      </DashboardShell>
    </AuthGate>
  );
}
