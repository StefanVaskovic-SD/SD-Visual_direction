export default function SummaryDisplay({ summary }) {
  if (!summary || summary.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100 mb-6">Visual Direction Summary</h2>
      {summary.map((section, index) => (
        <div
          key={index}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <h3 className="text-xl font-semibold text-gray-100 mb-3">
            {section.section}
          </h3>
          <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
            {section.content}
          </div>
        </div>
      ))}
    </div>
  )
}

