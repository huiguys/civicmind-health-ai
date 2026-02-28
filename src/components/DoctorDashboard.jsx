import { useState } from 'react'
import { hospitalQueue } from '../data/mockData'
import PatientDetailView from './PatientDetailView'

function DoctorDashboard() {
  const [selectedPatient, setSelectedPatient] = useState(null)

  const getStatusText = (patient) => {
    if (patient.isEmergency) return "Unidentified Trauma / ER"
    if (patient.otpVerified) return "AI Brief Ready (Zero Latency)"
    return "Awaiting Reception OTP"
  }

  if (selectedPatient) {
    return <PatientDetailView patient={selectedPatient} onBack={() => setSelectedPatient(null)} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dr. Sharma - Patient Queue</h1>
          <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-green-600 font-semibold text-sm">ABDM Network Status: Connected</span>
            <span className="text-green-600">🟢</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-xl font-bold text-gray-900">Today's Patient Queue</h2>
            <p className="text-sm text-gray-600 mt-1">Real-time AI-powered patient management</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Patient Name
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
              <tbody className="bg-white divide-y divide-gray-200">
                {hospitalQueue.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white font-bold text-sm">{patient.avatar}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-base font-semibold text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">{patient.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono font-medium">{patient.abhaId}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-800">
                        {getStatusText(patient)}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {patient.isEmergency ? (
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
