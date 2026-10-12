# Mass Protocol

App perso de prise de masse sur 12 mois : programme muscu en 5 phases avec surcharge progressive,
plan repas qui s'adapte à l'objectif calorique (et au padel), liste de courses, suivi du poids, photos,
mensurations, bilans hebdo. Installable sur iPhone comme une app (PWA). Interface en français ou en anglais.

**Stack** : Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase (Postgres + Auth + Storage) · Vercel.

## Lancer en local

```bash
npm install
npm run dev
```

Sans variables Supabase, l'app tourne entièrement sur l'appareil (localStorage + IndexedDB) : rien à configurer
pour l'essayer. Le profil par défaut (âge, taille, poids, objectif) est dans `lib/metrics/index.ts` → `defaultState`,
et se change dans l'onglet Profil.

## Avec ton propre Supabase

1. Crée un projet Supabase et exécute les fichiers de `supabase/migrations/` dans l'ordre (éditeur SQL).
2. Copie `.env.example` en `.env.local` et remplis l'URL, la clé anon et ton email (`ALLOWED_EMAIL` limite la connexion à toi).
   Le relais de connexion iPhone et l'appairage d'appareils ont aussi besoin de `SUPABASE_SERVICE_ROLE_KEY` côté serveur.
3. Dans Supabase → Auth → URL Configuration, mets l'URL de ton site et ajoute `https://ton-domaine/**` aux redirections.

Déploiement : `vercel deploy`, avec les mêmes variables d'environnement.

## Code

- `lib/program`, `lib/nutrition`, `lib/metrics` : moteurs purs (programme, repas, scores), testés (`npm test`).
- `lib/data` : couche de persistance (local ou Supabase), synchro hors-ligne d'abord.
- `lib/i18n` : tous les textes, `fr.ts` et `en.ts`.
- `components/` et `app/` : interface. `mass-protocol.jsx` : la V1 d'origine, gardée comme référence.

Objectifs caloriques et protéiques = estimations de suivi, pas un avis médical.
