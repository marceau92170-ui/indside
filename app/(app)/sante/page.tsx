import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { WellnessForm } from "@/components/WellnessForm";
import { BodyMeasurementTracker } from "@/components/BodyMeasurementTracker";
import { PainLogTracker } from "@/components/PainLogTracker";

export const dynamic = "force-dynamic";

function today(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export default async function SantePage() {
  const user = await currentUser();
  if (!user) return null;

  const [checkin, measurements, painEntries] = await Promise.all([
    prisma.wellnessCheckin.findUnique({ where: { userId_date: { userId: user.id, date: today() } } }),
    prisma.bodyMeasurement.findMany({ where: { userId: user.id }, orderBy: { date: "asc" }, take: 20 }),
    prisma.painLog.findMany({ where: { userId: user.id }, orderBy: { date: "desc" }, take: 20 }),
  ]);

  return (
    <div>
      <Link href="/profil" className="mb-3 inline-block text-sm text-muted underline">
        ← Retour au profil
      </Link>
      <h1 className="mb-1 font-condensed text-3xl font-bold uppercase">Suivi santé</h1>
      <p className="mb-5 text-sm text-muted">
        Ce que fait un vrai staff de préparation physique : mesurer avant de deviner.
      </p>

      <div className="space-y-4">
        <WellnessForm
          today={
            checkin
              ? {
                  sleepHours: checkin.sleepHours,
                  sleepQuality: checkin.sleepQuality,
                  energy: checkin.energy,
                  soreness: checkin.soreness,
                  mood: checkin.mood,
                }
              : null
          }
        />
        <BodyMeasurementTracker history={measurements.map((m) => ({ heightCm: m.heightCm, weightKg: m.weightKg }))} />
        <PainLogTracker
          entries={painEntries.map((p) => ({
            id: p.id,
            bodyPart: p.bodyPart,
            intensity: p.intensity,
            note: p.note,
            resolved: p.resolved,
            date: p.date.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
