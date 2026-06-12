# ImmoMail — Agent IA Email pour agences immobilières

SaaS B2B : un agent IA se connecte à la boîte Gmail d'une agence immobilière,
**classe** les emails entrants, **rédige des brouillons** de réponse à valider, et
**répond automatiquement** uniquement pour les cas sans risque (accusés de réception).

Stack : Next.js (App Router) · Prisma + Postgres (Neon) · NextAuth · Gmail API ·
API Anthropic (Claude) · déploiement Vercel.

---

## 🌙 Où en est le projet (récap de la nuit)

### ✅ Fait et vérifié (le build passe sans erreur)

**Phase 1 — Fondations**
- Schéma de base complet (Agency, User, Mailbox, EmailMessage, Draft, AutomationRule, UsageLog)
- Connexion email/mot de passe **réparée** (NextAuth en sessions JWT) + Google sign-in
- OAuth Gmail (connexion d'une boîte, tokens chiffrés AES-256)
- Ingestion des emails (cron `/api/cron/process-emails`, idempotent)

**Phase 2 — L'agent IA**
- Classification Claude (catégories immo FR, extraction lead, JSON strict)
- Génération de brouillons (ton configurable, prompts immo)
- Moteur de règles + **règles par défaut créées à l'inscription** (préréglage prudent)
- **Auto-réponses sûres par template** (jamais de texte libre généré en envoi auto :
  respect de la règle d'or — rien d'engageant ne part tout seul)

**Phase 3 — Produit (en grande partie)**
- **Dashboard** : emails traités, leads, auto-réponses, temps économisé, répartition
  par catégorie, activité récente
- **File de validation** : email d'origine + réponse proposée, Approuver / Modifier /
  Rejeter en un clic (envoi via Gmail)
- **Règles & Paramètres** : toggles par catégorie, ton, signature, connexion Gmail
- **Onboarding** d'accueil
- **Landing page**, page **Tarifs** (3 plans), **politique de confidentialité** RGPD
- **Données de démo** (`/api/dev/seed`) pour visualiser l'app sans brancher Gmail

### ⏳ Reste à faire
- **Mise en ligne Vercel** : le déploiement automatique ne se déclenchait pas
  (voir ci-dessous). Le code, lui, compile parfaitement.
- **Stripe** (paiement réel) : à faire ensemble, nécessite ton compte Stripe.
- Tests en conditions réelles (vraie boîte Gmail + clé Anthropic).

---

## 🚀 Mettre en ligne (à faire au réveil)

Le projet Vercel `immomail` est créé, branché sur la branche `claude/cool-gauss-0nxro9`,
avec les variables d'environnement. Pour déclencher un déploiement à jour :

1. Ouvre dans ton navigateur le **Deploy Hook** (il construit la dernière version) :
   `https://api.vercel.com/v1/integrations/deploy/prj_Xb9uazI9B3R9zTshr9l3Om3b1Zj9/tEMUudeCvf`
   → tu dois voir `{"job":{"state":"PENDING"}}`
2. Attends 2-3 minutes.
3. Ouvre **https://immomail.vercel.app** :
   - Si tu vois la landing **ImmoMail** → c'est en ligne ! Va sur `/register`.
   - Sinon, regarde les déploiements et envoie le message d'erreur à Claude.

Une fois connecté : sur le dashboard vide, clique **« Charger des données de
démonstration »** pour voir l'agent en action immédiatement.

---

## 🔑 Variables d'environnement

Voir `.env.example`. Indispensables pour tourner en ligne :
`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ENCRYPTION_KEY` (64 hex),
`GOOGLE_CLIENT_ID/SECRET` (Gmail), `ANTHROPIC_API_KEY` (IA), `CRON_SECRET`.

---

## 🧠 Règle d'or (sécurité produit)

Tout ce qui engage l'agence (prix, dispo d'un bien, RDV, négociation) **ne part
jamais automatiquement**. Les auto-réponses utilisent des **templates figés**
(accusés de réception) ; l'IA générative ne sert que pour les brouillons relus par
un humain. Cette contrainte est codée en dur dans `/api/cron/process-emails`.
