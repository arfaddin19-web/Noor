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

interface CityCount {
  city: string;
  count: number;
}

function Overview() {
  const [counts, setCounts] = useState<Record<string, number | string>>({
    masjids: "…",
    halalFood: "…",
    aiQuestions: "…",
    locations: "…",
    users: "…",
  });
  const [genderCounts, setGenderCounts] = useState({ male: 0, female: 0, unspecified: 0 });
  const [topCities, setTopCities] = useState<CityCount[]>([]);

  useEffect(() => {
    async function load() {
      const [masjids, halalFood, aiQuestions, locations, users, registrations] = await Promise.all([
        supabase.from("masjids").select("*", { count: "exact", head: true }),
        supabase.from("halal_food_places").select("*", { count: "exact", head: true }),
        supabase.from("ai_qa_history").select("*", { count: "exact", head: true }),
        supabase.from("locations").select("*", { count: "exact", head: true }),
        supabase.from("registrations").select("*", { count: "exact", head: true }),
        supabase.from("registrations").select("city, gender"),
      ]);
      setCounts({
        masjids: masjids.count ?? 0,
        halalFood: halalFood.count ?? 0,
        aiQuestions: aiQuestions.count ?? 0,
        locations: locations.count ?? 0,
        users: users.count ?? 0,
      });

      const rows = (registrations.data as { city: string | null; gender: string | null }[]) ?? [];
      let male = 0, female = 0, unspecified = 0;
      const cityMap = new Map<string, number>();
      for (const r of rows) {
        if (r.gender === "male") male++;
        else if (r.gender === "female") female++;
        else unspecified++;
        if (r.city) cityMap.set(r.city, (cityMap.get(r.city) ?? 0) + 1);
      }
      setGenderCounts({ male, female, unspecified });
      setTopCities(
        Array.from(cityMap.entries())
          .map(([city, count]) => ({ city, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8)
      );
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Overview</h1>
      <p className="mb-6 text-gray-500">Content at a glance.</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatCard label="Registered users" value={counts.users} />
        <StatCard label="Locations" value={counts.locations} />
        <StatCard label="Masjids" value={counts.masjids} />
        <StatCard label="Halal food places" value={counts.halalFood} />
        <StatCard label="AI questions asked" value={counts.aiQuestions} />
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold">Community (from registrations)</h2>
      <p className="mb-4 text-sm text-gray-500">
        Collected when someone registers in the app (name, phone, city, gender — no password,
        no login) — self-reported, not verified. Only from people who registered
        (most masjid/prayer-time features work without it).
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="mb-3 text-sm text-gray-500">By gender</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Male</span><span className="font-medium">{genderCounts.male}</span></div>
            <div className="flex justify-between"><span>Female</span><span className="font-medium">{genderCounts.female}</span></div>
            {genderCounts.unspecified > 0 && (
              <div className="flex justify-between text-gray-400"><span>Unspecified</span><span>{genderCounts.unspecified}</span></div>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="mb-3 text-sm text-gray-500">Top cities</p>
          {topCities.length === 0 ? (
            <p className="text-sm text-gray-400">No city data yet.</p>
          ) : (
            <div className="space-y-2 text-sm">
              {topCities.map((c) => (
                <div key={c.city} className="flex justify-between">
                  <span>{c.city}</span>
                  <span className="font-medium">{c.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
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
