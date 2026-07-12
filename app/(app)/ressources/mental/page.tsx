import Link from "next/link";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function MentalPage() {
  return (
    <div>
      <Link href="/ressources" className="mb-3 inline-block text-sm text-muted underline">
        ← Retour aux ressources
      </Link>
      <h1 className="mb-1 font-condensed text-3xl font-bold uppercase">Préparation mentale</h1>
      <p className="mb-5 text-sm text-muted">
        Le physique et la technique se travaillent au city. La tête se travaille partout, tout le
        temps — et c&apos;est souvent ce qui fait la différence entre deux joueurs de même niveau.
      </p>

      <div className="space-y-4 text-sm leading-relaxed [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:font-condensed [&_h2]:text-lg [&_h2]:font-bold [&_h2]:uppercase [&_h2]:text-glow">
        <h2>Avant le match : ta routine</h2>
        <p>
          Les meilleurs joueurs ont un rituel fixe avant de jouer — pas superstitieux, juste
          répétitif : mêmes gestes d&apos;échauffement, même ordre. Ça envoie un signal clair au
          cerveau : &laquo; c&apos;est le moment de jouer &raquo;. Construis le tien et garde-le.
        </p>

        <h2>Gérer la pression : la respiration</h2>
        <p>
          Une technique simple, utilisable n&apos;importe où (vestiaire, banc, avant un tir au but) :
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Inspire par le nez pendant 4 secondes</li>
          <li>Retiens l&apos;air 4 secondes</li>
          <li>Souffle lentement par la bouche pendant 6 secondes</li>
        </ul>
        <p>
          Répète 3 à 4 fois. Le souffle plus long que l&apos;inspiration active le système qui
          calme le corps — c&apos;est physiologique, pas dans la tête.
        </p>

        <h2>La visualisation</h2>
        <p>
          Avant un geste technique (un penalty, un centre, une prise de balle sous pression),
          prends 10 secondes pour te voir le réussir dans ta tête — précisément, comme si tu le
          regardais en vidéo. Les joueurs qui font ça régulièrement exécutent le geste avec plus de
          fluidité, parce que le cerveau a déjà &laquo; répété &raquo;.
        </p>

        <h2>Concentre-toi sur ce que tu contrôles</h2>
        <p>
          Tu ne contrôles pas si l&apos;arbitre siffle juste, si ton coéquipier fait la bonne passe,
          ou si tu es titulaire ce week-end. Tu contrôles ton placement, ton intensité, ta
          communication, ton attitude après une erreur. Recentre-toi là-dessus quand le match part
          mal — c&apos;est la seule chose qui dépend vraiment de toi.
        </p>

        <h2>L&apos;échec est une information, pas un jugement</h2>
        <p>
          Un mauvais geste, une défaite, un entraîneur qui ne te fait pas jouer : ce n&apos;est pas
          une preuve que tu es mauvais, c&apos;est une information sur ce qu&apos;il reste à
          travailler. Les joueurs qui progressent vite sont ceux qui posent la question &laquo;
          qu&apos;est-ce que ça m&apos;apprend ? &raquo; plutôt que &laquo; qu&apos;est-ce que ça dit
          de moi ? &raquo;.
        </p>

        <Card className="border-glow/30">
          <p>
            Concrètement dans l&apos;app : note &laquo; un truc à travailler &raquo; après chaque
            match dans ton{" "}
            <Link href="/matchs" className="text-glow underline">
              carnet de match
            </Link>
            . C&apos;est exactement cette habitude — transformer chaque match en information utile
            pour la suite.
          </p>
        </Card>
      </div>
    </div>
  );
}
