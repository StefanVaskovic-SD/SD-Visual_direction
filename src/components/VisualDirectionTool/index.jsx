import { useState } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import FileUploader from './FileUploader'
import SummaryDisplay from './SummaryDisplay'
import ExportButton from './ExportButton'
import {
  parseQuestionnaireCSV,
  parsePersonasCSV,
  validateQuestionnaireCSV,
  validatePersonasCSV
} from './utils/csvParser'
import {
  buildCompanyBusinessPrompt,
  buildTargetAudiencePrompt,
  buildCustomerJourneyPrompt,
  buildWebsiteGoalsPrompt,
  buildDesignBrandingPrompt
} from './utils/promptBuilder'

export default function VisualDirectionTool() {
  const [activeTab, setActiveTab] = useState('upload')
  const [questionnaireFile, setQuestionnaireFile] = useState(null)
  const [personasFile, setPersonasFile] = useState(null)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [questionnaireError, setQuestionnaireError] = useState('')
  const [personasError, setPersonasError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState([])
  const [questionnaireData, setQuestionnaireData] = useState(null)
  const [personasData, setPersonasData] = useState(null)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [showSidebarArrow, setShowSidebarArrow] = useState(false)
  
  // Get API key from .env file only
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ''

  const handleQuestionnaireFile = async (file) => {
    setQuestionnaireError('')
    setQuestionnaireFile(file)
    
    try {
      const text = await file.text()
      await validateQuestionnaireCSV(text)
      const parsed = await parseQuestionnaireCSV(text)
      setQuestionnaireData(parsed)
    } catch (error) {
      setQuestionnaireError(error.message)
      setQuestionnaireFile(null)
      setQuestionnaireData(null)
    }
  }

  const handlePersonasFile = async (file) => {
    setPersonasError('')
    setPersonasFile(file)
    
    try {
      const text = await file.text()
      await validatePersonasCSV(text)
      const parsed = await parsePersonasCSV(text)
      setPersonasData(parsed)
    } catch (error) {
      setPersonasError(error.message)
      setPersonasFile(null)
      setPersonasData(null)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB'
    return (bytes / (1024 * 1024)).toFixed(1) + 'MB'
  }

  const generateSummary = async () => {
    // Validate inputs
    if (!questionnaireFile) {
      setQuestionnaireError('Please upload a questionnaire CSV file')
      return
    }
    
    if (!personasFile) {
      setPersonasError('Please upload a personas CSV file')
      return
    }

    if (!apiKey) {
      alert('Please add VITE_GEMINI_API_KEY to your .env file')
      return
    }

    setIsLoading(true)
    setSummary([])
    setActiveTab('preview') // Switch to preview tab to show loading state

    try {
      // Parse CSV files
      const questionnaireText = await questionnaireFile.text()
      const personasText = await personasFile.text()
      
      const questionnaireParsed = await parseQuestionnaireCSV(questionnaireText)
      const personasParsed = await parsePersonasCSV(personasText)

      // Initialize Gemini
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.3, // Lower temperature for more factual, less creative responses
          topP: 0.8,
        }
      })

      // Generate each section
      const sections = []

      // 1. Company & Business
      try {
        const prompt1 = buildCompanyBusinessPrompt(questionnaireParsed, websiteUrl)
        const result1 = await model.generateContent(prompt1)
        const response1 = await result1.response
        sections.push({
          section: 'COMPANY & BUSINESS',
          content: response1.text()
        })
      } catch (error) {
        console.error('Error generating Company & Business:', error)
        sections.push({
          section: 'COMPANY & BUSINESS',
          content: `Error generating content: ${error.message}`
        })
      }

      // 2. Target Audience & User Personas
      try {
        const prompt2 = buildTargetAudiencePrompt(questionnaireParsed, personasParsed)
        const result2 = await model.generateContent(prompt2)
        const response2 = await result2.response
        sections.push({
          section: 'TARGET AUDIENCE & USER PERSONAS',
          content: response2.text()
        })
      } catch (error) {
        console.error('Error generating Target Audience:', error)
        sections.push({
          section: 'TARGET AUDIENCE & USER PERSONAS',
          content: `Error generating content: ${error.message}`
        })
      }

      // 3. Customer Journey
      try {
        const prompt3 = buildCustomerJourneyPrompt(questionnaireParsed)
        const result3 = await model.generateContent(prompt3)
        const response3 = await result3.response
        sections.push({
          section: 'CUSTOMER JOURNEY',
          content: response3.text()
        })
      } catch (error) {
        console.error('Error generating Customer Journey:', error)
        sections.push({
          section: 'CUSTOMER JOURNEY',
          content: `Error generating content: ${error.message}`
        })
      }

      // 4. Website Goals
      try {
        const prompt4 = buildWebsiteGoalsPrompt(questionnaireParsed)
        const result4 = await model.generateContent(prompt4)
        const response4 = await result4.response
        sections.push({
          section: 'WEBSITE GOALS',
          content: response4.text()
        })
      } catch (error) {
        console.error('Error generating Website Goals:', error)
        sections.push({
          section: 'WEBSITE GOALS',
          content: `Error generating content: ${error.message}`
        })
      }

      // 5. Design & Branding
      try {
        const prompt5 = buildDesignBrandingPrompt(questionnaireParsed)
        const result5 = await model.generateContent(prompt5)
        const response5 = await result5.response
        sections.push({
          section: 'DESIGN & BRANDING',
          content: response5.text()
        })
      } catch (error) {
        console.error('Error generating Design & Branding:', error)
        sections.push({
          section: 'DESIGN & BRANDING',
          content: `Error generating content: ${error.message}`
        })
      }

      setSummary(sections)
    } catch (error) {
      console.error('Error generating summary:', error)
      alert(`Error generating summary: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 h-screen overflow-hidden">
      <div className="flex h-full relative">
        {/* Sidebar */}
        <div 
          className={`
            bg-gray-900 border-r border-gray-800 hidden lg:block transition-all duration-300 ease-in-out h-full
            ${sidebarVisible ? 'w-80' : 'w-0 overflow-hidden'}
          `}
          onMouseEnter={() => !sidebarVisible && setShowSidebarArrow(true)}
          onMouseLeave={() => setShowSidebarArrow(false)}
        >
          <div className="p-6 h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-50">Instructions</h2>
              </div>
              <button
                onClick={() => setSidebarVisible(false)}
                className="text-gray-400 hover:text-gray-200 transition-colors p-1 rounded hover:bg-gray-800"
                title="Hide sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
            
            {/* Arrow to show sidebar when hidden - appears on hover */}
            {!sidebarVisible && showSidebarArrow && (
              <button
                onClick={() => setSidebarVisible(true)}
                className="absolute top-4 right-0 translate-x-full bg-gray-900 border border-gray-800 border-l-0 rounded-r-lg p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-all z-10"
                title="Show sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            
            <ol className="space-y-4 text-gray-300">
              <li className="flex gap-3">
                <span className="flex-shrink-0 text-gray-300 font-medium">1.</span>
                <span>Upload your questionnaire CSV file</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 text-gray-300 font-medium">2.</span>
                <span>Upload your user personas CSV file</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 text-gray-300 font-medium">3.</span>
                <span>Optionally add website URL for analysis</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 text-gray-300 font-medium">4.</span>
                <span>Generate summary using AI</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 text-gray-300 font-medium">5.</span>
                <span>Download the results as CSV</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 bg-gray-950 overflow-y-auto transition-all duration-300`}>
          {/* Show sidebar button when sidebar is hidden */}
          {!sidebarVisible && (
            <button
              onClick={() => setSidebarVisible(true)}
              className="fixed top-4 left-4 z-20 bg-gray-900 border border-gray-800 rounded-lg p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-all"
              title="Show sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          <div className="mx-auto p-8 lg:p-10">
            {/* Header */}
            <div className="mb-10">
              <div className="flex flex-col items-center gap-5 mb-3 text-center">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Visual Direction Discovery Summary Tool</h1>
                  <p className="text-gray-400 text-lg">Upload questionnaire and personas CSVs to generate a visual direction brief</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-0 mb-8 border-b-2 border-gray-800">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-2 px-8 py-4 font-semibold transition-all relative ${
                  activeTab === 'upload'
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {activeTab === 'upload' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>
                )}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload & Generate
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                disabled={summary.length === 0}
                className={`flex items-center gap-2 px-8 py-4 font-semibold transition-all relative ${
                  activeTab === 'preview'
                    ? 'text-white'
                    : summary.length === 0
                    ? 'text-gray-700 cursor-not-allowed'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {activeTab === 'preview' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>
                )}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Preview Results
              </button>
              <button
                onClick={() => setActiveTab('download')}
                disabled={summary.length === 0}
                className={`flex items-center gap-2 px-8 py-4 font-semibold transition-all relative ${
                  activeTab === 'download'
                    ? 'text-white'
                    : summary.length === 0
                    ? 'text-gray-700 cursor-not-allowed'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {activeTab === 'download' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>
                )}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'upload' && (
              <div className="space-y-6">
                {/* Upload Fields Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Questionnaire CSV Upload */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-50 mb-3">Upload Questionnaire CSV</h3>
                    <FileUploader
                      label=""
                      onFileSelect={handleQuestionnaireFile}
                      accept=".csv"
                      error={questionnaireError}
                    />
                    {questionnaireFile && (
                      <div className="mt-3 p-3 bg-green-950/50 border-2 border-green-600/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-green-400 text-lg font-bold">✓</span>
                            <div>
                              <p className="text-green-400 font-semibold text-sm">CSV file loaded!</p>
                              {questionnaireData && (
                                <p className="text-xs text-gray-400 mt-0.5">Total rows: {questionnaireData.data.length}</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setQuestionnaireFile(null)
                              setQuestionnaireData(null)
                              setQuestionnaireError('')
                            }}
                            className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded hover:bg-gray-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="p-2 bg-gray-900/50 rounded text-xs text-blue-400">
                          File: {questionnaireFile.name} ({formatFileSize(questionnaireFile.size)})
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Personas CSV Upload */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-50 mb-3">Upload User Personas CSV</h3>
                    <FileUploader
                      label=""
                      onFileSelect={handlePersonasFile}
                      accept=".csv"
                      error={personasError}
                    />
                    {personasFile && (
                      <div className="mt-3 p-3 bg-green-950/50 border-2 border-green-600/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-green-400 text-lg font-bold">✓</span>
                            <div>
                              <p className="text-green-400 font-semibold text-sm">CSV file loaded!</p>
                              {personasData && (
                                <p className="text-xs text-gray-400 mt-0.5">Total personas: {personasData.length}</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setPersonasFile(null)
                              setPersonasData(null)
                              setPersonasError('')
                            }}
                            className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded hover:bg-gray-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="p-2 bg-gray-900/50 rounded text-xs text-blue-400">
                          File: {personasFile.name} ({formatFileSize(personasFile.size)})
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Website URL Input */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-50 mb-3">Website URL (Optional)</h3>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-800 rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateSummary}
                  disabled={isLoading || !questionnaireFile || !personasFile || !apiKey}
                  className={`
                    w-full py-5 px-8 rounded-xl font-bold text-lg transition-all shadow-lg
                    ${isLoading || !questionnaireFile || !personasFile || !apiKey
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed border-2 border-gray-800'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] shadow-blue-500/20'
                    }
                  `}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Generating Summary...
                    </span>
                  ) : (
                    'Generate Summary'
                  )}
                </button>

                {!apiKey && (
                  <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                    <p className="text-yellow-400 text-sm">
                      ⚠️ Please add VITE_GEMINI_API_KEY to your .env file to use this tool.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'preview' && (
              <div>
                {isLoading ? (
                  <div className="text-center py-20">
                    <div className="flex flex-col items-center gap-6">
                      <svg
                        className="animate-spin h-16 w-16 text-blue-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <div>
                        <p className="text-xl font-semibold text-gray-200 mb-2">Generating Summary...</p>
                        <p className="text-gray-400">This may take a few moments. Please wait.</p>
                      </div>
                    </div>
                  </div>
                ) : summary.length > 0 ? (
                  <SummaryDisplay summary={summary} />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No summary generated yet. Go to "Upload & Generate" tab to create one.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'download' && (
              <div className="text-center py-12">
                {summary.length > 0 ? (
                  <div className="space-y-6">
                    <div>
                      <svg className="w-16 h-16 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <h3 className="text-xl font-semibold text-gray-100 mb-2">Ready to Download</h3>
                      <p className="text-gray-400 mb-6">Your visual direction summary is ready to export as CSV.</p>
                    </div>
                    <ExportButton summary={summary} disabled={isLoading} />
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-400">No summary available to download. Generate a summary first.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
