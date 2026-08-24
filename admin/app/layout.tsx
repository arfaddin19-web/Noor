import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Noor Admin",
  description: "Content management for the Noor Muslim companion app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
