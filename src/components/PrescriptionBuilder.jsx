import { useState } from 'react'

function PrescriptionBuilder({ patient, onBack }) {
  const [inputText, setInputText] = useState("")
  const [inputMode, setInputMode] = useState("type")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showOcrWarning, setShowOcrWarning] = useState(false)
  const [showGuardianAlert, setShowGuardianAlert] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [foodAnalysis, setFoodAnalysis] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

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

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result
        const base64Data = base64String.split(',')[1]
        setSelectedImage(base64Data)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyzeFood = async () => {
    if (!selectedImage) return
    
    setIsAnalyzing(true)
    try {
      const response = await fetch('http://localhost:3001/api/analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: selectedImage,
          patientConditions: ["Hypertension Grade 1", "Type 2 Diabetes"]
        })
      })

      const data = await response.json()
      setFoodAnalysis(data.analysis)
    } catch (error) {
      console.error('Food analysis error:', error)
      setFoodAnalysis('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Generate New Prescription</h1>
          </div>
          {patient && (
            <div className="text-sm text-gray-600">
              Patient: <span className="font-semibold text-gray-900">{patient.name}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Input Mode</h2>
            <div className="flex space-x-3">
              <button
                onClick={handleTypeMode}
                className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                  inputMode === "type"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                ⌨️ Type
              </button>
              <button
                onClick={handleVoiceMode}
                className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                  inputMode === "voice"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                🎤 Voice Dictate (HealthScribe)
              </button>
              <button
                onClick={handleScanMode}
                className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                  inputMode === "scan"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                📷 Upload / Scan Prescription
              </button>
            </div>
          </div>

          {isProcessing && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-pulse">
                  {inputMode === "voice" ? (
                    <span className="text-2xl">🎤</span>
                  ) : (
                    <span className="text-2xl">📷</span>
                  )}
                </div>
                <div className="text-blue-800 font-semibold">
                  {inputMode === "voice" ? "Listening..." : "AWS Textract Digitizing..."}
                </div>
              </div>
            </div>
          )}

          {showOcrWarning && (
            <div className="mb-6 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-600 text-xl">⚠️</span>
                <span className="text-yellow-800 font-bold">
                  AI Draft: Please review the digitized text for accuracy before finalizing.
                </span>
              </div>
            </div>
          )}

          {showSuccess ? (
            <div className="mb-6">
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-green-900 mb-2">
                  Prescription Digitized & Securely Synced to ABHA Network
                </h3>
                <p className="text-green-700 mb-6">
                  The prescription has been successfully processed and sent.
                </p>
                <button
                  onClick={handleReset}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Write Another Prescription
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Prescription Details
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter prescription details..."
                  rows="8"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!inputText.trim()}
                className={`w-full px-6 py-4 rounded-lg font-bold shadow-md hover:shadow-lg transition-all ${
                  inputText.trim()
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                🔒 Securely Sign & Send to ABHA
              </button>
            </>
          )}
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🍎 Nutri-Scanner: AI Food Analysis</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Upload Food Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleAnalyzeFood}
            disabled={!selectedImage || isAnalyzing}
            className={`w-full px-6 py-4 rounded-lg font-bold shadow-md hover:shadow-lg transition-all ${
              selectedImage && !isAnalyzing
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isAnalyzing ? '🔄 Analyzing Food...' : '🔍 Analyze Food'}
          </button>

          {foodAnalysis && (
            <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg">
              <div className="text-sm font-semibold text-purple-900 mb-3">AI Analysis Result:</div>
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{foodAnalysis}</p>
            </div>
          )}
        </div>
      </div>

      {showGuardianAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 border-4 border-red-500">
            <div className="bg-red-600 text-white px-6 py-4 rounded-t-xl">
              <h2 className="text-2xl font-bold flex items-center space-x-2">
                <span>🚨</span>
                <span>SILENT GUARDIAN ALERT: Severe Drug Interaction Detected</span>
              </h2>
            </div>
            
            <div className="p-8">
              <div className="mb-6">
                <p className="text-gray-800 font-semibold mb-4">
                  Amazon Comprehend Medical has flagged a conflict.
                </p>
                
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 space-y-3">
                  <div>
                    <span className="font-bold text-red-900">Patient History:</span>
                    <span className="text-red-800 ml-2">Peptic Ulcer (2023)</span>
                  </div>
                  <div>
                    <span className="font-bold text-red-900">Prescription:</span>
                    <span className="text-red-800 ml-2">Aspirin 100mg</span>
                  </div>
                  <div>
                    <span className="font-bold text-red-900">Risk:</span>
                    <span className="text-red-800 ml-2">May cause severe internal gastrointestinal bleeding.</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowGuardianAlert(false)}
                  className="flex-1 px-6 py-4 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Cancel & Edit
                </button>
                <button
                  onClick={handleOverride}
                  className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  ⚠️ Override: Clinical Judgment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PrescriptionBuilder
