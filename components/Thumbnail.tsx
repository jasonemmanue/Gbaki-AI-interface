'use client'
/* Aperçu de la 1re page d'un document ; à défaut, une page factice avec le format du fichier. */
import { useEffect, useState } from 'react'
import s from './thumbnail.module.css'
import { fileExt } from './format'
import { thumbnailUrl, type Document } from '../lib/api'

type Doc = Pick<Document, 'id' | 'title' | 'file_name' | 'is_folder' | 'has_thumbnail' | 'class_info'>

export default function Thumbnail({ doc, fallbackText }: { doc: Doc; fallbackText: string }) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>(doc.has_thumbnail ? 'loading' : 'error')

  useEffect(() => { setState(doc.has_thumbnail ? 'loading' : 'error') }, [doc.id, doc.has_thumbnail])

  return (
    <div className={s.frame}>
      {doc.has_thumbnail && state !== 'error' && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={doc.id}
          src={thumbnailUrl(doc.id)}
          alt={`Première page : ${doc.title}`}
          className={`${s.img} ${state === 'ok' ? s.imgVisible : ''}`}
          onLoad={() => setState('ok')}
          onError={() => setState('error')}
        />
      )}
      {state !== 'ok' && (
        <div className={`${s.paper} ${state === 'loading' ? s.loading : ''}`}>
          <div className={s.paperHead}>ENSEA · {doc.class_info?.code ?? ''}</div>
          <div className={s.paperTitle}>{doc.title}</div>
          <div className={s.line} /><div className={s.line} /><div className={s.lineShort} />
          <div className={s.box} />
          <div className={s.line} /><div className={s.lineShort} />
          {state === 'error' && <div className={s.format}>{fileExt(doc)} · {fallbackText}</div>}
        </div>
      )}
    </div>
  )
}
