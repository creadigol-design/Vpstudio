"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError, loadSession } from "../../../../lib/api";
import { useLocale } from "../../../../lib/locale";
import { AppShell } from "../../../../components/AppShell";
import type { MessageKey } from "@virtual-studio/i18n";

interface QualityCheckView {
  id: string;
  check: string;
  status: string;
  measured: string | null;
  expected: string | null;
  severity: string;
}

interface RenderJobView {
  id: string;
  status: string;
  progress: number;
}

interface VersionView {
  id: string;
  versionNumber: number;
  renderJobs: RenderJobView[];
  qualityChecks: QualityCheckView[];
}

interface CommentView {
  id: string;
  body: string;
  timecodeMs: number | null;
  resolved: boolean;
  author: { id: string; displayName: string };
}

interface MemberView {
  userId: string;
  displayName: string;
  role: string;
}

interface OutputView {
  mediaAssetId: string;
  fileName: string;
  downloadUrl: string;
}

interface ProjectView {
  id: string;
  name: string;
  status: string;
  versions: Array<{ id: string; versionNumber: number }>;
}

function formatTimecode(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

export default function ReviewPage() {
  const { t } = useLocale();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectView | null>(null);
  const [version, setVersion] = useState<VersionView | null>(null);
  const [comments, setComments] = useState<CommentView[]>([]);
  const [members, setMembers] = useState<MemberView[]>([]);
  const [outputs, setOutputs] = useState<OutputView[] | null>(null);
  const [approvalRequestId, setApprovalRequestId] = useState<string | null>(null);
  const [commentBody, setCommentBody] = useState("");
  const [commentTimecode, setCommentTimecode] = useState("");
  const [approverId, setApproverId] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const p = await api<ProjectView>(`/projects/${params.id}`);
    setProject(p);
    const latest = p.versions[0];
    if (latest) {
      const v = await api<VersionView>(`/versions/${latest.id}`);
      setVersion(v);
      if (p.status === "APPROVED" || p.status === "COMPLETED") {
        api<OutputView[]>(`/versions/${latest.id}/outputs`)
          .then(setOutputs)
          .catch(() => setOutputs(null));
      } else {
        setOutputs(null);
      }
    }
    setComments(await api<CommentView[]>(`/projects/${params.id}/comments`));
  }, [params.id]);

  useEffect(() => {
    if (!loadSession()) {
      router.replace("/sign-in");
      return;
    }
    refresh();
    api<MemberView[]>(`/organisations/current/members`).then((m) => {
      setMembers(m);
      const firstReviewer = m.find((x) => x.role === "REVIEWER" || x.role === "ORG_ADMIN");
      if (firstReviewer) setApproverId(firstReviewer.userId);
    });
  }, [router, refresh]);

  async function addComment() {
    if (!commentBody.trim()) return;
    const timecodeMs = commentTimecode ? Math.round(Number(commentTimecode) * 1000) : undefined;
    await api(`/projects/${params.id}/comments`, {
      method: "POST",
      body: JSON.stringify({ body: commentBody, timecodeMs, projectVersionId: version?.id }),
    });
    setCommentBody("");
    setCommentTimecode("");
    refresh();
  }

  async function requestApproval() {
    if (!version || !approverId) return;
    setNotice(null);
    try {
      const request = await api<{ id: string }>(`/versions/${version.id}/approval-requests`, {
        method: "POST",
        body: JSON.stringify({ rule: "ONE_NAMED", requiredUserIds: [approverId] }),
      });
      setApprovalRequestId(request.id);
      refresh();
    } catch (err) {
      setNotice(
        err instanceof ApiError && err.status === 409
          ? "The project is not ready for approval yet."
          : "Could not request approval.",
      );
    }
  }

  async function decide(decision: "APPROVE" | "REJECT" | "REQUEST_CHANGES") {
    if (!approvalRequestId) return;
    setNotice(null);
    try {
      await api(`/approval-requests/${approvalRequestId}/decisions`, {
        method: "POST",
        body: JSON.stringify({ decision }),
      });
      refresh();
    } catch (err) {
      setNotice(
        err instanceof ApiError && err.status === 403
          ? "Only the assigned approver can decide on this version."
          : "Could not record the decision.",
      );
    }
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
        <h1 className="text-xl font-semibold">
          {project.name} — {t("record.review")}
        </h1>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">
          {t(`project.status.${project.status}` as MessageKey)}
        </span>
      </div>

      {notice && (
        <p role="alert" className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {notice}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Draft v{version?.versionNumber ?? "—"}
            </h2>
            {version?.renderJobs.map((job) => (
              <p key={job.id} className="text-sm">
                Render: <span className="font-medium">{job.status}</span> ({job.progress}%)
              </p>
            ))}
            {version && version.qualityChecks.length > 0 && (
              <ul className="mt-3 space-y-1">
                {version.qualityChecks.map((qc) => (
                  <li key={qc.id} className="flex items-start gap-2 text-xs">
                    <span
                      className={`mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full ${
                        qc.status === "PASS" ? "bg-green-600" : "bg-red-600"
                      }`}
                    />
                    <span>
                      <span className="font-medium">{qc.check}</span>: {qc.status}
                      {qc.measured && (
                        <span className="text-slate-500">
                          {" "}
                          — measured {qc.measured}, expected {qc.expected}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Approval</h2>
            <div className="mb-3 flex gap-2">
              <select
                aria-label="Approver"
                value={approverId}
                onChange={(e) => setApproverId(e.target.value)}
                className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              >
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.displayName} ({m.role.toLowerCase().replaceAll("_", " ")})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={requestApproval}
                disabled={!version || project.status !== "DRAFT_READY"}
                className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-700 disabled:opacity-50"
              >
                Request approval
              </button>
            </div>
            {project.status === "AWAITING_APPROVAL" && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => decide("APPROVE")}
                  className="rounded-md bg-green-700 px-3 py-1.5 text-sm text-white hover:bg-green-600"
                >
                  {t("review.approve")}
                </button>
                <button
                  type="button"
                  onClick={() => decide("REQUEST_CHANGES")}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                >
                  {t("review.requestChanges")}
                </button>
                <button
                  type="button"
                  onClick={() => decide("REJECT")}
                  className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700"
                >
                  {t("review.reject")}
                </button>
              </div>
            )}
            {outputs && outputs.length > 0 && (
              <div className="mt-4 space-y-1">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("export.title")}</h3>
                {outputs.map((o) => (
                  <a
                    key={o.mediaAssetId}
                    href={o.downloadUrl}
                    className="block text-sm text-blue-700 underline"
                    download
                  >
                    {t("export.download")}: {o.fileName}
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Comments</h2>
          <ul className="mb-4 space-y-2">
            {comments.map((c) => (
              <li key={c.id} className={`rounded border p-2 text-sm ${c.resolved ? "border-slate-100 opacity-60" : "border-slate-200"}`}>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {c.author.displayName}
                    {c.timecodeMs !== null && <span className="ml-2 font-mono">{formatTimecode(c.timecodeMs)}</span>}
                  </span>
                  {!c.resolved && (
                    <button
                      type="button"
                      className="text-slate-400 hover:underline"
                      onClick={() => api(`/comments/${c.id}/resolve`, { method: "POST" }).then(refresh)}
                    >
                      Resolve
                    </button>
                  )}
                </div>
                {c.body}
              </li>
            ))}
            {comments.length === 0 && <li className="text-sm text-slate-400">—</li>}
          </ul>
          <div className="space-y-2">
            <textarea
              aria-label={t("review.addComment")}
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              rows={2}
              placeholder={t("review.addComment")}
              className="w-full rounded border border-slate-200 px-2 py-1 text-sm"
            />
            <div className="flex gap-2">
              <input
                aria-label="Timecode (seconds)"
                value={commentTimecode}
                onChange={(e) => setCommentTimecode(e.target.value)}
                placeholder="mm:ss at (seconds)"
                inputMode="decimal"
                className="w-36 rounded border border-slate-200 px-2 py-1 text-sm"
              />
              <button
                type="button"
                onClick={addComment}
                className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
              >
                {t("review.addComment")}
              </button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
