import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { isPremium } from "@/lib/plan";
import { TEST_TYPES } from "@/lib/constants";
import { ProgressChart } from "@/components/ProgressChart";
import { TestRecorder } from "@/components/TestRecorder";
import { Card, ButtonLink } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function TestsPage() {
  const user = await currentUser();
  if (!user) return null;
  const premium = isPremium(user);

  const results = await prisma.testResult.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <h1 className="mb-1 font-condensed text-3xl font-bold uppercase">Tests</h1>
      <p className="mb-5 text-sm text-muted">
        4 tests auto-mesurés, à refaire toutes les 4 semaines. C&apos;est ta preuve de progression
        — en chiffres.
      </p>

      {!premium && (
        <Card className="mb-5 border-glow/30">
          <p className="mb-2 text-sm">
            Les tests et le suivi de progression font partie de Premium.
          </p>
          <ButtonLink href="/premium" size="sm">
            Débloquer les tests
          </ButtonLink>
        </Card>
      )}

      <div className="space-y-4">
        {TEST_TYPES.map((t) => {
          const history = results.filter((r) => r.testType === t.key);
          const values = history.map((r) => r.value);
          const lowerIsBetter = "lowerIsBetter" in t && Boolean(t.lowerIsBetter);
          const best = values.length
            ? lowerIsBetter
              ? Math.min(...values)
              : Math.max(...values)
            : null;
          const latest = values.length ? values[values.length - 1] : null;

          return (
            <Card key={t.key}>
              <div className="mb-1 flex items-center justify-between">
                <h2 className="font-condensed text-xl font-bold uppercase">
                  {t.emoji} {t.label}
                </h2>
                {latest !== null && (
                  <p className="tnum font-condensed text-2xl font-bold text-glow">
                    {Number(latest.toFixed(1))} <span className="text-xs text-muted">{t.unit}</span>
                  </p>
                )}
              </div>
              <p className="mb-3 text-xs text-muted">{t.protocol}</p>

              {values.length >= 2 && (
                <div className="mb-3">
                  <ProgressChart values={values} lowerIsBetter={lowerIsBetter} />
                </div>
              )}
              {best !== null && values.length >= 2 && (
                <p className="tnum mb-3 text-xs text-muted">
                  Record : <span className="font-bold text-chalk">{Number(best.toFixed(1))} {t.unit}</span> · {values.length} mesures
                </p>
              )}

              <TestRecorder testType={t.key} unit={t.unit} locked={!premium} />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
