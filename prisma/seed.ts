import { PrismaClient } from "@prisma/client";
import { ALL_EXERCISES } from "../lib/data/exercises";
import { ADMIN_EMAILS, PREMIUM_EMAILS, AFFILIATES } from "../lib/data/staff";

const prisma = new PrismaClient();

async function seedStaff() {
  // Admins : Premium + rôle admin.
  for (const email of ADMIN_EMAILS) {
    const e = email.trim().toLowerCase();
    await prisma.user.upsert({
      where: { email: e },
      create: { email: e, plan: "premium", role: "admin" },
      update: { plan: "premium", role: "admin" },
    });
  }

  // Accès gratuits sans affiliation : Premium simple.
  for (const email of PREMIUM_EMAILS) {
    const e = email.trim().toLowerCase();
    await prisma.user.upsert({
      where: { email: e },
      create: { email: e, plan: "premium" },
      update: { plan: "premium" },
    });
  }

  // Affiliés : Premium + rôle affilié + code de parrainage + compte lié.
  for (const a of AFFILIATES) {
    const email = a.email.trim().toLowerCase();
    const code = a.code.trim().toLowerCase();

    // Lien "maison" (bio du créateur) : suivi seul, pas de commission.
    if (a.house) {
      await prisma.affiliate.upsert({
        where: { code },
        create: { code, displayName: a.name, email, isHouse: true, couponId: a.couponId ?? null },
        update: { displayName: a.name, isHouse: true, couponId: a.couponId ?? null },
      });
      // Un lien maison NON-admin (ex: Samy payé au fixe) a droit à son tableau de
      // bord d'IMPACT (clics/inscrits/ventes/CA généré, sans commission) → on lui
      // donne le rôle affilié et on relie son compte. On NE touche PAS un email
      // admin : le lien "officiel" utilise l'email admin, on ne veut pas écraser
      // son rôle admin.
      const isAdminEmail = ADMIN_EMAILS.map((x) => x.trim().toLowerCase()).includes(email);
      if (!isAdminEmail) {
        const houseUser = await prisma.user.upsert({
          where: { email },
          create: { email, plan: "premium", role: "affiliate" },
          update: { role: "affiliate" },
        });
        await prisma.affiliate.update({ where: { code }, data: { userId: houseUser.id } });
      }
      continue;
    }

    const user = await prisma.user.upsert({
      where: { email },
      create: { email, plan: "premium", role: "affiliate" },
      update: { plan: "premium", role: "affiliate" },
    });
    const promoStartsAt = a.startDate ? new Date(`${a.startDate}T00:00:00Z`) : undefined;
    const launchWindowDays = a.launchWindowDays ?? null;
    await prisma.affiliate.upsert({
      where: { code },
      create: { code, displayName: a.name, email, userId: user.id, promoStartsAt, couponId: a.couponId ?? null, launchWindowDays },
      update: { displayName: a.name, email, userId: user.id, isHouse: false, promoStartsAt, couponId: a.couponId ?? null, launchWindowDays },
    });
  }
  console.log(
    `Staff : ${ADMIN_EMAILS.length} admin(s), ${PREMIUM_EMAILS.length} accès gratuit(s), ${AFFILIATES.length} affilié(s).`
  );
}

async function main() {
  console.log(`Seed de ${ALL_EXERCISES.length} exercices…`);
  for (const ex of ALL_EXERCISES) {
    await prisma.exercise.upsert({
      where: { slug: ex.slug },
      create: {
        slug: ex.slug,
        name: ex.name,
        category: ex.category,
        emoji: ex.emoji,
        description: ex.description,
        matchBenefit: ex.matchBenefit,
        steps: ex.steps,
        mistakes: ex.mistakes,
        breathing: ex.breathing ?? null,
        equipment: ex.equipment,
        smallSpaceFriendly: ex.smallSpaceFriendly,
        minAge: ex.minAge,
        positions: ex.positions,
        variantEasy: ex.variantEasy,
        variantHard: ex.variantHard,
        durationMin: ex.durationMin,
        isFree: ex.isFree ?? false,
      },
      update: {
        name: ex.name,
        category: ex.category,
        emoji: ex.emoji,
        description: ex.description,
        matchBenefit: ex.matchBenefit,
        steps: ex.steps,
        mistakes: ex.mistakes,
        breathing: ex.breathing ?? null,
        equipment: ex.equipment,
        smallSpaceFriendly: ex.smallSpaceFriendly,
        minAge: ex.minAge,
        positions: ex.positions,
        variantEasy: ex.variantEasy,
        variantHard: ex.variantHard,
        durationMin: ex.durationMin,
        isFree: ex.isFree ?? false,
      },
    });
  }
  await seedStaff();
  console.log("Seed terminé ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
