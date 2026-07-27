"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, loadSession } from "../../lib/api";
import { useLocale } from "../../lib/locale";
import { AppShell } from "../../components/AppShell";
import type { MessageKey } from "@virtual-studio/i18n";

interface ProjectSummary {
  id: string;
  name: string;
  status: string;
  languageMode: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loadSession()) {
      router.replace("/sign-in");
      return;
    }
    api<ProjectSummary[]>("/projects")
      .then(setProjects)
      .catch(() => setError("Could not load projects"));
  }, [router]);

  return (
    <AppShell>
      <h1 className="mb-6 text-xl font-semibold">{t("nav.projects")}</h1>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {!projects && !error && <p className="text-sm text-slate-500">{t("common.loading")}</p>}
      {projects && projects.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center">
          <p className="mb-4 text-slate-600">—</p>
          <Link href="/projects/new" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
            {t("nav.newProject")}
          </Link>
        </div>
      )}
      {projects && projects.length > 0 && (
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {projects.map((p) => (
            <li key={p.id}>
              <Link href={`/projects/${p.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
                <span className="font-medium">{p.name}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                  {t(`project.status.${p.status}` as MessageKey)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs text-slate-400">{locale === "cy" ? "Rhyngwyneb Cymraeg" : "English interface"}</p>
    </AppShell>
  );
}
