/*
 * gbaki-searcher/app/page.tsx
 * Stockage : gbaki-searcher/app/page.tsx
 *
 * Point d'entrée de l'application.
 * Redirige vers /auth qui affiche login/register/forgot-password.
 */
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/auth')
}