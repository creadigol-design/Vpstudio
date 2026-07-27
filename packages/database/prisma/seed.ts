/**
 * Development seed: one demo organisation with users for each core role,
 * a workspace, and the recommended first programme format (spec §46).
 * Run with: pnpm --filter @virtual-studio/database seed
 */
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("demo-password", 10);

  const org = await prisma.organisation.upsert({
    where: { slug: "demo-org" },
    update: {},
    create: { name: "Demo Organisation", slug: "demo-org" },
  });

  const workspace =
    (await prisma.workspace.findFirst({ where: { organisationId: org.id, name: "Communications" } })) ??
    (await prisma.workspace.create({ data: { organisationId: org.id, name: "Communications" } }));

  const users: Array<{ email: string; displayName: string; role: string }> = [
    { email: "admin@demo.example", displayName: "Demo Admin", role: "ORG_ADMIN" },
    { email: "creator@demo.example", displayName: "Demo Creator", role: "CREATOR" },
    { email: "reviewer@demo.example", displayName: "Demo Reviewer", role: "REVIEWER" },
    { email: "presenter@demo.example", displayName: "Demo Presenter", role: "PRESENTER" },
  ];
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { email: u.email, displayName: u.displayName, passwordHash },
    });
    await prisma.membership.upsert({
      where: { userId_organisationId: { userId: user.id, organisationId: org.id } },
      update: { role: u.role },
      create: { userId: user.id, organisationId: org.id, role: u.role },
    });
  }

  // Platform-level template: the recommended first programme format (spec §46).
  const existing = await prisma.programmeTemplate.findFirst({ where: { name: "Presenter update", organisationId: null } });
  if (!existing) {
    await prisma.programmeTemplate.create({
      data: {
        name: "Presenter update",
        description:
          "Opening title, presenter introduction, three presenter sections, optional insert, call to action, closing title.",
        versions: {
          create: {
            version: 1,
            published: true,
            definition: {
              aspectRatios: ["16:9", "9:16"],
              items: [
                { type: "opening", position: 1, required: true },
                { type: "presenter", position: 2, required: true },
                { type: "presenter", position: 3, required: true },
                { type: "presenter", position: 4, required: true },
                { type: "image", position: 5, required: false },
                { type: "call_to_action", position: 6, required: false },
                { type: "closing", position: 7, required: true },
              ],
            },
          },
        },
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log("Seeded demo organisation, users (password: demo-password) and template.");
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
