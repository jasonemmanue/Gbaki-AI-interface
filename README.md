# G-baki — Frontend Next.js

> Interface utilisateur du manuel numérique ENSEA Data Science Club

## 🚀 Démarrage rapide

```bash
npm install
cp .env.local.example .env.local
# Éditer .env.local avec l'URL de votre API Django
npm run dev
```

## 📁 Structure des pages

```
/ → /auth/login → /auth/register
               ↓
    1er login → /onboarding (choix filière + niveau, 3 étapes)
    Login normal → /dashboard
               ↓
    Recherche filtrée automatiquement par filière/niveau
    Pas de sélecteurs manuels de classe dans le dashboard
'''
gbaki-searcher/
├── public/
│   └── 👉 logo.png  ← COPIEZ VOTRE FICHIER ICI
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                    → redirige vers /auth/login
│   ├── auth/
│   │   ├── auth.module.css         ← CSS partagé des 3 pages auth
│   │   ├── login/page.tsx          → /auth/login
│   │   ├── register/page.tsx       → /auth/register
│   │   └── forgot-password/page.tsx → /auth/forgot-password
│   ├── onboarding/
│   │   ├── page.tsx                → /onboarding (1er login)
│   │   └── onboarding.module.css
│   └── dashboard/
│       ├── page.tsx                → /dashboard
│       └── dashboard.module.css

## 🔌 Connexion à l'API

Toutes les requêtes utilisent `NEXT_PUBLIC_API_URL` (défaut: `http://localhost:8000/api`).

| Action | Endpoint API |
|---|---|
| Recherche documents | `GET /api/documents/?search=...` |
| Filtrer par classe | `GET /api/documents/?class_id=...` |
| Filtrer par type | `GET /api/documents/?document_type_id=...` |
| Liste classes | `GET /api/classes/` |
| Liste matières | `GET /api/subjects/` |
| Liste années | `GET /api/academic-years/` |
| Ajouter document | `POST /api/documents/` |

Les commentaires `// TODO:` dans le code marquent les endroits à brancher sur l'API réelle.

## 🎨 Design system

- **Font** : Plus Jakarta Sans (Google Fonts)
- **Primary** : `#1a56db` (bleu ENSEA)
- **Accent** : `#0ea5e9`
- **Background** : `#eef3fb`
- **Surface** : `#ffffff`
- CSS Variables dans `globals.css`

## 📱 Responsive

- ✅ Desktop (> 900px) : sidebar fixe + contenu scrollable
- ✅ Tablette (640–900px) : sidebar en overlay avec hamburger
- ✅ Mobile (< 640px) : layout empilé, grid 1 colonne


cd gbaki-searcher && npm install && npm run dev  # → http://localhost:3000