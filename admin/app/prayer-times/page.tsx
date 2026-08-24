"use client";

import { useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabase";
import { Location, PrayerTime, MONTH_NAMES } from "@/lib/types";

const TIME_FIELDS: (keyof PrayerTime)[] = [
  "fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha",
];

function PrayerTimesEditor() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationId, setLocationId] = useState<string>("");
  const [month, setMonth] = useState(1);
  const [rows, setRows] = useState<PrayerTime[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from("locations")
      .select("*")
      .order("name")
      .then(({ data }) => {
        setLocations((data as Location[]) ?? []);
        const def = data?.find((l: Location) => l.is_default) ?? data?.[0];
        if (def) setLocationId(def.id);
      });
  }, []);

  useEffect(() => {
    if (!locationId) return;
    setLoading(true);
    supabase
      .from("prayer_times")
      .select("*")
      .eq("location_id", locationId)
      .eq("month", month)
      .order("day")
      .then(({ data }) => {
        setRows((data as PrayerTime[]) ?? []);
        setLoading(false);
      });
  }, [locationId, month]);

  async function updateField(row: PrayerTime, field: keyof PrayerTime, value: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, [field]: value } : r))
    );
  }

  async function saveRow(row: PrayerTime) {
    setSaving(row.id);
    await supabase
      .from("prayer_times")
      .update({
        fajr: row.fajr,
        sunrise: row.sunrise,
        dhuhr: row.dhuhr,
        asr: row.asr,
        maghrib: row.maghrib,
        isha: row.isha,
        jumma: row.jumma,
      })
      .eq("id", row.id);
    setSaving(null);
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Prayer Times</h1>
      <p className="mb-6 text-gray-500">
        Edit the monthly prayer time table for each location. Times apply every year
        (Feb 29 is only used in leap years).
      </p>

      <div className="mb-4 flex gap-3">
        <select
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
              {l.is_default ? " (default)" : ""}
            </option>
          ))}
        </select>

        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          {MONTH_NAMES.map((name, i) => (
            <option key={name} value={i + 1}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-3 py-2">Date</th>
              {TIME_FIELDS.map((f) => (
                <th key={f} className="px-3 py-2 capitalize">{f}</th>
              ))}
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td className="px-3 py-4 text-gray-400" colSpan={8}>Loading…</td></tr>
            )}
            {!loading && rows.map((row) => (
              <tr key={row.id} className="border-t border-gray-100">
                <td className="px-3 py-1 font-medium">{row.day}</td>
                {TIME_FIELDS.map((f) => (
                  <td key={f} className="px-3 py-1">
                    <input
                      value={row[f] as string}
                      onChange={(e) => updateField(row, f, e.target.value)}
                      className="w-20 rounded border border-gray-200 px-2 py-1"
                    />
                  </td>
                ))}
                <td className="px-3 py-1">
                  <button
                    onClick={() => saveRow(row)}
                    disabled={saving === row.id}
                    className="rounded bg-noor-600 px-2 py-1 text-xs text-white hover:bg-noor-700 disabled:opacity-50"
                  >
                    {saving === row.id ? "Saving…" : "Save"}
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

export default function PrayerTimesPage() {
  return (
    <AuthGate>
      <DashboardShell>
        <PrayerTimesEditor />
      </DashboardShell>
    </AuthGate>
  );
}
