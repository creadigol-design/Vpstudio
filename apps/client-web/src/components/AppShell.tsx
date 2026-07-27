"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { clearSession } from "../lib/api";
import { useLocale } from "../lib/locale";

export function AppShell({ children }: { children: ReactNode }) {
  const { t, locale, setLocale } = useLocale();
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/projects" className="text-lg font-semibold tracking-tight">
            {t("app.title")}
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/projects" className="hover:underline">
              {t("nav.projects")}
            </Link>
            <Link
              href="/projects/new"
              className="rounded-md bg-slate-900 px-3 py-1.5 text-white hover:bg-slate-700"
            >
              {t("nav.newProject")}
            </Link>
            <button
              type="button"
              className="rounded border border-slate-300 px-2 py-1 text-xs"
              onClick={() => setLocale(locale === "en" ? "cy" : "en")}
              aria-label="Switch language"
            >
              {locale === "en" ? "Cymraeg" : "English"}
            </button>
            <button
              type="button"
              className="text-slate-500 hover:underline"
              onClick={() => {
                clearSession();
                router.push("/sign-in");
              }}
            >
              {t("nav.signOut")}
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
