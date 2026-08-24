"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";
import { supabase } from "@/lib/supabase";

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/prayer-times", label: "Prayer Times" },
  { href: "/masjids", label: "Masjids" },
  { href: "/halal-food", label: "Halal Food" },
  { href: "/ai-qa", label: "AI Q&A Log" },
];

export default function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white p-4">
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="h-7 w-7 rounded-full bg-noor-600" />
          <span className="text-lg font-semibold text-noor-700">Noor Admin</span>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                pathname === item.href
                  ? "bg-noor-50 text-noor-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={signOut}
          className="mt-8 w-full rounded-md px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-100"
        >
          Sign out
        </button>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
