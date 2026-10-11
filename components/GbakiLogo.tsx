/**
 * Logo Gbaki-AI (anneau, jambage à crochet, point bleu), redessiné en SVG d'après public/logo.png.
 * Le trait prend la couleur du texte (currentColor) : il reste visible dans tous les thèmes.
 */
export default function GbakiLogo({ size = 34, className, title }: { size?: number; className?: string; title?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="232 225 605 605"
      role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <circle cx="510" cy="520" r="182" fill="none" stroke="currentColor" strokeWidth="47" />
      <path d="M688 362 V690 C688 752 660 781 610 781 H543" fill="none" stroke="currentColor"
        strokeWidth="47" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="738" cy="286" r="36" fill="#5468f2" />
    </svg>
  )
}
