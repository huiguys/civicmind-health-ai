import { useState } from 'react'
import AuthLogin from './components/AuthLogin'
import DoctorDashboard from './components/DoctorDashboard'
import PatientDashboard from './components/PatientDashboard'

function LandingPage({ onSelectPortal }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">CivicMind Health AI</h1>
          <p className="text-xl text-gray-600">Secure, Intelligent Healthcare Platform</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <button
            onClick={() => onSelectPortal('auth-doctor')}
            className="bg-white rounded-2xl shadow-xl p-12 hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex flex-col items-center space-y-6">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Enter Doctor Portal</h2>
              <p className="text-gray-600 text-center">Access patient records, AI diagnostics, and clinical tools</p>
            </div>
          </button>

          <button
            onClick={() => onSelectPortal('auth-patient')}
            className="bg-white rounded-2xl shadow-xl p-12 hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-green-500"
          >
            <div className="flex flex-col items-center space-y-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Enter Patient Portal</h2>
              <p className="text-gray-600 text-center">View health records, schedule appointments, and chat with AI</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [currentView, setCurrentView] = useState('landing')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">CivicMind</h1>
          <button
            onClick={() => setCurrentView('landing')}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Home
          </button>
        </div>
      </nav>

      {currentView === 'landing' && <LandingPage onSelectPortal={setCurrentView} />}
      {currentView === 'auth-doctor' && (
        <AuthLogin 
          role="doctor" 
          onBack={() => setCurrentView('landing')} 
          onLoginSuccess={() => setCurrentView('doctor-dashboard')} 
        />
      )}
      {currentView === 'auth-patient' && (
        <AuthLogin 
          role="patient" 
          onBack={() => setCurrentView('landing')} 
          onLoginSuccess={() => setCurrentView('patient-dashboard')} 
        />
      )}
      {currentView === 'doctor-dashboard' && <DoctorDashboard />}
      {currentView === 'patient-dashboard' && <PatientDashboard />}
    </div>
  )
}

export default App
