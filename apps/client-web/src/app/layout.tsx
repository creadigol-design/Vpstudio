import type { Metadata } from "next";
import "./globals.css";
import { LocaleProvider } from "../lib/locale";

export const metadata: Metadata = {
  title: "Virtual Studio",
  description: "Record, review and publish professional branded video",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
