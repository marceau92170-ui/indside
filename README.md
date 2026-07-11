# Progressa ⚽ — Ton préparateur perso

App web d'entraînement foot personnalisé pour jeunes joueurs amateurs (13-17 ans, U14→U18).
Programme hebdomadaire individuel généré par IA à partir d'une **bibliothèque de 60 exercices
validés** (l'IA n'invente jamais un exercice), calé autour des entraînements club et du jour de
match, avec adaptation chaque semaine selon les retours du joueur.

**Modèle** : freemium — gratuit (1 séance générique/sem + 10 exercices) · Premium 8,99 €/mois ou
59 €/an (programme complet, adaptation hebdo, tests, carte joueur).

## Stack

- **Next.js 15 (App Router) + TypeScript**, déployé sur Vercel
- **Postgres** (Neon / Vercel Postgres) + **Prisma**
- **NextAuth** — magic link e-mail (zéro mot de passe), envoi via **Resend**
- **API Anthropic** (`claude-sonnet-4-6`) — génération/adaptation des programmes, côté serveur
  uniquement, sortie JSON validée **Zod**, fallback template si l'API est indisponible
- **Stripe** — Checkout + Customer Portal + webhook
- Direction artistique **« Carton rouge »** : asphalte quasi-noir `#0C0D0F`, accent unique rouge
  carton `#E12A3A`, typos Archivo Black / Barlow Condensed / Inter, carte joueur SVG partageable

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

## Structure

- `lib/data/` — les 60 exercices (technique, renforcement, explosivité, cardio, prévention, gardien)
- `lib/ai/generateProgram.ts` — prompt système strict (interdits 13-14 ans, calendrier club) + validation Zod + contrôle "slug dans le catalogue"
- `lib/program/templates.ts` — séance gratuite générique + fallback premium sans IA
- `app/onboarding` — questionnaire 8 écrans (catégorie U14-U18 auto, 13 ligues FFF, consentement parental < 15 ans)
- `app/(app)/` — semaine, séance (timer + difficulté), bibliothèque, tests, profil (carte joueur PNG), réglages
- `app/api/cron/weekly` — régénération du dimanche soir (adaptation) · `app/api/cron/reminders` — rappel jour de séance

## Crons Vercel

Configurés dans `vercel.json` (auth `Authorization: Bearer CRON_SECRET`) :
- `0 18 * * 0` — génération des programmes de la semaine suivante
- `0 15 * * *` — rappels de séance du jour

## RGPD / mineurs

Consentement parental obligatoire sous 15 ans (e-mail parent + case), données minimales, zéro
tracking tiers, suppression de compte en 1 clic (cascade complète + annulation Stripe).
