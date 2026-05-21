'use client'

import { useState } from 'react'
import { Eye, X, Download } from 'lucide-react'

interface Props {
  url: string
  nama: string
}

export function SertifikatPreview({ url, nama }: Props) {
  const [open, setOpen] = useState(false)
  const isPdf = url.toLowerCase().split('?')[0].endsWith('.pdf')

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
      >
        <Eye size={12} /> Lihat sertifikat
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 text-sm truncate pr-2">
                Sertifikat — {nama}
              </h3>
              <div className="flex items-center gap-1 flex-shrink-0">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download size={16} />
                </a>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-slate-100 p-2">
              {isPdf ? (
                <iframe
                  src={url}
                  className="w-full h-[70vh] rounded bg-white"
                  title={`Sertifikat ${nama}`}
                />
              ) : (
                <img
                  src={url}
                  alt={`Sertifikat ${nama}`}
                  className="w-full h-auto rounded"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
