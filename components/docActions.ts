/* Ouverture et téléchargement d'un document via les URLs signées du backend. */
import { apiGetDocumentUrl } from '../lib/api'

/** Ouvre le document dans un nouvel onglet (fenêtre créée tout de suite pour éviter le bloqueur). */
export async function openDocument(id: string, page?: number) {
  const win = window.open('', '_blank')
  try {
    const { url } = await apiGetDocumentUrl(id, 'preview')
    const target = page ? `${url}#page=${page}` : url
    if (win) win.location.href = target
    else window.location.href = target
  } catch (e) {
    win?.close()
    throw e
  }
}

export async function downloadDocument(id: string) {
  const { url, file_name } = await apiGetDocumentUrl(id, 'download')
  const a = document.createElement('a')
  a.href = url
  a.download = file_name
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
}
