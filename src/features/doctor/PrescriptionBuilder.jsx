import { useState } from 'react'

function PrescriptionBuilder({ patient }) {
  const [inputText, setInputText] = useState("")
  const [inputMode, setInputMode] = useState("type")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showOcrWarning, setShowOcrWarning] = useState(false)
  const [showGuardianAlert, setShowGuardianAlert] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleVoiceMode = () => {
    setInputMode("voice")
    setIsProcessing(true)
    setShowOcrWarning(false)
    
    setTimeout(() => {
      setInputText("Rx: Aspirin 100mg daily. Review in 15 days.")
      setIsProcessing(false)
    }, 1500)
  }

  const handleScanMode = () => {
    setInputMode("scan")
    setIsProcessing(true)
    setShowOcrWarning(false)
    
    setTimeout(() => {
      setInputText("Rx: Aspirin 100mg daily")
      setShowOcrWarning(true)
      setIsProcessing(false)
    }, 2000)
  }

  const handleTypeMode = () => {
    setInputMode("type")
    setShowOcrWarning(false)
  }

  const handleSubmit = () => {
    if (inputText.toLowerCase().includes("aspirin")) {
      setShowGuardianAlert(true)
    } else {
      setShowSuccess(true)
    }
  }

  const handleOverride = () => {
    setShowGuardianAlert(false)
    setShowSuccess(true)
  }

  const handleReset = () => {
    setShowSuccess(false)
    setInputText("")
    setShowOcrWarning(false)
  }

  return (
    <>
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 p-8 transform transition-all duration-300 hover:shadow-3xl">
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">📝</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Generate New Prescription
              </h1>
              {patient && (
                <p className="text-sm text-gray-600">
                  Patient: <span className="font-semibold text-gray-900">{patient.name}</span>
                </p>
              )}
            </div>
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <span className="text-xl">⚙️</span>
            <span>Input Mode</span>
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={handleTypeMode}
              className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-lg ${
                inputMode === "type"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl"
                  : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300"
              }`}
            >
              <span className="text-xl">⌨️</span> Type
            </button>
            <button
              onClick={handleVoiceMode}
              className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-lg ${
                inputMode === "voice"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl"
                  : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300"
              }`}
            >
              <span className="text-xl">🎤</span> Voice Dictate
            </button>
            <button
              onClick={handleScanMode}
              className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-lg ${
                inputMode === "scan"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl"
                  : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300"
              }`}
            >
              <span className="text-xl">📷</span> Upload / Scan
            </button>
          </div>
        </div>

        {isProcessing && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-5 shadow-lg animate-fadeIn">
            <div className="flex items-center space-x-3">
              <div className="animate-pulse">
                {inputMode === "voice" ? (
                  <span className="text-3xl">🎤</span>
                ) : (
                  <span className="text-3xl">📷</span>
                )}
              </div>
              <div className="text-blue-900 font-bold text-lg">
                {inputMode === "voice" ? "Listening..." : "AWS Textract Digitizing..."}
              </div>
            </div>
          </div>
        )}

        {showOcrWarning && (
          <div className="mb-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-400 rounded-xl p-5 shadow-lg animate-fadeIn">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-600 text-2xl">⚠️</span>
              <span className="text-yellow-900 font-bold">
                AI Draft: Please review the digitized text for accuracy before finalizing.
              </span>
            </div>
          </div>
        )}

        {showSuccess ? (
          <div className="mb-6 animate-fadeIn">
            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 border-2 border-green-500 rounded-2xl p-8 text-center shadow-2xl">
              <div className="text-7xl mb-4 animate-pulse">✅</div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-2">
                Prescription Digitized & Securely Synced to ABHA Network
              </h3>
              <p className="text-green-700 mb-6 font-medium">
                The prescription has been successfully processed and sent.
              </p>
              <button
                onClick={handleReset}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
              >
                Write Another Prescription
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center space-x-2">
                <span className="text-lg">📋</span>
                <span>Prescription Details</span>
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter prescription details..."
                rows="8"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 font-mono text-sm shadow-lg transition-all duration-200 hover:shadow-xl"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!inputText.trim()}
              className={`w-full px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-2xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 ${
                inputText.trim()
                  ? "bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 hover:from-green-700 hover:via-emerald-700 hover:to-green-800 text-white"
                  : "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 cursor-not-allowed transform-none"
              }`}
            >
              <span className="text-xl">🔒</span>
              <span>Securely Sign & Send to ABHA</span>
            </button>
          </>
        )}
      </div>

      {showGuardianAlert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 border-4 border-red-500 transform transition-all duration-300 scale-100 hover:scale-105">
            <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white px-6 py-5 rounded-t-2xl">
              <h2 className="text-2xl font-bold flex items-center space-x-2">
                <span className="text-3xl">🚨</span>
                <span>SILENT GUARDIAN ALERT: Severe Drug Interaction Detected</span>
              </h2>
            </div>
            
            <div className="p-8">
              <div className="mb-6">
                <p className="text-gray-800 font-semibold mb-4 text-lg">
                  Amazon Comprehend Medical has flagged a conflict.
                </p>
                
                <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-6 space-y-3 shadow-lg">
                  <div className="flex items-start space-x-2">
                    <span className="font-bold text-red-900">Patient History:</span>
                    <span className="text-red-800 ml-2">Peptic Ulcer (2023)</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-bold text-red-900">Prescription:</span>
                    <span className="text-red-800 ml-2">Aspirin 100mg</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-bold text-red-900">Risk:</span>
                    <span className="text-red-800 ml-2">May cause severe internal gastrointestinal bleeding.</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowGuardianAlert(false)}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 border-2 border-gray-300 text-gray-700 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Cancel & Edit
                </button>
                <button
                  onClick={handleOverride}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span className="text-xl">⚠️</span>
                  <span>Override: Clinical Judgment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PrescriptionBuilder
