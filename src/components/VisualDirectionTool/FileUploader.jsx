import { useState, useRef } from 'react'

export default function FileUploader({ label, onFileSelect, accept, error }) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = (file) => {
    // Don't set fileName here - it will be shown in success message below
    onFileSelect(file)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-custom-white/80 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <div
          className={`
            border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
            transition-all duration-200
            ${isDragging 
              ? 'border-red-500 bg-red-950/30 scale-[1.02]' 
              : error 
              ? 'border-red-500 bg-red-950/20' 
              : 'border-custom-black/50 bg-custom-black/30 hover:border-custom-black/70 hover:bg-custom-black/40'
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
          />
          <div className="flex items-center gap-4">
            {/* Cloud Upload Icon */}
            <svg
              className={`flex-shrink-0 h-8 w-8 ${isDragging ? 'text-red-400' : 'text-custom-white/50'} transition-colors`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <div className="flex-1 text-left">
              <div className="text-custom-white/80 text-sm font-medium">
                Drag and drop file here
              </div>
              <p className="text-xs text-custom-white/40 mt-0.5">
                Limit 200MB per file • CSV
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={handleClick}
          className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-custom-black/50 hover:bg-custom-black/70 text-custom-white/80 hover:text-custom-white rounded-lg text-xs font-semibold transition-all border border-custom-black/50 hover:border-custom-black/70"
        >
          Browse files
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}
