import { useState, useEffect } from 'react'
import PrescriptionBuilder from './PrescriptionBuilder'
import ReportPreviewModal from '../../shared/components/ReportPreviewModal'
import abhaData from '../../data/abhaFhirMock.json';
import { API_BASE_URL } from '../../config/constants';

// Helper function to format markdown text to HTML
const formatMarkdown = (text) => {
  if (!text) return text;
  
  // Convert ## headings to <h3>
  let formatted = text.replace(/^## (.+)$/gm, '<h3 class="text-lg font-bold text-gray-900 mt-3 mb-2">$1</h3>');
  
  // Convert **text** to <strong>text</strong>
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
  
  // Convert *text* to <em>text</em>
  formatted = formatted.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
  
  // Convert bullet points
  formatted = formatted.replace(/^\* (.+)$/gm, '<li class="ml-4 mb-1">• $1</li>');
  
  // Wrap consecutive list items in <ul>
  formatted = formatted.replace(/(<li class="ml-4 mb-1">.*<\/li>\n?)+/g, '<ul class="my-2">$&</ul>');
  
  // Convert line breaks to <br>
  formatted = formatted.replace(/\n/g, '<br>');
  
  return formatted;
};


function PatientDetailView({ patient, onBack }) {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [showPdf, setShowPdf] = useState(false)
  const [otpValue, setOtpValue] = useState("")
  const [aiSummary, setAiSummary] = useState('')
  const [isLoadingSummary, setIsLoadingSummary] = useState(true)
  const [aiOverview, setAiOverview] = useState('')
  const [isLoadingOverview, setIsLoadingOverview] = useState(true)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [showPDFModal, setShowPDFModal] = useState(false)
  const [currentReport, setCurrentReport] = useState(null)

  // Get patient data from ABHA
  const patientData = abhaData[patient.abhaId]
  const isUnidentified = patient.isUnidentified || false

  useEffect(() => {
    // Auto-unlock for unidentified emergency patients (no OTP required)
    if (isUnidentified) {
      setIsUnlocked(true)
    }

    // Generate AI summary when component loads
    const generateSummary = async () => {
      setIsLoadingSummary(true)
      try {
        const patientData = abhaData[patient.abhaId]
        console.log('🔍 Generating summary for patient:', patient.name)
        console.log('📤 Sending request to:', `${API_BASE_URL}/api/generate-patient-summary`)
        
        const response = await fetch(`${API_BASE_URL}/api/generate-patient-summary`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ patientData })
        })

        console.log('📥 Response status:', response.status)
        const data = await response.json()
        console.log('✅ Summary received:', data.summary?.substring(0, 50) + '...')
        setAiSummary(data.summary)
      } catch (error) {
        console.error('❌ Summary generation error:', error)
        setAiSummary('Failed to generate AI summary. Please refresh.')
      } finally {
        setIsLoadingSummary(false)
      }
    }

    // Generate AI overview for patient details
    const generateOverview = async () => {
      setIsLoadingOverview(true)
      try {
        const patientData = abhaData[patient.abhaId]
        console.log('🔍 Generating AI overview for patient:', patient.name)
        
        const response = await fetch(`${API_BASE_URL}/api/generate-patient-overview`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ patientData })
        })

        const data = await response.json()
        console.log('✅ Overview received')
        setAiOverview(data.overview)
      } catch (error) {
        console.error('❌ Overview generation error:', error)
        setAiOverview('Failed to generate AI overview. Please refresh.')
      } finally {
        setIsLoadingOverview(false)
      }
    }

    generateSummary()
    generateOverview()
  }, [patient.abhaId])

  const handleUnlock = () => {
    setIsUnlocked(true)
    setShowOtpModal(false)
  }

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return

    const userMessage = { role: 'user', content: chatInput }
    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsChatLoading(true)

    try {
      const patientData = abhaData[patient.abhaId]
      console.log('💬 Sending chat message:', chatInput)
      console.log('📤 Sending request to:', `${API_BASE_URL}/api/doctor-chat`)
      
      const response = await fetch(`${API_BASE_URL}/api/doctor-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: chatInput,
          patientData
        })
      })

      console.log('📥 Chat response status:', response.status)
      const data = await response.json()
      console.log('✅ AI reply received:', data.reply?.substring(0, 50) + '...')
      
      const aiMessage = { role: 'ai', content: data.reply }
      setChatMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('❌ Chat error:', error)
      const errorMessage = { role: 'ai', content: 'Failed to get AI response. Please try again.' }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsChatLoading(false)
    }
  }

  const handleChatKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleChatSubmit()
    }
  }

  const handleGeneratePDF = async (report) => {
    try {
      setCurrentReport(report)
      setShowPDFModal(true)
    } catch (error) {
      alert(`Failed to preview report: ${error.message}`)
    }
  }

  const handleClosePDFModal = () => {
    setShowPDFModal(false)
    setCurrentReport(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-lg sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <span>←</span>
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">👤</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {patient.name}
                </h1>
                <p className="text-sm text-gray-500">Patient ID: {patient.id}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl shadow-sm">
              <span className="text-amber-700 font-semibold text-sm flex items-center space-x-2">
                <span>⏰</span>
                <span>Data Auto-Deletes in 24h</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {isUnidentified && patientData?.temporaryStatus && (
        <div className="bg-gradient-to-r from-red-50 via-orange-50 to-pink-50 border-b-2 border-red-300 shadow-lg">
          <div className="max-w-[1920px] mx-auto px-6 py-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-3xl">⚠️</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-900 mb-3 flex items-center space-x-2">
                  <span>Unidentified Emergency Patient</span>
                  <span className="px-3 py-1 bg-red-200 text-red-800 text-xs font-bold rounded-full">URGENT</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-red-200 shadow-md">
                    <p className="text-sm text-red-800 mb-2">
                      <strong className="text-red-900">Reason:</strong> {patientData.temporaryStatus.reason}
                    </p>
                    <p className="text-sm text-red-800">
                      <strong className="text-red-900">Admission:</strong> {patientData.admissionDetails?.circumstances}
                    </p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-red-200 shadow-md">
                    <p className="text-sm font-semibold text-red-900 mb-2">Next Steps:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {patientData.temporaryStatus.nextSteps.slice(0, 2).map((step, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-red-600 flex-shrink-0">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="text-sm text-red-700 font-semibold mt-3 flex items-center space-x-2">
                  <span>ℹ️</span>
                  <span>{patientData.temporaryStatus.dataRetention}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1920px] mx-auto px-6 py-8">
        {/* Top Section - AI Overview Cards in Horizontal Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* AI Triage Brief */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 p-6 transform transition-all duration-300 hover:shadow-3xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Triage Brief
                </h2>
                <p className="text-xs text-gray-500">Quick patient summary</p>
              </div>
            </div>
            
            {isLoadingSummary ? (
              <div className="flex items-center space-x-2 py-8">
                <div className="animate-pulse text-blue-600 text-2xl">🔄</div>
                <p className="text-sm text-blue-700">Analyzing patient data with AI...</p>
              </div>
            ) : (
              <div 
                className="text-base text-gray-800 leading-relaxed max-h-64 overflow-y-auto pr-2 custom-scrollbar"
                dangerouslySetInnerHTML={{ __html: formatMarkdown(aiSummary) }}
              />
            )}
          </div>

          {/* AI Patient Analysis */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 p-6 transform transition-all duration-300 hover:shadow-3xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  AI Patient Analysis
                </h2>
                <p className="text-xs text-gray-500">Comprehensive health overview</p>
              </div>
            </div>
            
            {isLoadingOverview ? (
              <div className="flex items-center space-x-2 py-8">
                <div className="animate-pulse text-green-600 text-2xl">🔄</div>
                <p className="text-sm text-green-700">AI is analyzing complete patient profile...</p>
              </div>
            ) : aiOverview ? (
              <div 
                className="text-base text-gray-800 leading-relaxed max-h-64 overflow-y-auto pr-2 custom-scrollbar"
                dangerouslySetInnerHTML={{ __html: formatMarkdown(aiOverview) }}
              />
            ) : (
              <div className="text-sm text-red-600 py-8">
                Failed to generate AI overview. Please check backend logs or refresh the page.
              </div>
            )}
          </div>
        </div>

        {/* Quick Reference Bar */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl shadow-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-around">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🩸</span>
              <div>
                <div className="text-xs text-gray-500">Blood Group</div>
                <div className="text-sm font-bold text-gray-900">{patientData?.bloodGroup}</div>
              </div>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">👤</span>
              <div>
                <div className="text-xs text-gray-500">Age</div>
                <div className="text-sm font-bold text-gray-900">{patientData?.age} years</div>
              </div>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⚧</span>
              <div>
                <div className="text-xs text-gray-500">Gender</div>
                <div className="text-sm font-bold text-gray-900">{patientData?.gender}</div>
              </div>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📋</span>
              <div>
                <div className="text-xs text-gray-500">Reports</div>
                <div className="text-sm font-bold text-gray-900">{patientData?.reports?.length || 0} available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 p-6 transform transition-all duration-300 hover:shadow-3xl">
              {!isUnlocked ? (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl">🔒</span>
                    </div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      Protected Health Information (PHI)
                    </h2>
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-5 mb-6 shadow-md">
                    <p className="text-sm text-yellow-900 font-medium flex items-center space-x-2">
                      <span className="text-xl">⚠️</span>
                      <span>This section contains sensitive medical history. Patient consent required via OTP.</span>
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ask CivicMind AI about locked history...
                      </label>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="e.g., Does patient have diabetes?"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
                      />
                    </div>

                    <button
                      onClick={() => setShowOtpModal(true)}
                      className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      <span className="text-xl">🔓</span>
                      <span>Request 1-Hour Access (Send OTP)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl">🔓</span>
                      </div>
                      <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Protected Health Information
                      </h2>
                    </div>
                    {isUnidentified ? (
                      <div className="px-4 py-2 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl shadow-md">
                        <span className="text-red-700 font-bold text-sm flex items-center space-x-1">
                          <span>🚨</span>
                          <span>Emergency Access - No Consent Required</span>
                        </span>
                      </div>
                    ) : (
                      <div className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl shadow-md">
                        <span className="text-green-700 font-bold text-sm flex items-center space-x-1">
                          <span>⏱️</span>
                          <span>Expires In: 59:59</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {isUnidentified && (
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-5 mb-6 shadow-md">
                      <p className="text-sm text-orange-900 font-medium flex items-center space-x-2">
                        <span className="text-xl">ℹ️</span>
                        <span>Emergency override active: Full access granted for unidentified patient care. All actions are logged for compliance.</span>
                      </p>
                    </div>
                  )}

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                        <span className="text-lg">💬</span>
                        <span>Ask AI about this patient</span>
                      </label>
                      
                      {chatMessages.length > 0 && (
                        <div className="mb-4 max-h-80 overflow-y-auto space-y-3 p-5 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-gray-200 shadow-inner">
                          {chatMessages.map((msg, idx) => (
                            <div key={idx} className={`${msg.role === 'user' ? 'text-right' : 'text-left'} animate-fadeIn`}>
                              <div className={`inline-block max-w-[85%] p-4 rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105 ${
                                msg.role === 'user' 
                                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
                                  : 'bg-white border-2 border-gray-200 text-gray-800'
                              }`}>
                                <div 
                                  className="text-base whitespace-pre-wrap leading-relaxed"
                                  dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                                />
                              </div>
                            </div>
                          ))}
                          {isChatLoading && (
                            <div className="text-left animate-pulse">
                              <div className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200 p-4 rounded-2xl shadow-lg">
                                <p className="text-sm text-purple-700 flex items-center space-x-2">
                                  <span className="animate-spin">🤖</span>
                                  <span>AI is analyzing...</span>
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleChatSubmit()
                            }
                          }}
                          placeholder="e.g., What are the patient's allergies?"
                          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
                        />
                        <button 
                          onClick={handleChatSubmit}
                          disabled={!chatInput.trim() || isChatLoading}
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                        >
                          Ask AI
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t-2 border-gray-200 pt-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                        <span className="text-xl">📋</span>
                      </div>
                      <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                        Medical Records & Reports
                      </h3>
                    </div>

                    {!showPdf ? (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 rounded-xl p-5 border-2 border-blue-300 shadow-lg">
                          <div className="text-sm font-semibold text-blue-900 mb-4 flex items-center justify-between">
                            <span className="flex items-center space-x-2">
                              <span className="text-lg">📄</span>
                              <span>Available Reports</span>
                            </span>
                            <span className="text-xs bg-gradient-to-r from-blue-200 to-cyan-200 px-3 py-1 rounded-full font-bold shadow-sm">
                              {patientData?.reports?.length || 0} reports
                            </span>
                          </div>
                          {patientData?.reports && patientData.reports.length > 0 ? (
                            <div className="space-y-3">
                              {patientData.reports.slice(0, 3).map((report, idx) => (
                                <div key={idx} className="text-sm text-gray-700 bg-white/90 backdrop-blur-sm p-4 rounded-xl border-2 border-blue-200 shadow-md hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                                  <div className="font-bold text-blue-900 flex items-center space-x-2">
                                    <span className="text-base">📊</span>
                                    <span>{report.type}</span>
                                  </div>
                                  <div className="text-xs text-gray-600 mt-2 flex items-center space-x-3">
                                    <span className="flex items-center space-x-1">
                                      <span>📅</span>
                                      <span>{report.date}</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <span>🏥</span>
                                      <span>{report.department}</span>
                                    </span>
                                  </div>
                                  <div className="text-xs mt-2 text-gray-700 bg-blue-50 p-2 rounded-lg">{report.summary}</div>
                                </div>
                              ))}
                              {patientData.reports.length > 3 && (
                                <div className="text-xs text-gray-600 text-center py-2 bg-white/50 rounded-lg">
                                  + {patientData.reports.length - 3} more reports available
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 text-center py-4">No reports available</div>
                          )}
                        </div>

                        <div className="pt-2">
                          <button
                            onClick={() => setShowPdf(true)}
                            className="w-full px-6 py-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-700 hover:via-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                          >
                            <span className="text-xl">📄</span>
                            <span>View Complete Medical Records</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl p-8 min-h-96 flex flex-col shadow-2xl border-2 border-gray-700">
                          <div className="text-center mb-6 pb-6 border-b-2 border-gray-700">
                            <div className="text-5xl mb-4 animate-pulse">📄</div>
                            <div className="text-white font-bold text-xl mb-2">Medical Reports: {patientData?.name}</div>
                            <div className="text-gray-300 text-sm bg-gray-700/50 inline-block px-4 py-2 rounded-lg">
                              ABHA ID: {patient.abhaId}
                            </div>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                            {patientData?.reports && patientData.reports.map((report, idx) => (
                              <div key={idx} className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-5 text-left border-2 border-gray-600 shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105">
                                <div className="flex items-center space-x-2 mb-3">
                                  <span className="text-2xl">📊</span>
                                  <div className="text-white font-bold text-lg">{report.type}</div>
                                </div>
                                <div className="text-gray-300 text-sm mb-3 space-y-1 bg-gray-800/50 p-3 rounded-lg">
                                  <div className="flex items-center space-x-2">
                                    <span>📅</span>
                                    <span>Date: {report.date}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span>🏥</span>
                                    <span>Department: {report.department}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span>👨‍⚕️</span>
                                    <span>Provider: {report.provider}</span>
                                  </div>
                                </div>
                                <div className="text-gray-400 text-sm mb-2 bg-gray-900/50 p-3 rounded-lg">
                                  <strong className="text-cyan-400">Summary:</strong> {report.summary}
                                </div>
                                {report.doctorNotes && (
                                  <div className="text-gray-400 text-sm border-t-2 border-gray-600 pt-3 mt-3 bg-gray-900/50 p-3 rounded-lg">
                                    <strong className="text-purple-400">Doctor's Notes:</strong> {report.doctorNotes}
                                  </div>
                                )}
                                <button
                                  onClick={() => handleGeneratePDF(report)}
                                  className="w-full mt-4 px-4 py-3 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                  <span>Preview Report</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => setShowPdf(false)}
                          className="w-full px-6 py-4 bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 hover:from-gray-700 hover:via-gray-800 hover:to-gray-900 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                        >
                          <span className="text-xl">✕</span>
                          <span>Close Reports View</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <PrescriptionBuilder />
        </div>
      </div>

      {showOtpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 scale-100 hover:scale-105">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                <span className="text-4xl">🔐</span>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Enter Patient OTP
              </h2>
              <p className="text-gray-600 font-medium">Unlock Private Records for 1 Hour</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">4-Digit OTP Code</label>
              <input
                type="text"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                maxLength="4"
                placeholder="0000"
                className="w-full px-4 py-4 text-center text-3xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 tracking-widest shadow-lg transition-all duration-200 hover:shadow-xl"
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={handleUnlock}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 hover:from-green-700 hover:via-emerald-700 hover:to-green-800 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span className="text-xl">✓</span>
                <span>Verify & Unlock</span>
              </button>
              <button
                onClick={() => setShowOtpModal(false)}
                className="w-full px-6 py-4 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 font-bold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Preview Modal */}
      <ReportPreviewModal
        isOpen={showPDFModal}
        onClose={handleClosePDFModal}
        report={currentReport}
        patientData={patientData}
      />
    </div>
  )
}

export default PatientDetailView
