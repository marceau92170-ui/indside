# Progressa ⚽ — Ton préparateur perso

App web d'entraînement foot personnalisé pour jeunes joueurs amateurs (13-17 ans, U14→U18).
Programme hebdomadaire individuel généré par IA à partir d'une **bibliothèque de 60 exercices
validés** (l'IA n'invente jamais un exercice), calé autour des entraînements club et du jour de
match, avec adaptation chaque semaine selon les retours du joueur.

**Modèle** : freemium — gratuit (1 séance générique/sem + 10 exercices) · Premium 8,99 €/mois ou
59 €/an (programme complet, adaptation hebdo, tests, carte joueur).

**Au-delà des séances** : objectifs personnels, carnet de match (buts/passes D./ressenti), suivi
santé (check-in de forme quotidien façon pro, courbe de croissance taille/poids, carnet de
douleurs avec alerte douce en cas de récidive), et des ressources vérifiées (la vraie filière
fédérale française, nutrition/hydratation, préparation mentale). Les douleurs non résolues sont
prises en compte par l'IA pour ne pas surcharger une zone sensible. Si le joueur ne peut pas
aller à son entraînement club/city, un bouton sur la séance la recompose à la volée avec des
exercices de la bibliothèque faisables en espace réduit (balcon, hall, petite cour) — jamais
d'exercice inventé, toujours le catalogue validé.

## Stack

- **Next.js 15 (App Router) + TypeScript**, déployé sur Vercel, **PWA** (installable, manifest + icônes générées par code)
- **Postgres** (Neon / Vercel Postgres) + **Prisma**
- **NextAuth** — magic link e-mail (zéro mot de passe), envoi via **Resend**
- **API Anthropic** (`claude-sonnet-4-6`) — génération/adaptation des programmes, côté serveur
  uniquement, sortie JSON validée **Zod**, fallback template si l'API est indisponible
- **Stripe** — Checkout + Customer Portal + webhook
- **Notifications push web** (`web-push`, VAPID) en plus des e-mails de rappel
- Illustrations d'exercices **animées en SVG/SMIL, dessinées à la main** (jamais générées par IA —
  un mouvement mal dessiné se corrige une fois pour toutes, une vidéo IA mal générée apprendrait
  un mauvais geste à chaque joueur qui la regarde)
- Direction artistique **« Carton rouge »** : asphalte quasi-noir `#0C0D0F`, accent unique rouge
  carton `#E12A3A`, typos Archivo Black / Barlow Condensed / Inter, carte joueur SVG partageable
  (partage natif Web Share API)

## Démarrage

```bash
npm install
cp .env.example .env   # remplir DATABASE_URL, NEXTAUTH_SECRET, ANTHROPIC_API_KEY…
npx prisma db push     # crée les tables
npm run db:seed        # seed des 60 exercices
npm run dev
```

Sans `RESEND_API_KEY`, le lien magique de connexion est affiché dans la console serveur.
En production, seed via `GET /api/admin/seed?secret=ADMIN_SECRET`.

Notifications push (optionnel) : `npx web-push generate-vapid-keys` puis renseigner
`NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT`. Sans ces variables,
l'app fonctionne normalement (les rappels restent envoyés par e-mail).

## Tests

```bash
npm test
```

Tests unitaires (Node test runner, zéro dépendance ajoutée) : calcul de catégorie/âge/persona,
intégrité de la bibliothèque de 60 exercices (pas de doublon, couverture illustrations à 100%),
et la garantie "les séances sont vraies" (rejet d'un slug halluciné hors catalogue).

## Structure

- `lib/data/` — les 60 exercices (technique, renforcement, explosivité, cardio, prévention, gardien)
- `lib/ai/generateProgram.ts` — prompt système strict (interdits 13-14 ans, calendrier club) + validation Zod + contrôle "slug dans le catalogue" (`assertSlugsInCatalog`, testé)
- `lib/program/templates.ts` — séance gratuite générique + fallback premium sans IA
- `lib/program/create.ts` — régénération d'un programme **sans jamais écraser une séance déjà validée** par le joueur
- `components/ExerciseIllustration.tsx` — 17 familles de mouvement animées, mappées sur les 60 exercices
- `app/onboarding` — questionnaire 8 écrans (catégorie U14-U18 auto, 13 ligues FFF, consentement parental < 15 ans), état persisté en localStorage (résiste à une fermeture d'onglet)
- `app/(app)/` — semaine, séance (timer + difficulté), historique des semaines passées, bibliothèque, tests, profil (carte joueur PNG + progression 6 mois + delta par test), réglages (dont notifications push)
- `app/(app)/objectifs`, `/matchs`, `/sante`, `/ressources` — développement du joueur au-delà des séances : objectifs, carnet de match, check-in de forme + croissance + douleurs, contenu éducatif (filière pro, nutrition, mental)
- `app/admin/stats` — tableau de bord interne (inscriptions, conversion Premium, séances loggées, badges) — 100% first-party, aucun tracker tiers. Accès : `?secret=ADMIN_SECRET`
- `app/api/cron/weekly` — régénération du dimanche soir (adaptation) · `app/api/cron/reminders` — rappel jour de séance (e-mail + push)
- `app/icon.tsx`, `app/apple-icon.tsx`, `app/opengraph-image.tsx`, `app/manifest.ts` — icônes et image de partage social générées par code (`next/og`), sans outil de génération d'image externe

## Crons Vercel

Configurés dans `vercel.json` (auth `Authorization: Bearer CRON_SECRET`) :
- `0 18 * * 0` — génération des programmes de la semaine suivante
- `0 15 * * *` — rappels de séance du jour (e-mail + push)

## Garde-fous coût / abus

- Régénération manuelle du programme (`/api/program/generate`) limitée à 1 fois toutes les 3h
  par utilisateur — évite le spam d'appels payants à l'API Anthropic.
- Toute régénération (manuelle ou cron hebdo) préserve les séances déjà validées par le joueur.

## RGPD / mineurs

Consentement parental obligatoire sous 15 ans (e-mail parent + case), données minimales, zéro
tracking tiers (y compris le tableau de bord interne, qui interroge uniquement notre propre base),
suppression de compte en 1 clic (cascade complète + annulation Stripe).
