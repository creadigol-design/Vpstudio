"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError, loadSession } from "../../../lib/api";
import { useLocale } from "../../../lib/locale";
import { AppShell } from "../../../components/AppShell";
import { allowedTransitions, type ProjectStatus } from "@virtual-studio/contracts";
import type { MessageKey } from "@virtual-studio/i18n";

interface RunningOrderItemView {
  id: string;
  type: string;
  position: number;
  required: boolean;
  scriptSectionId: string | null;
  assetId: string | null;
}

interface ScriptSection {
  id: string;
  heading: string;
  body: string;
}

interface ProjectDetail {
  id: string;
  name: string;
  status: ProjectStatus;
  languageMode: string;
  outputPresets: string[];
  runningOrderItems: RunningOrderItemView[];
  scripts: Array<{ language: string; versions: Array<{ version: number; sections: ScriptSection[] }> }>;
}

export default function ProjectDetailPage() {
  const { t } = useLocale();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [scriptLanguage, setScriptLanguage] = useState<"en" | "cy">("en");
  const [sections, setSections] = useState<ScriptSection[]>([]);

  const refresh = useCallback(() => {
    api<ProjectDetail>(`/projects/${params.id}`).then((p) => {
      setProject(p);
      const script = p.scripts.find((s) => s.language === scriptLanguage);
      setSections(script?.versions[0]?.sections ?? []);
    });
  }, [params.id, scriptLanguage]);

  useEffect(() => {
    if (!loadSession()) {
      router.replace("/sign-in");
      return;
    }
    refresh();
  }, [router, refresh]);

  async function transition(to: ProjectStatus) {
    setNotice(null);
    try {
      await api(`/projects/${params.id}/status`, { method: "POST", body: JSON.stringify({ to }) });
      refresh();
    } catch (err) {
      if (err instanceof ApiError && (err.body as { error?: string })?.error === "RUNNING_ORDER_INCOMPLETE") {
        setNotice("The running order is not complete yet — every presenter section needs a script and media blocks need assets.");
      } else {
        setNotice("That change is not available right now.");
      }
    }
  }

  async function saveScript() {
    setNotice(null);
    await api(`/projects/${params.id}/script`, {
      method: "PUT",
      body: JSON.stringify({ language: scriptLanguage, sections }),
    });
    refresh();
  }

  function updateSection(index: number, patch: Partial<ScriptSection>) {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  if (!project) {
    return (
      <AppShell>
        <p className="text-sm text-slate-500">{t("common.loading")}</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{project.name}</h1>
        <div className="flex items-center gap-3">
          <a href={`/projects/${project.id}/review`} className="text-sm text-blue-700 underline">
            {t("record.review")}
          </a>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">
            {t(`project.status.${project.status}` as MessageKey)}
          </span>
        </div>
      </div>

      {notice && (
        <p role="alert" className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {notice}
        </p>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {allowedTransitions(project.status).map((to) => (
          <button
            key={to}
            type="button"
            onClick={() => transition(to)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-100"
          >
            → {t(`project.status.${to}` as MessageKey)}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Running order</h2>
          <ol className="space-y-2">
            {project.runningOrderItems.map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded border border-slate-100 px-3 py-2 text-sm">
                <span>
                  <span className="mr-2 text-slate-400">{item.position}.</span>
                  {item.type.replaceAll("_", " ")}
                  {item.required && <span className="ml-2 text-xs text-red-600">required</span>}
                </span>
                <span className="text-xs text-slate-400">
                  {item.type === "presenter" ? (item.scriptSectionId ? "script attached" : "no script") : ""}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Script</h2>
            <div className="flex gap-1">
              {(["en", "cy"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setScriptLanguage(lang)}
                  className={`rounded px-2 py-1 text-xs ${
                    scriptLanguage === lang ? "bg-slate-900 text-white" : "border border-slate-300"
                  }`}
                >
                  {lang === "en" ? "English" : "Cymraeg"}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {sections.map((section, i) => (
              <div key={section.id} className="rounded border border-slate-100 p-3">
                <input
                  aria-label="Section heading"
                  value={section.heading}
                  onChange={(e) => updateSection(i, { heading: e.target.value })}
                  className="mb-2 w-full rounded border border-slate-200 px-2 py-1 text-sm font-medium"
                />
                <textarea
                  aria-label="Section body"
                  value={section.body}
                  onChange={(e) => updateSection(i, { body: e.target.value })}
                  rows={3}
                  className="w-full rounded border border-slate-200 px-2 py-1 text-sm"
                />
              </div>
            ))}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSections((prev) => [...prev, { id: `section-${prev.length + 1}`, heading: "", body: "" }])}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
              >
                + Section
              </button>
              <button
                type="button"
                onClick={saveScript}
                className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
              >
                {t("common.save")}
              </button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
