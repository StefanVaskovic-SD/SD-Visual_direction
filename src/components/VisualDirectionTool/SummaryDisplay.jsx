export default function SummaryDisplay({ summary }) {
  if (!summary || summary.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-custom-white mb-6">Visual Direction Summary</h2>
      {summary.map((section, index) => (
        <div
          key={index}
          className="bg-custom-black/50 rounded-lg p-6 border border-custom-black/50"
        >
          <h3 className="text-xl font-semibold text-custom-white mb-3">
            {section.section}
          </h3>
          <div className="text-custom-white/80 whitespace-pre-wrap leading-relaxed">
            {section.content}
          </div>
        </div>
      ))}
    </div>
  )
}

