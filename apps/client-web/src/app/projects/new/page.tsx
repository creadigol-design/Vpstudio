"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, loadSession } from "../../../lib/api";
import { useLocale } from "../../../lib/locale";
import { AppShell } from "../../../components/AppShell";
import { LANGUAGE_MODES, OUTPUT_PRESETS } from "@virtual-studio/contracts";
import type { MessageKey } from "@virtual-studio/i18n";

interface Workspace {
  id: string;
  name: string;
}

interface Template {
  id: string;
  name: string;
  description?: string;
  versions: Array<{ id: string; version: number }>;
}

const DEFAULT_PRESETS = ["LANDSCAPE_1080", "VERTICAL_1080"] as const;

export default function NewProjectPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [name, setName] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [templateVersionId, setTemplateVersionId] = useState("");
  const [languageMode, setLanguageMode] = useState<string>("EN_ONLY");
  const [presets, setPresets] = useState<string[]>([...DEFAULT_PRESETS]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loadSession()) {
      router.replace("/sign-in");
      return;
    }
    api<Workspace[]>("/organisations/current/workspaces").then((ws) => {
      setWorkspaces(ws);
      if (ws[0]) setWorkspaceId(ws[0].id);
    });
    api<Template[]>("/templates").then((ts) => {
      setTemplates(ts);
      const first = ts[0]?.versions[0];
      if (first) setTemplateVersionId(first.id);
    });
  }, [router]);

  function togglePreset(preset: string) {
    setPresets((prev) => (prev.includes(preset) ? prev.filter((p) => p !== preset) : [...prev, preset]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const project = await api<{ id: string }>("/projects", {
        method: "POST",
        body: JSON.stringify({ name, workspaceId, templateVersionId, languageMode, outputPresets: presets }),
      });
      router.push(`/projects/${project.id}`);
    } catch {
      setError("Could not create the project");
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <h1 className="mb-6 text-xl font-semibold">{t("project.create.title")}</h1>
      <form onSubmit={onSubmit} className="max-w-lg space-y-5 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            {t("project.create.name")}
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="workspace" className="mb-1 block text-sm font-medium">
            Workspace
          </label>
          <select
            id="workspace"
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="template" className="mb-1 block text-sm font-medium">
            {t("project.create.template")}
          </label>
          <select
            id="template"
            value={templateVersionId}
            onChange={(e) => setTemplateVersionId(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {templates.flatMap((tpl) =>
              tpl.versions.map((v) => (
                <option key={v.id} value={v.id}>
                  {tpl.name} (v{v.version})
                </option>
              )),
            )}
          </select>
        </div>
        <fieldset>
          <legend className="mb-1 block text-sm font-medium">{t("project.create.language")}</legend>
          <div className="space-y-1">
            {LANGUAGE_MODES.map((mode) => (
              <label key={mode} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="languageMode"
                  checked={languageMode === mode}
                  onChange={() => setLanguageMode(mode)}
                />
                {t(`language.mode.${mode}` as MessageKey)}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-1 block text-sm font-medium">{t("project.create.formats")}</legend>
          <div className="grid grid-cols-2 gap-1">
            {OUTPUT_PRESETS.map((preset) => (
              <label key={preset} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={presets.includes(preset)} onChange={() => togglePreset(preset)} />
                {preset.replaceAll("_", " ").toLowerCase()}
              </label>
            ))}
          </div>
        </fieldset>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy || presets.length === 0}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {busy ? t("common.loading") : t("project.create.submit")}
        </button>
      </form>
    </AppShell>
  );
}
