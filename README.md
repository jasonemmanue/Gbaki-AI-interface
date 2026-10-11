# Gbaki-AI — Interface étudiant

> « Gbaki-AI la mémoire de l'excellence » : la bibliothèque de la filière AS de l'ENSEA.
> Porté par l'ENSEA Data Science Club.

Next.js 14 (App Router), consomme l'API Django `Gbaki-backend`.
En production : https://gbaki-user-production.up.railway.app (service Railway `Gbaki-user`).

## Démarrage

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
```

`.env.local` (voir `.env.local.example`) :

```env
NEXT_PUBLIC_API_URL=https://gbaki-backend-production-link.up.railway.app/api
```

## Écrans

| Route | Écran |
|---|---|
| `/auth` | Connexion / inscription. **Seules les adresses `nom@ensea.edu.ci` sont acceptées** |
| `/forgot`, `/reset` | Mot de passe oublié (code par email) |
| `/onboarding` | Choix de la classe à la 1re connexion (AS1, AS2, AS3 pour le moment) |
| `/dashboard` | Accueil : bandeau, accès recherche et IA, derniers documents de la classe |
| `/dashboard/documents` | Documents de la classe : filtres (matière, enseignant, année, type), tableau paginé, aperçu de la 1re page, ouvrir / télécharger, dossiers-projets |
| `/dashboard/recherche` | Recherche intelligente dans le texte des documents : page, ligne, correspondances exactes / proches, correction des fautes, lecteur de page |
| `/dashboard/assistant` | Assistant IA : mise en page prête, pas encore branché sur un modèle (renvoie vers la recherche) |
| `/settings` | Classe, compte, apparence |

Thèmes : clair, sombre, bleu nuit (Paramètres → Apparence). Langue : FR / EN (bouton de l'en-tête).

## Structure

```
app/
  layout.tsx              polices Barlow, thème, langue
  globals.css             variables des 3 thèmes
  dashboard/
    layout.tsx            barre latérale + en-tête, vérification de session
    page.tsx              accueil
    documents/            liste + panneau d'aperçu
    recherche/            recherche plein texte
    assistant/            assistant IA (à venir)
components/               icônes, vignette, contexte du tableau de bord, utilitaires
context/                  ThemeContext (3 thèmes), LangContext (FR/EN)
lib/api.ts                client de l'API Django
public/                   logo, logo ENSEA Data Science Club, illustration du bandeau
```

L'illustration du bandeau (`public/hero.png`) est recadrée depuis la maquette : à remplacer par
l'image d'origine en haute définition.

## Déploiement

```bash
railway up --service Gbaki-user --ci
```

Build via le `Dockerfile`. Garder Next.js à jour : Railway refuse les versions vulnérables
(voir `DEPLOY_RAILWAY.md` du backend).
