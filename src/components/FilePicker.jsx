import { useState } from 'react'
import { ACCEPTED_EXTENSIONS, MAX_FILE_MB } from '../files/fileTypes.js'

export default function FilePicker({ file, onChange }) {
  const [dragging, setDragging] = useState(false)

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files[0]) onChange(e.dataTransfer.files[0])
  }

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-indigo-100 text-xs font-semibold text-indigo-700 uppercase">
          {file.name.split('.').pop().slice(0, 4)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900" dir="auto">
            {file.name}
          </p>
          <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="rounded-lg px-2 py-1 text-sm font-medium text-slate-500 hover:bg-slate-200 hover:text-slate-900"
        >
          Remove
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
      className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors focus-within:ring-2 focus-within:ring-indigo-500/30 ${
        dragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-slate-400'
      }`}
    >
      <input
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(',')}
        onChange={(e) => onChange(e.target.files[0] ?? null)}
        className="sr-only"
      />
      <svg className="mb-1 size-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0-4 4m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      </svg>
      <span className="text-sm text-slate-700">
        Drop a file here or <span className="font-medium text-indigo-600">browse</span>
      </span>
      <span className="text-xs text-slate-500">PDF, Word, text or image · up to {MAX_FILE_MB} MB</span>
    </label>
  )
}

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
