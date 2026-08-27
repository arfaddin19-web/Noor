"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MasjidJamatTime } from "@/lib/types";

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // non-leap template — Feb 29 is optional, same as prayer_times
const FIELDS = ["fajr", "dhuhr", "asr", "maghrib", "isha", "jumma"] as const;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function buildTemplateCsv(): string {
  const lines = ["month,day,fajr,dhuhr,asr,maghrib,isha,jumma"];
  DAYS_IN_MONTH.forEach((count, i) => {
    for (let day = 1; day <= count; day++) {
      lines.push(`${i + 1},${day},,,,,,`);
    }
  });
  return lines.join("\n");
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface ParsedRow {
  month: number;
  day: number;
  fajr: string | null;
  dhuhr: string | null;
  asr: string | null;
  maghrib: string | null;
  isha: string | null;
  jumma: string | null;
}

function parseCsv(text: string): { rows: ParsedRow[]; errors: string[] } {
  const rows: ParsedRow[] = [];
  const errors: string[] = [];
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const cells = line.split(",").map((c) => c.trim());
    // Skip the header row if present (first cell is literally "month").
    if (idx === 0 && cells[0]?.toLowerCase() === "month") return;

    const [monthStr, dayStr, ...timeCells] = cells;
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      errors.push(`Line ${lineNum}: invalid month "${monthStr}"`);
      return;
    }
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      errors.push(`Line ${lineNum}: invalid day "${dayStr}"`);
      return;
    }

    const values: Record<string, string | null> = {};
    let rowHasBadTime = false;
    FIELDS.forEach((field, i) => {
      const raw = (timeCells[i] ?? "").trim();
      if (!raw) {
        values[field] = null;
      } else if (TIME_RE.test(raw)) {
        values[field] = raw;
      } else {
        errors.push(`Line ${lineNum}: invalid time "${raw}" for ${field} (expected 24h HH:MM, e.g. 05:15)`);
        rowHasBadTime = true;
      }
    });
    if (rowHasBadTime) return;

    rows.push({
      month,
      day,
      fajr: values.fajr,
      dhuhr: values.dhuhr,
      asr: values.asr,
      maghrib: values.maghrib,
      isha: values.isha,
      jumma: values.jumma,
    });
  });

  return { rows, errors };
}

export default function JamatCalendarUpload({
  masjidId,
  masjidName,
  onChange,
}: {
  masjidId: string;
  masjidName: string;
  /** Called after a successful upload or clear, so the parent (the Masjids
   *  list) can refresh its "today's row" preview for this masjid. */
  onChange?: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dayCount, setDayCount] = useState<number | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [result, setResult] = useState<{ saved: number; errors: string[] } | null>(null);

  async function loadStatus() {
    setLoadingStatus(true);
    const { count } = await supabase
      .from("masjid_jamat_times")
      .select("id", { count: "exact", head: true })
      .eq("masjid_id", masjidId);
    setDayCount(count ?? 0);
    setLoadingStatus(false);
  }

  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masjidId]);

  function handleTemplateDownload() {
    downloadCsv(`${masjidName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-jamat-template.csv`, buildTemplateCsv());
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setResult(null);

    const text = await file.text();
    const { rows, errors } = parseCsv(text);

    if (rows.length === 0) {
      setResult({ saved: 0, errors: errors.length ? errors : ["No valid rows found in the file."] });
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Upsert in chunks to stay well under any request size limit.
    const CHUNK = 200;
    let saved = 0;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const chunk = rows.slice(i, i + CHUNK).map((r) => ({ masjid_id: masjidId, ...r }));
      const { error } = await supabase
        .from("masjid_jamat_times")
        .upsert(chunk as MasjidJamatTime[], { onConflict: "masjid_id,month,day" });
      if (error) {
        errors.push(`Rows ${i + 1}-${i + chunk.length}: ${error.message}`);
      } else {
        saved += chunk.length;
      }
    }

    setResult({ saved, errors });
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    loadStatus();
    onChange?.();
  }

  async function handleClear() {
    if (!confirm(`Remove the yearly Jamat calendar for "${masjidName}"? This masjid will fall back to its fixed Jamat times above.`)) return;
    setClearing(true);
    await supabase.from("masjid_jamat_times").delete().eq("masjid_id", masjidId);
    setClearing(false);
    setResult(null);
    loadStatus();
    onChange?.();
  }

  return (
    <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-gray-600">
          <span className="font-medium">Yearly Jamat calendar: </span>
          {loadingStatus ? (
            "checking…"
          ) : dayCount && dayCount > 0 ? (
            <span className="text-green-700">{dayCount} day{dayCount === 1 ? "" : "s"} uploaded — today's exact time shows in the app.</span>
          ) : (
            <span className="text-gray-500">none uploaded yet — using the fixed times above.</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleTemplateDownload}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
          >
            Download CSV template
          </button>
          <label className="cursor-pointer rounded bg-noor-600 px-2 py-1 text-xs text-white hover:bg-noor-700">
            {uploading ? "Uploading…" : "Upload CSV"}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {!!dayCount && (
            <button
              onClick={handleClear}
              disabled={clearing}
              className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {clearing ? "Clearing…" : "Clear"}
            </button>
          )}
        </div>
      </div>

      {result && (
        <div className="mt-2 text-xs">
          {result.saved > 0 && <p className="text-green-700">Saved {result.saved} day(s).</p>}
          {result.errors.length > 0 && (
            <div className="mt-1 text-red-600">
              <p>{result.errors.length} row(s) had a problem and were skipped:</p>
              <ul className="ml-4 list-disc">
                {result.errors.slice(0, 10).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
              {result.errors.length > 10 && <p>...and {result.errors.length - 10} more.</p>}
            </div>
          )}
        </div>
      )}

      <p className="mt-2 text-[11px] text-gray-400">
        CSV columns: month, day, fajr, dhuhr, asr, maghrib, isha, jumma — times in 24h HH:MM (e.g.
        05:15, 13:30). Leave a cell blank if you don't have that value yet. Jumu'ah is usually only
        filled on Fridays. Re-uploading replaces any day already saved.
      </p>
    </div>
  );
}
