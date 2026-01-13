import Papa from 'papaparse'

export default function ExportButton({ summary, disabled }) {
  const handleExport = () => {
    if (!summary || summary.length === 0) {
      alert('No summary data to export')
      return
    }

    // Convert summary to CSV format
    const csvData = summary.map(section => ({
      Section: section.section,
      Content: section.content
    }))

    const csv = Papa.unparse(csvData)
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `visual-direction-summary-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <button
      onClick={handleExport}
      disabled={disabled}
      className={`
        px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center gap-2 mx-auto
        ${disabled
          ? 'bg-custom-dark-400 text-custom-dark-600 cursor-not-allowed'
          : 'bg-custom-white text-custom-black hover:bg-custom-light-100 active:bg-custom-light-200'
        }
      `}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Export CSV
    </button>
  )
}

