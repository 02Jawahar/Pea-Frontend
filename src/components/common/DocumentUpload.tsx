import { CloudDownload, FileCheck2, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'

import { cn } from '@/utils/cn'
import { Button } from './primitives'

export interface DocumentSpec {
  id: string
  label: string
  /** Permitted formats, e.g. ['PDF', 'JPG']. */
  formats: string[]
  maxKb: number
  required?: boolean
  digilocker?: boolean
}

export interface UploadedDoc {
  specId: string
  fileName: string
  sizeKb: number
  source: 'Upload' | 'DigiLocker'
}

/**
 * `<DocumentUpload>` — drag/drop, type + size validation shown *before* upload,
 * a DigiLocker "Fetch instead" option (Ref. 25), preview, replace, remove.
 */
export function DocumentUpload({
  spec,
  value,
  onChange,
  readOnly,
}: {
  spec: DocumentSpec
  value?: UploadedDoc
  onChange: (doc: UploadedDoc | undefined) => void
  readOnly?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function accept(file: File) {
    const extension = file.name.split('.').pop()?.toUpperCase() ?? ''
    const sizeKb = Math.round(file.size / 1024)

    // Validate before transmit, per the spec.
    if (!spec.formats.includes(extension)) {
      setError(`${extension || 'This file'} is not permitted. Allowed: ${spec.formats.join(', ')}.`)
      return
    }
    if (sizeKb > spec.maxKb) {
      setError(`File is ${sizeKb} KB. The limit for this document is ${spec.maxKb} KB.`)
      return
    }

    setError(null)
    onChange({ specId: spec.id, fileName: file.name, sizeKb, source: 'Upload' })
  }

  if (value) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-green-100 bg-green-050 px-3 py-2.5">
        <FileCheck2 className="size-4 shrink-0 text-green-600" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-navy-900">{spec.label}</p>
          <p className="truncate text-[12px] text-grey-600">
            {value.fileName} · {value.sizeKb} KB · via {value.source}
          </p>
        </div>
        {!readOnly && (
          <div className="flex gap-1">
            <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
              Replace
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Remove ${spec.label}`}
              onClick={() => onChange(undefined)}
            >
              <Trash2 className="size-4 text-red-600" />
            </Button>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) accept(file)
          }}
        />
      </div>
    )
  }

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          const file = event.dataTransfer.files?.[0]
          if (file) accept(file)
        }}
        className={cn(
          'rounded-md border border-dashed px-3 py-3 transition-colors',
          dragging ? 'border-navy-700 bg-blue-050' : 'border-grey-300 bg-white',
          error && 'border-red-600',
        )}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-navy-900">
              {spec.label}
              {spec.required && <span className="ml-0.5 text-red-600">*</span>}
            </p>
            <p className="text-[12px] text-grey-600">
              {spec.formats.join(' / ')} · max {spec.maxKb} KB · drag a file here or browse
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
              <Upload className="size-3.5" />
              Upload
            </Button>
            {spec.digilocker && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  onChange({
                    specId: spec.id,
                    fileName: `${spec.label.replace(/\s+/g, '_')}_DigiLocker.pdf`,
                    sizeKb: 184,
                    source: 'DigiLocker',
                  })
                }
              >
                <CloudDownload className="size-3.5" />
                Fetch from DigiLocker
              </Button>
            )}
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          hidden
          accept={spec.formats.map((format) => `.${format.toLowerCase()}`).join(',')}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) accept(file)
          }}
        />
      </div>

      {error && (
        <p className="mt-1 text-[12px] text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
