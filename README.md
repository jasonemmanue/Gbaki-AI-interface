# GBAKI Searcher — Interface Étudiant

## Démarrage
```bash
cd gbaki_searcher
npm install
npm run dev   # → http://localhost:3000
```

## Structure
```
app/
  globals.css         # Variables CSS globales
  layout.tsx          # Root layout (fonts)
  page.tsx            # Redirect → /auth
  auth/
    page.tsx          # Login / Inscription
    auth.module.css   # Styles auth
  dashboard/
    page.tsx          # Dashboard principal (recherche, filtres, preview, téléchargement)
    user.module.css   # Styles dashboard
  onboarding/
    page.tsx          # Sélection filière (1ère connexion)
lib/
  api.ts              # Client API Django
public/
  logo.png            # Logo ENSEA DSC (à placer ici)
```

## Fonctionnalités
- Recherche full-text avec autocomplete
- Filtres : classe, matière, année, type de document
- Prévisualisation dans le navigateur (PDF, images, texte)
- Téléchargement direct dans le dossier Téléchargements
- Filtrage automatique par filière de l'étudiant
