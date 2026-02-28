import { useState, useEffect } from 'react'
import { patientMedicalRecord } from '../data/mockData'
import abhaData from '../data/abhaFhirMock.json';

function PatientDashboard() {
  const [activeTab, setActiveTab] = useState("records")
  const [language, setLanguage] = useState("english")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello Rahul! I am your CivicMind AI Companion. I have securely reviewed Dr. Sharma's latest report. How can I help you with your health or diet today?",
      type: 'text'
    }
  ])
  const [chatInput, setChatInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const englishText = "Diagnosis: Severe Hyperlipidemia and Grade 2 Hypertension. Immediate dietary intervention required."
  const hindiText = "डॉक्टर शर्मा की रिपोर्ट से पता चलता है कि आपका ब्लड प्रेशर बढ़ा हुआ है। कृपया घबराएं नहीं। सही खान-पान से इसे नियंत्रित किया जा सकता है। कृपया अपनी दवाएं समय पर लें।"

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [])

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      const utterance = new SpeechSynthesisUtterance()
      utterance.text = language === "hindi" ? hindiText : englishText
      utterance.lang = language === "hindi" ? 'hi-IN' : 'en-US'
      utterance.onend = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
      setIsSpeaking(true)
    }
  }

  const handleSendText = () => {
    if (!chatInput.trim()) return

    setMessages([...messages, { sender: 'user', text: chatInput, type: 'text' }])
    setChatInput("")
    setIsTyping(true)

    setTimeout(() => {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: "Based on your profile, your blood pressure is slightly elevated. It's nothing to panic about, but limiting salt intake will help immensely! What did you have for lunch?",
        type: 'text'
      }])
      setIsTyping(false)
    }, 1500)
  }

  const handleUploadImage = () => {
    setMessages([...messages, { sender: 'user', type: 'image' }])
    setIsTyping(true)

    setTimeout(() => {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: "🔴 High Risk Alert: I see you are about to eat Samosas. Because your clinical history shows Hypertension, the high sodium could cause a sudden BP spike. 💡 Please consider roasted Makhana instead to stay safe!",
        type: 'text'
      }])
      setIsTyping(false)
    }, 2000)
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-10">
      <div className="bg-white shadow-sm border-b border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Hello, Rahul 👋</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("records")}
            className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all ${
              activeTab === "records"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            My Records
          </button>
          <button
            onClick={() => setActiveTab("scanner")}
            className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all ${
              activeTab === "scanner"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            AI Health Companion
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === "records" && (
          <div className="space-y-6">
            <div className="flex space-x-2">
              <button
                onClick={() => setLanguage(language === "english" ? "hindi" : "english")}
                className="flex-1 px-6 py-3 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold rounded-lg transition-all border-2 border-purple-300"
              >
                {language === "english" ? "🌐 View in Hindi (AI Translated)" : "🌐 View in English"}
              </button>
              
              <button
                onClick={toggleSpeech}
                className={`flex-1 px-6 py-3 font-bold rounded-lg transition-all border-2 ${
                  isSpeaking
                    ? "bg-red-100 hover:bg-red-200 text-red-800 border-red-300 animate-pulse"
                    : "bg-green-100 hover:bg-green-200 text-green-800 border-green-300"
                }`}
              >
                {isSpeaking ? "⏹️ Stop Audio" : "🔊 Listen to Report"}
              </button>
            </div>

            {language === "english" ? (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                <div className="text-red-900 font-bold text-lg mb-3">Clinical Report</div>
                <p className="text-red-800 font-semibold">
                  {englishText}
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl">💙</span>
                  <div className="text-blue-900 font-bold text-lg">CivicMind AI Companion</div>
                </div>
                <p className="text-gray-800 leading-relaxed text-base">
                  {hindiText}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "scanner" && (
          <div className="flex flex-col h-[calc(100vh-250px)]">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'ai' && (
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        🤖
                      </div>
                      <div className="bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300 rounded-lg p-4 max-w-xs">
                        <p className="text-gray-800 text-sm leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  )}
                  {msg.sender === 'user' && (
                    <div className="bg-green-100 border border-green-300 rounded-lg p-4 max-w-xs">
                      {msg.type === 'image' ? (
                        <div className="bg-gray-200 rounded-lg p-4 text-center">
                          <div className="text-4xl mb-2">🥟</div>
                          <div className="text-xs text-gray-600">Samosa Image</div>
                        </div>
                      ) : (
                        <p className="text-gray-800 text-sm">{msg.text}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-2">
                    <div className="text-sm text-gray-600 italic">CivicMind is typing...</div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleUploadImage}
                  className="w-12 h-12 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg flex items-center justify-center text-2xl transition-all"
                >
                  📷
                </button>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                  placeholder="Ask about your health or diet..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendText}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientDashboard
