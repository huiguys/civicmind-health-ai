import { useState, useEffect } from 'react'
import { usePatient } from '../../shared/context/PatientContext'
import { useSpeech } from '../../shared/hooks/useSpeech'
import ReportPreviewModal from '../../shared/components/ReportPreviewModal'
import ChatHistorySidebar from '../../components/patient/ChatHistorySidebar'
import { chatHistoryApi } from '../../api/chatHistoryApi'
import abhaData from '../../data/abhaFhirMock.json'
import { API_BASE_URL } from '../../config/constants'

// Helper function to format markdown text to HTML
const formatMarkdown = (text) => {
  if (!text) return text;
  
  // Convert ## headings to <h3>
  let formatted = text.replace(/^## (.+)$/gm, '<h3 class="text-xl font-bold text-gray-900 mt-4 mb-2">$1</h3>');
  
  // Convert **text** to <strong>text</strong>
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
  
  // Convert *text* to <em>text</em>
  formatted = formatted.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
  
  // Convert bullet points
  formatted = formatted.replace(/^\* (.+)$/gm, '<li class="ml-4 mb-2">• $1</li>');
  
  // Wrap consecutive list items in <ul>
  formatted = formatted.replace(/(<li class="ml-4 mb-2">.*<\/li>\n?)+/g, '<ul class="my-3">$&</ul>');
  
  // Convert line breaks to <br>
  formatted = formatted.replace(/\n/g, '<br>');
  
  return formatted;
};

function PatientDashboard() {
  const { currentPatient } = usePatient()
  const { isSpeaking, isLoading, speak } = useSpeech()
  const [activeTab, setActiveTab] = useState("overview")
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hello ${currentPatient?.name || 'there'}! 👋 I am your CivicMind AI Health Companion. I know your complete medical history and can help you with health questions. How can I help you today?`
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [healthSummary, setHealthSummary] = useState('')
  const [isLoadingSummary, setIsLoadingSummary] = useState(true)
  const [translatedSummary, setTranslatedSummary] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState('english')
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [showPDFModal, setShowPDFModal] = useState(false)
  const [currentReport, setCurrentReport] = useState(null)
  
  // Chat History State
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [isLoadingSession, setIsLoadingSession] = useState(false)
  const [hasLoadedExistingSessions, setHasLoadedExistingSessions] = useState(false)
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0)

  // Get patient data from ABHA - currentPatient IS the ABHA data
  const patientData = currentPatient
  
  // Get ABHA ID from the data
  const abhaId = patientData ? Object.keys(abhaData).find(id => abhaData[id] === patientData) : null

  useEffect(() => {
    // Generate AI health summary when component loads
    const generateHealthSummary = async () => {
      if (!patientData) {
        setIsLoadingSummary(false)
        return
      }
      
      setIsLoadingSummary(true)
      try {
        console.log('📤 Requesting health summary for:', patientData.name)
        const response = await fetch(`${API_BASE_URL}/api/patient-health-summary`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ patientData })
        })

        console.log('📥 Response status:', response.status)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('✅ Health summary received')
        setHealthSummary(data.summary)
      } catch (error) {
        console.error('❌ Health summary error:', error)
        // Fallback summary
        setHealthSummary(`**Your Health at a Glance** 👋

Welcome ${patientData.name}! Here's a quick overview of your health profile.

**What You Should Know** 💡
- Blood Group: ${patientData.bloodGroup}
- Age: ${patientData.age} years, ${patientData.gender}
- Chronic Conditions: ${patientData.conditions ? patientData.conditions.join(", ") : "None reported"}
- Allergies: ${patientData.allergies ? patientData.allergies.join(", ") : "None reported"}

**Your Care Plan** 💊
${patientData.medications && patientData.medications.length > 0 
  ? `You are currently taking: ${patientData.medications.join(", ")}`
  : "No active medications recorded"}

**Healthy Living Tips** 🌟
- Take your medications as prescribed
- Maintain a balanced diet
- Stay physically active
- Get regular check-ups

*Note: AI summary unavailable. Please check your connection and try again.*`)
      } finally {
        setIsLoadingSummary(false)
      }
    }

    generateHealthSummary()
  }, [patientData])

  const toggleSpeech = () => {
    const textToSpeak = currentLanguage === 'english' ? healthSummary : translatedSummary
    speak(textToSpeak, currentLanguage)
  }

  const translateSummary = async (targetLanguage) => {
    setIsTranslating(true)
    setShowLanguageMenu(false)
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/translate-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: healthSummary,
          targetLanguage: targetLanguage
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setTranslatedSummary(data.translation)
        setCurrentLanguage(targetLanguage)
      } else {
        throw new Error(data.error || 'Translation failed')
      }
    } catch (error) {
      console.error('Translation error:', error)
      alert('Translation failed. Please try again.')
    } finally {
      setIsTranslating(false)
    }
  }

  const switchToEnglish = () => {
    setCurrentLanguage('english')
    setShowLanguageMenu(false)
  }

  // Chat History Functions
  const generateConversationTitle = async (messages) => {
    try {
      // Get first user message for context
      const firstUserMsg = messages.find(m => m.role === 'user')
      if (!firstUserMsg) return 'New Conversation'
      
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Generate a short 3-5 word title for this conversation. User asked: "${firstUserMsg.text}". Reply with ONLY the title, nothing else.`,
          patientData: patientData
        })
      })

      const data = await response.json()
      // Clean up the title (remove quotes, extra text)
      let title = data.reply.replace(/['"]/g, '').trim()
      // Take first line if multiple lines
      title = title.split('\n')[0]
      // Limit to 50 characters
      if (title.length > 50) {
        title = title.substring(0, 47) + '...'
      }
      return title || 'Health Question'
    } catch (error) {
      console.error('Error generating title:', error)
      return 'Health Question'
    }
  }

  const createNewChatSession = async () => {
    try {
      // Update title in background (don't wait for it)
      if (currentSessionId && messages.length > 1) {
        // Fire and forget - update title in background
        generateConversationTitle(messages).then(title => {
          chatHistoryApi.updateTitle(currentSessionId, title).catch(err => 
            console.error('Error updating title:', err)
          )
        })
      }

      // Immediately create new session (don't wait for title update)
      const session = await chatHistoryApi.createSession(abhaId, 'New Conversation')
      setCurrentSessionId(session.sessionId)
      setMessages([
        {
          role: 'assistant',
          text: `Hello ${currentPatient?.name || 'there'}! 👋 I am your CivicMind AI Health Companion. I know your complete medical history and can help you with health questions. How can I help you today?`
        }
      ])
      
      // Refresh sidebar after a short delay to show updated list
      setTimeout(() => setSidebarRefreshTrigger(prev => prev + 1), 500)
    } catch (error) {
      console.error('Error creating chat session:', error)
    }
  }

  const loadChatSession = async (sessionId) => {
    try {
      setIsLoadingSession(true)
      const session = await chatHistoryApi.getSession(sessionId)
      setCurrentSessionId(sessionId)
      
      // Convert stored messages to UI format
      const loadedMessages = session.messages.map(msg => ({
        role: msg.role,
        text: msg.content
      }))
      
      setMessages(loadedMessages)
    } catch (error) {
      console.error('Error loading chat session:', error)
      alert('Failed to load conversation')
    } finally {
      setIsLoadingSession(false)
    }
  }

  const loadMostRecentSession = async () => {
    try {
      const sessions = await chatHistoryApi.getSessions(abhaId)
      // Filter sessions with messages and get most recent
      const sessionsWithMessages = sessions.filter(s => s.messages && s.messages.length > 0 && s.isActive)
      
      if (sessionsWithMessages.length > 0) {
        // Sort by updatedAt and get most recent
        const mostRecent = sessionsWithMessages.sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        )[0]
        
        await loadChatSession(mostRecent.sessionId)
      } else {
        // No existing sessions, create new one
        await createNewChatSession()
      }
    } catch (error) {
      console.error('Error loading recent session:', error)
      // Fallback: create new session
      await createNewChatSession()
    }
  }

  const saveMessageToSession = async (role, content) => {
    if (!currentSessionId) return
    
    try {
      await chatHistoryApi.addMessage(currentSessionId, role, content)
    } catch (error) {
      console.error('Error saving message:', error)
    }
  }

  // Load existing sessions on mount (only once)
  useEffect(() => {
    if (abhaId && !hasLoadedExistingSessions && activeTab === 'chat') {
      setHasLoadedExistingSessions(true)
      loadMostRecentSession()
    }
  }, [abhaId, activeTab, hasLoadedExistingSessions])

  const sendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage = { role: 'user', text: inputValue }
    setMessages(prev => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue("")
    setIsChatLoading(true)

    // Save user message to DynamoDB
    await saveMessageToSession('user', currentInput)

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          patientData: patientData
        })
      })

      const data = await response.json()
      const aiMessage = { role: 'assistant', text: data.reply }
      setMessages(prev => [...prev, aiMessage])
      
      // Save AI response to DynamoDB
      await saveMessageToSession('assistant', data.reply)
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = { role: 'assistant', text: '❌ Sorry, I encountered an error. Please try again.' }
      setMessages(prev => [...prev, errorMessage])
      await saveMessageToSession('assistant', errorMessage.text)
    } finally {
      setIsChatLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-2xl">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/30">
                <span className="text-3xl">👤</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                  Hello, {currentPatient?.name || 'Patient'}!
                </h1>
                <p className="text-blue-100 text-sm">Your Personal Health Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="px-4 py-2 bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-xl shadow-lg">
                <span className="text-white font-semibold text-sm flex items-center space-x-2">
                  <span>✓</span>
                  <span>ABHA Verified</span>
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
                activeTab === "overview"
                  ? "bg-white text-indigo-600 shadow-xl"
                  : "bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
              }`}
            >
              <span className="mr-2">📊</span>
              Health Overview
            </button>
            <button
              onClick={() => setActiveTab("records")}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
                activeTab === "records"
                  ? "bg-white text-indigo-600 shadow-xl"
                  : "bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
              }`}
            >
              <span className="mr-2">📋</span>
              My Records
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
                activeTab === "chat"
                  ? "bg-white text-indigo-600 shadow-xl"
                  : "bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
              }`}
            >
              <span className="mr-2">💬</span>
              AI Companion
            </button>
          </div>
        </div>
      </div>

      {/* Content Area - Scrollable */}
      <div className="pb-8">
        {activeTab === "overview" && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8">
              {/* Left: AI Summary */}
              <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-xl max-h-[700px] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl">🤖</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        AI Health Summary
                      </h2>
                      <p className="text-sm text-gray-500">Personalized insights from your medical data</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {/* Language Selector */}
                    <div className="relative">
                      <button
                        onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                        disabled={isLoadingSummary || isTranslating}
                        className="px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <span>🌐</span>
                        <span>{currentLanguage === 'english' ? 'English' : currentLanguage.charAt(0).toUpperCase() + currentLanguage.slice(1)}</span>
                        <span className="text-xs">▼</span>
                      </button>
                      
                      {showLanguageMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-10 overflow-hidden">
                          <button
                            onClick={switchToEnglish}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center space-x-2 border-b border-gray-100"
                          >
                            <span>🇬🇧</span>
                            <span className="font-semibold">English</span>
                          </button>
                          <button
                            onClick={() => translateSummary('hindi')}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center space-x-2 border-b border-gray-100"
                          >
                            <span>🇮🇳</span>
                            <span className="font-semibold">हिंदी (Hindi)</span>
                          </button>
                          <button
                            onClick={() => translateSummary('telugu')}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center space-x-2 border-b border-gray-100"
                          >
                            <span>🇮🇳</span>
                            <span className="font-semibold">తెలుగు (Telugu)</span>
                          </button>
                          <button
                            onClick={() => translateSummary('tamil')}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center space-x-2 border-b border-gray-100"
                          >
                            <span>🇮🇳</span>
                            <span className="font-semibold">தமிழ் (Tamil)</span>
                          </button>
                          <button
                            onClick={() => translateSummary('kannada')}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center space-x-2 border-b border-gray-100"
                          >
                            <span>🇮🇳</span>
                            <span className="font-semibold">ಕನ್ನಡ (Kannada)</span>
                          </button>
                          <button
                            onClick={() => translateSummary('malayalam')}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center space-x-2"
                          >
                            <span>🇮🇳</span>
                            <span className="font-semibold">മലയാളം (Malayalam)</span>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Listen Button */}
                    <button
                      onClick={toggleSpeech}
                      disabled={isLoadingSummary || isTranslating || isLoading}
                      className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                        isSpeaking
                          ? "bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse"
                          : isLoading
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                          : "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-xl"
                      }`}
                    >
                      {isLoading ? (
                        <span className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Generating...</span>
                        </span>
                      ) : isSpeaking ? (
                        "⏹️ Stop"
                      ) : (
                        "🔊 Listen"
                      )}
                    </button>
                  </div>
                </div>

                {isLoadingSummary ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 text-lg">AI is analyzing your health data...</p>
                    </div>
                  </div>
                ) : isTranslating ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 text-lg">Translating to {currentLanguage}...</p>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="text-gray-800 leading-relaxed text-lg prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(currentLanguage === 'english' ? healthSummary : translatedSummary) }}
                  />
                )}
              </div>

              {/* Right: Quick Stats - Sidebar */}
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-8 space-y-6 rounded-2xl shadow-xl overflow-y-auto">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Stats</h3>
                
                <div className="bg-white rounded-2xl shadow-xl p-6 transform transition-all hover:scale-105">
                  <div className="flex items-center space-x-4">
                    <span className="text-5xl">🩸</span>
                    <div>
                      <div className="text-sm text-gray-600">Blood Group</div>
                      <div className="text-3xl font-bold text-blue-900">{patientData?.bloodGroup || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 transform transition-all hover:scale-105">
                  <div className="flex items-center space-x-4">
                    <span className="text-5xl">📋</span>
                    <div>
                      <div className="text-sm text-gray-600">Medical Reports</div>
                      <div className="text-3xl font-bold text-green-900">{patientData?.reports?.length || 0}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 transform transition-all hover:scale-105">
                  <div className="flex items-center space-x-4">
                    <span className="text-5xl">💊</span>
                    <div>
                      <div className="text-sm text-gray-600">Active Medications</div>
                      <div className="text-3xl font-bold text-purple-900">{patientData?.medications?.length || 0}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h4 className="font-bold text-gray-900 mb-3">Patient Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-semibold">{patientData?.age} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gender:</span>
                      <span className="font-semibold">{patientData?.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ABHA ID:</span>
                      <span className="font-semibold text-xs">{abhaId}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "records" && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
              <span className="text-3xl">📋</span>
              <span>Medical Reports</span>
            </h2>

            {patientData?.reports && patientData.reports.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {patientData.reports.map((report, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 border-l-4 border-blue-500">
                    <div className="flex items-start space-x-4">
                      <span className="text-4xl">📊</span>
                      <div className="flex-1">
                        <div className="text-xl font-bold text-blue-900 mb-2">{report.type}</div>
                        <div className="text-sm text-gray-600 mb-3">{report.date} • {report.department}</div>
                        <div className="text-base text-gray-700 bg-blue-50 p-4 rounded-lg mb-4">
                          {report.summary}
                        </div>
                        <button
                          onClick={() => handleGeneratePDF(report)}
                          className="w-full px-4 py-3 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span>Preview Report</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500">
                <span className="text-6xl mb-4 block">📋</span>
                <p className="text-xl">No medical reports available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "chat" && (
          <div className="flex h-[calc(100vh-200px)]">
            {/* Chat History Sidebar */}
            <ChatHistorySidebar
              patientId={abhaId}
              currentSessionId={currentSessionId}
              onSelectSession={loadChatSession}
              onNewChat={createNewChatSession}
              refreshTrigger={sidebarRefreshTrigger}
            />

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-xl m-8 ml-4">
              {isLoadingSession ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading conversation...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Messages Area */}
                  <div className="flex-1 p-8 space-y-4 overflow-y-auto custom-scrollbar">
                    {messages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                        {msg.role === 'assistant' && (
                          <div className="flex items-start space-x-3 max-w-[75%]">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg">
                              🤖
                            </div>
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-5 shadow-lg">
                              <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            </div>
                          </div>
                        )}
                        {msg.role === 'user' && (
                          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-5 max-w-[75%] shadow-lg">
                            <p className="text-base">{msg.text}</p>
                          </div>
                        )}
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex justify-start animate-fadeIn">
                        <div className="flex items-center space-x-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl px-6 py-4 shadow-lg">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                          <div className="text-sm text-purple-700 font-medium">AI is thinking...</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-t-2 border-gray-200 p-6 rounded-b-2xl">
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about your health or diet..."
                        className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 shadow-lg transition-all duration-200 text-base"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!inputValue.trim() || isChatLoading}
                        className={`px-8 py-4 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-lg ${
                          inputValue.trim() && !isChatLoading
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

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

export default PatientDashboard
