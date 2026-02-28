import { useState } from 'react'
import { patientMedicalRecord } from '../data/mockData'
import PrescriptionBuilder from './PrescriptionBuilder'
import abhaData from '../data/abhaFhirMock.json';


function PatientDetailView({ patient, onBack }) {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [showPdf, setShowPdf] = useState(false)
  const [otpValue, setOtpValue] = useState("")
  const [hindiTranslation, setHindiTranslation] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)

  const handleUnlock = () => {
    setIsUnlocked(true)
    setShowOtpModal(false)
  }

  const handleTranslateToHindi = async () => {
    setIsTranslating(true)
    try {
      const clinicalText = `Based on the patient's medical history, they have been diagnosed with Type 2 Diabetes and Hypertension Grade 1. Current medications include Metformin 500mg and Amlodipine 5mg. The patient has also reported a history of severe anxiety and has requested privacy regarding their mental health records.`
      
      const response = await fetch('http://localhost:3001/api/translate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clinicalText: clinicalText,
          targetLanguage: 'hindi'
        })
      })

      const data = await response.json()
      setHindiTranslation(data.translation)
    } catch (error) {
      console.error('Translation error:', error)
      setHindiTranslation('Translation failed. Please try again.')
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
          </div>
          <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
            <span className="text-amber-700 font-semibold text-sm">⏰ Data Auto-Deletes in 24h (DynamoDB TTL)</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">General Information (Zero Latency)</h2>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-5 border-2 border-blue-300">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-xl">✨</span>
                    <div className="text-sm font-bold text-blue-900">AI Triage Brief (Auto-Generated)</div>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    Patient is a 34-year-old male presenting with mild chest discomfort and fatigue. Vitals taken at reception are within normal limits. No immediate life-threatening markers detected in general history. Patient has requested PHI privacy for past chronic conditions.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-sm font-semibold text-blue-900 mb-1">Blood Group</div>
                  <div className="text-2xl font-bold text-blue-700">{patientMedicalRecord.general.bloodGroup}</div>
                </div>

                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="text-sm font-semibold text-red-900 mb-2">Allergies</div>
                  <div className="space-y-1">
                    {patientMedicalRecord.general.allergies.map((allergy, idx) => (
                      <div key={idx} className="text-sm font-medium text-red-700 flex items-center space-x-2">
                        <span>⚠️</span>
                        <span>{allergy}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-sm font-semibold text-green-900 mb-2">Vitals</div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <div className="text-xs text-green-700">BP</div>
                      <div className="text-sm font-bold text-green-900">{patientMedicalRecord.general.vitals.bp}</div>
                    </div>
                    <div>
                      <div className="text-xs text-green-700">Weight</div>
                      <div className="text-sm font-bold text-green-900">{patientMedicalRecord.general.vitals.weight}</div>
                    </div>
                    <div>
                      <div className="text-xs text-green-700">Height</div>
                      <div className="text-sm font-bold text-green-900">{patientMedicalRecord.general.vitals.height}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              {!isUnlocked ? (
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-3xl">🔒</span>
                    <h2 className="text-xl font-bold text-gray-900">Protected Health Information (PHI)</h2>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-yellow-800 font-medium">
                      This section contains sensitive medical history. Patient consent required via OTP.
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <button
                      onClick={() => setShowOtpModal(true)}
                      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                      🔓 Request 1-Hour Access (Send OTP)
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">🔓</span>
                      <h2 className="text-xl font-bold text-gray-900">Protected Health Information</h2>
                    </div>
                    <div className="px-3 py-1 bg-green-100 border border-green-300 rounded-lg">
                      <span className="text-green-700 font-bold text-sm">⏱️ Expires In: 59:59</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ask a follow-up question...
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="e.g., What medications is the patient taking?"
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all">
                          Ask Bedrock AI
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-5 mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-purple-600 font-bold">🤖 Amazon Bedrock AI Insight</span>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed">
                      Based on the patient's medical history, they have been diagnosed with <strong>Type 2 Diabetes</strong> and <strong>Hypertension Grade 1</strong>. 
                      Current medications include Metformin 500mg and Amlodipine 5mg. The patient has also reported a history of severe anxiety and has requested privacy regarding their mental health records.
                    </p>
                    
                    <div className="mt-4 pt-4 border-t border-purple-200">
                      <button
                        onClick={handleTranslateToHindi}
                        disabled={isTranslating}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium rounded-lg transition-colors"
                      >
                        {isTranslating ? '🔄 Translating...' : '🌐 Translate to Hindi'}
                      </button>
                    </div>

                    {hindiTranslation && (
                      <div className="mt-4 p-4 bg-white rounded-lg border border-purple-300">
                        <div className="text-sm font-semibold text-purple-900 mb-2">Hindi Translation:</div>
                        <p className="text-sm text-gray-800 leading-relaxed">{hindiTranslation}</p>
                      </div>
                    )}
                  </div>

                  {!showPdf ? (
                    <div className="space-y-4">
                      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <div className="text-sm font-semibold text-orange-900 mb-2">Chronic Conditions</div>
                        <div className="space-y-1">
                          {patientMedicalRecord.sensitive.chronicConditions.map((condition, idx) => (
                            <div key={idx} className="text-sm font-medium text-orange-700">• {condition}</div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <div className="text-sm font-semibold text-purple-900 mb-2">Active Medications</div>
                        <div className="space-y-1">
                          {patientMedicalRecord.sensitive.activeMedications.map((med, idx) => (
                            <div key={idx} className="text-sm font-medium text-purple-700">💊 {med}</div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-300">
                        <div className="text-sm font-semibold text-gray-900 mb-2">Medical History</div>
                        <p className="text-sm text-gray-700">{patientMedicalRecord.sensitive.history}</p>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <button
                          onClick={() => setShowPdf(true)}
                          className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                        >
                          <span>📄</span>
                          <span>Override: View Original Raw PDF</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gray-800 rounded-lg p-8 aspect-video flex flex-col items-center justify-center">
                        <div className="text-center space-y-4">
                          <div className="text-4xl">📄</div>
                          <div className="text-white font-bold text-lg">Document: rahul_sharma_legacy_record.pdf</div>
                          <div className="text-gray-300 text-sm">Loaded securely from encrypted storage</div>
                          <div className="text-gray-400 text-xs mt-4">
                            [Mock PDF Viewer - In production, this would display the actual scanned medical records]
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowPdf(false)}
                        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
                      >
                        Close PDF View
                      </button>
                    </div>
                  )}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🔐</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Patient OTP</h2>
              <p className="text-gray-600">Unlock Private Records for 1 Hour</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">4-Digit OTP Code</label>
              <input
                type="text"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                maxLength="4"
                placeholder="0000"
                className="w-full px-4 py-3 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent tracking-widest"
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={handleUnlock}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                ✓ Verify & Unlock
              </button>
              <button
                onClick={() => setShowOtpModal(false)}
                className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientDetailView
