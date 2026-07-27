import type { MessageKey } from "./en";

/** Welsh interface strings. Same keys as the English catalog (spec §39). */
export const cy: Record<MessageKey, string> = {
  "app.title": "Stiwdio Rithwir",
  "nav.projects": "Prosiectau",
  "nav.newProject": "Prosiect newydd",
  "nav.signOut": "Allgofnodi",

  "auth.signIn": "Mewngofnodi",
  "auth.email": "Cyfeiriad e-bost",
  "auth.password": "Cyfrinair",
  "auth.error.invalid": "Nid yw'r cyfeiriad e-bost neu'r cyfrinair yn cael ei adnabod",

  "project.create.title": "Creu prosiect",
  "project.create.name": "Enw'r prosiect",
  "project.create.template": "Templed rhaglen",
  "project.create.language": "Iaith",
  "project.create.formats": "Fformatau allbwn",
  "project.create.submit": "Creu prosiect",
  "project.status.DRAFT": "Drafft",
  "project.status.READY_FOR_RECORDING": "Yn barod i recordio",
  "project.status.RECORDING": "Yn recordio",
  "project.status.UPLOADING": "Yn uwchlwytho",
  "project.status.PROCESSING": "Yn prosesu",
  "project.status.DRAFT_READY": "Drafft yn barod",
  "project.status.CHANGES_REQUESTED": "Gofynnwyd am newidiadau",
  "project.status.AWAITING_APPROVAL": "Yn aros am gymeradwyaeth",
  "project.status.APPROVED": "Cymeradwywyd",
  "project.status.EXPORTING": "Yn allforio",
  "project.status.COMPLETED": "Wedi'i gwblhau",
  "project.status.ARCHIVED": "Wedi'i archifo",
  "project.status.FAILED": "Aeth rhywbeth o'i le",

  "language.mode.EN_ONLY": "Saesneg yn unig",
  "language.mode.CY_ONLY": "Cymraeg yn unig",
  "language.mode.SEPARATE": "Fideos Cymraeg a Saesneg ar wahân",
  "language.mode.BILINGUAL": "Fideo dwyieithog",

  "record.start": "Recordio",
  "record.stop": "Stopio",
  "record.retake": "Ail-recordio",
  "record.accept": "Derbyn y recordiad",
  "record.review": "Adolygu",
  "record.ready": "Rydych yn barod i recordio",

  "review.approve": "Cymeradwyo",
  "review.reject": "Gwrthod",
  "review.requestChanges": "Gofyn am newidiadau",
  "review.addComment": "Ychwanegu sylw",

  "export.download": "Lawrlwytho",
  "export.title": "Allforio",

  "common.save": "Cadw",
  "common.cancel": "Canslo",
  "common.loading": "Wrthi'n llwytho…",
};
