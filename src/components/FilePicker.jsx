import { useState } from 'react'
import { ACCEPTED_EXTENSIONS, MAX_FILE_MB } from '../files/fileTypes.js'
import { useT } from '../i18n/language.js'
import { BookIcon, UploadIcon } from './icons.jsx'

export default function FilePicker({ file, onChange }) {
  const t = useT()
  const [dragging, setDragging] = useState(false)

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files[0]) onChange(e.dataTransfer.files[0])
  }

  if (file) {
    return (
      <div className="rise-in flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50/60 p-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100">
          <BookIcon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900" dir="auto">
            {file.name}
          </p>
          <p className="text-xs text-slate-500" dir="ltr">
            {file.name.split('.').pop().toUpperCase()} · {formatSize(file.size)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 hover:bg-white hover:text-slate-900"
        >
          {t.changeFile}
        </button>
      </div>
    )
  }

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`group flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors focus-within:ring-2 focus-within:ring-indigo-500/30 ${
        dragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/40'
      }`}
    >
      <input
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(',')}
        onChange={(e) => onChange(e.target.files[0] ?? null)}
        className="sr-only"
      />
      <span className="mb-2 grid size-12 place-items-center rounded-full bg-indigo-100 text-indigo-600 transition-transform group-hover:-translate-y-0.5">
        <UploadIcon className="size-6" />
      </span>
      <span className="text-sm text-slate-700">
        <span className="font-semibold text-indigo-600">{t.chooseFile}</span> {t.orDrop}
      </span>
      <span className="text-xs text-slate-500">{t.fileFormats(MAX_FILE_MB)}</span>
    </label>
  )
}

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
