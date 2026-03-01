import { useState } from 'react'
import AuthLogin from './features/auth/AuthLogin'
import DoctorDashboard from './features/doctor/DoctorDashboard'
import PatientDashboard from './features/patient/PatientDashboard'

function LandingPage({ onSelectPortal }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 px-8 py-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/30">
            <span className="text-3xl">🏥</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">CivicMind</h1>
            <p className="text-sm text-blue-100">Health AI Platform</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-8">
        <div className="max-w-7xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-7xl font-bold text-white mb-6 drop-shadow-2xl leading-tight">
              Welcome to<br />CivicMind Health AI
            </h1>
            <p className="text-2xl text-blue-100 font-light max-w-3xl mx-auto">
              Your intelligent healthcare companion powered by AWS Bedrock AI.<br />
              Secure, fast, and personalized medical insights at your fingertips.
            </p>
          </div>

          {/* Portal Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <button
              onClick={() => onSelectPortal('auth-doctor')}
              className="group bg-white/10 backdrop-blur-xl rounded-3xl p-10 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border-2 border-white/20 hover:border-white/40 shadow-2xl"
            >
              <div className="flex flex-col items-center space-y-6">
                <div className="w-28 h-28 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-300 transform group-hover:scale-110">
                  <span className="text-6xl">👨‍⚕️</span>
                </div>
                <h2 className="text-4xl font-bold text-white">Doctor Portal</h2>
                <p className="text-blue-100 text-center text-lg">
                  Access patient records, AI diagnostics, and clinical decision support tools
                </p>
                <div className="flex items-center space-x-2 text-white font-semibold">
                  <span>Enter Portal</span>
                  <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
            </button>

            <button
              onClick={() => onSelectPortal('auth-patient')}
              className="group bg-white/10 backdrop-blur-xl rounded-3xl p-10 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border-2 border-white/20 hover:border-white/40 shadow-2xl"
            >
              <div className="flex flex-col items-center space-y-6">
                <div className="w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-300 transform group-hover:scale-110">
                  <span className="text-6xl">📱</span>
                </div>
                <h2 className="text-4xl font-bold text-white">Patient Portal</h2>
                <p className="text-blue-100 text-center text-lg">
                  View health records, chat with AI companion, and manage your wellness journey
                </p>
                <div className="flex items-center space-x-2 text-white font-semibold">
                  <span>Enter Portal</span>
                  <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-8 py-6">
        <div className="flex items-center justify-center space-x-8 text-white/80 text-sm">
          <div className="flex items-center space-x-2">
            <span>🔒</span>
            <span>ABHA Secured</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🤖</span>
            <span>AWS Bedrock AI</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>⚡</span>
            <span>Real-time Insights</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [currentView, setCurrentView] = useState('landing')

  return (
    <div className="min-h-screen">
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
