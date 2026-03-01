import { useState } from 'react'
import { hospitalQueue } from '../../data/mockData'
import PatientDetailView from './PatientDetailView'

function DoctorDashboard() {
  const [selectedPatient, setSelectedPatient] = useState(null)

  const getStatusText = (patient) => {
    if (patient.isUnidentified) return "⚠️ No ID - Emergency Admission"
    if (patient.isEmergency) return "Unidentified Trauma / ER"
    if (patient.otpVerified) return "AI Brief Ready (Zero Latency)"
    return "Awaiting Reception OTP"
  }

  const getStatusColor = (patient) => {
    if (patient.isUnidentified) return "text-red-700 font-bold"
    if (patient.isEmergency) return "text-orange-700 font-bold"
    return "text-gray-800 font-semibold"
  }

  if (selectedPatient) {
    return <PatientDetailView patient={selectedPatient} onBack={() => setSelectedPatient(null)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">🏥</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Dr. Sharma - Patient Queue
              </h1>
              <p className="text-xs text-gray-500">Real-time AI-powered patient management</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm">
            <span className="text-green-600 font-semibold text-sm">ABDM Network</span>
            <div className="relative">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Today's Patient Queue</h2>
                <p className="text-blue-100 text-sm">AI-powered triage and patient management</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl">
                <span className="text-white font-bold text-lg">{hospitalQueue.length} Patients</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    ABHA ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {hospitalQueue.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-200 ${
                          patient.isUnidentified 
                            ? 'bg-gradient-to-br from-red-500 via-orange-500 to-pink-500' 
                            : 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500'
                        }`}>
                          <span className="text-white font-bold text-lg">{patient.avatar}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-base font-bold text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500 font-mono">{patient.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono bg-gray-50 px-3 py-1 rounded-lg inline-block border border-gray-200">
                        {patient.abhaId}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className={`text-sm ${getStatusColor(patient)}`}>
                        {getStatusText(patient)}
                      </div>
                      {patient.isUnidentified && (
                        <div className="text-xs text-gray-600 mt-1 flex items-center space-x-1">
                          <span>⏳</span>
                          <span>Temporary ID - Awaiting identification</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {patient.isUnidentified ? (
                        <button 
                          onClick={() => setSelectedPatient(patient)}
                          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
                        >
                          <span>🚨</span>
                          <span>Emergency - No ID</span>
                        </button>
                      ) : patient.isEmergency ? (
                        <button 
                          onClick={() => setSelectedPatient(patient)}
                          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
                        >
                          <span>🚨</span>
                          <span>Emergency Override (AI Audited)</span>
                        </button>
                      ) : patient.otpVerified ? (
                        <button 
                          onClick={() => setSelectedPatient(patient)}
                          className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
                        >
                          <span>�</span>
                          <span>View AI Brief</span>
                        </button>
                      ) : (
                        <button className="px-5 py-2.5 bg-gray-400 text-gray-600 font-bold rounded-lg cursor-not-allowed flex items-center space-x-2" disabled>
                          <span>🔒</span>
                          <span>Locked - Needs Consent</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard
