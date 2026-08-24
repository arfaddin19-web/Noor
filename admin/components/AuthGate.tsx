"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

/** Wrap any dashboard page in this. Redirects to /login unless the user is a signed-in admin. */
export default function AuthGate({ children }: { children: ReactNode }) {
  const { loading, profile, isAdmin } = useAuth();
  const router = useRouter();

  // Redirects must happen as an effect, not during render — calling router.replace()
  // while AuthGate itself is rendering trips React's "setState in render" guard.
  useEffect(() => {
    if (!loading && !profile) {
      router.replace("/login");
    }
  }, [loading, profile, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Loading…
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-medium">Not authorized</p>
        <p className="text-gray-500">
          Your account ({profile.full_name ?? "signed in"}) doesn't have admin access yet.
          Ask an existing admin to upgrade your role in the `profiles` table.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
