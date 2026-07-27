/** English interface strings. Keys are stable identifiers — never hardcode UI text (spec §39). */
export const en = {
  "app.title": "Virtual Studio",
  "nav.projects": "Projects",
  "nav.newProject": "New project",
  "nav.signOut": "Sign out",

  "auth.signIn": "Sign in",
  "auth.email": "Email address",
  "auth.password": "Password",
  "auth.error.invalid": "That email address or password is not recognised",

  "project.create.title": "Create a project",
  "project.create.name": "Project name",
  "project.create.template": "Programme template",
  "project.create.language": "Language",
  "project.create.formats": "Output formats",
  "project.create.submit": "Create project",
  "project.status.DRAFT": "Draft",
  "project.status.READY_FOR_RECORDING": "Ready to record",
  "project.status.RECORDING": "Recording",
  "project.status.UPLOADING": "Uploading",
  "project.status.PROCESSING": "Processing",
  "project.status.DRAFT_READY": "Draft ready",
  "project.status.CHANGES_REQUESTED": "Changes requested",
  "project.status.AWAITING_APPROVAL": "Awaiting approval",
  "project.status.APPROVED": "Approved",
  "project.status.EXPORTING": "Exporting",
  "project.status.COMPLETED": "Completed",
  "project.status.ARCHIVED": "Archived",
  "project.status.FAILED": "Something went wrong",

  "language.mode.EN_ONLY": "English only",
  "language.mode.CY_ONLY": "Welsh only",
  "language.mode.SEPARATE": "Separate English and Welsh videos",
  "language.mode.BILINGUAL": "Bilingual video",

  "record.start": "Record",
  "record.stop": "Stop",
  "record.retake": "Retake",
  "record.accept": "Accept take",
  "record.review": "Review",
  "record.ready": "You are ready to record",

  "review.approve": "Approve",
  "review.reject": "Reject",
  "review.requestChanges": "Request changes",
  "review.addComment": "Add a comment",

  "export.download": "Download",
  "export.title": "Export",

  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.loading": "Loading…",
} as const;

export type MessageKey = keyof typeof en;
