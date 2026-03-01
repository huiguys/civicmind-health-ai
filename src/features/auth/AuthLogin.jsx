import { useState } from 'react'
import { usePatient } from '../../shared/context/PatientContext'

function AuthLogin({ role, onLoginSuccess, onBack }) {
  const { login, authError } = usePatient()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [abhaId, setAbhaId] = useState("")
  const [otp, setOtp] = useState("")

  const handleDoctorLogin = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onLoginSuccess()
    }, 1000)
  }

  const handleGetOtp = () => {
    if (!abhaId.trim()) {
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setStep(2)
    }, 1000)
  }

  const handleVerifyOtp = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      const success = login(abhaId)
      if (success) {
        onLoginSuccess()
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-12 flex-col justify-between relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10">
          <button
            onClick={onBack}
            className="mb-8 px-6 py-3 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-xl font-semibold flex items-center space-x-2 transition-all duration-200 border border-white/20"
          >
            <span>←</span>
            <span>Back</span>
          </button>

          <div className="space-y-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl border-2 border-white/30">
              <span className="text-5xl">🏥</span>
            </div>
            <h1 className="text-6xl font-bold text-white drop-shadow-2xl leading-tight">
              CivicMind<br />Health AI
            </h1>
            <p className="text-2xl text-blue-100 font-light">
              Your intelligent healthcare companion powered by AI
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">AI-Powered Insights</h3>
              <p className="text-blue-100">Get personalized health recommendations based on your medical history</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🔒</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Secure & Private</h3>
              <p className="text-blue-100">Your health data is encrypted and protected with ABHA standards</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Instant Access</h3>
              <p className="text-blue-100">Access your complete medical records anytime, anywhere</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="w-full max-w-md">
          {/* Mobile back button */}
          <button
            onClick={onBack}
            className="lg:hidden mb-6 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-200 shadow-md"
          >
            <span>←</span>
            <span>Back</span>
          </button>

          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                <span className="text-4xl">{role === 'doctor' ? '👨‍⚕️' : '📱'}</span>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                {role === 'doctor' ? 'Doctor Login' : 'Patient Login'}
              </h2>
              <p className="text-gray-600">
                {role === 'doctor' ? 'Access your patient dashboard' : 'Sign in with your ABHA ID'}
              </p>
            </div>

            {role === 'doctor' ? (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@hospital.com"
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all text-base shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all text-base shadow-sm"
                  />
                </div>

                <button
                  onClick={handleDoctorLogin}
                  disabled={isLoading}
                  className={`w-full px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-lg ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Authenticating...</span>
                    </span>
                  ) : (
                    'Secure Login'
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {step === 1 ? (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">ABHA ID</label>
                      <input
                        type="text"
                        value={abhaId}
                        onChange={(e) => setAbhaId(e.target.value)}
                        placeholder="e.g., 14-1234-5678-9012"
                        className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-400 transition-all text-base shadow-sm"
                      />
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs font-semibold text-blue-900 mb-1">Test ABHA IDs:</p>
                        <p className="text-xs text-blue-700">
                          • 14-1234-5678-9012 (Rahul Sharma)<br />
                          • 14-9876-5432-1098 (Priya Patel)<br />
                          • 14-4567-8901-2345 (Vikram Singh)
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleGetOtp}
                      disabled={isLoading || !abhaId.trim()}
                      className={`w-full px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-lg ${
                        isLoading || !abhaId.trim()
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                      }`}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Sending OTP...</span>
                        </span>
                      ) : (
                        'Get OTP'
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">4-Digit OTP</label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength="4"
                        placeholder="0000"
                        className="w-full px-4 py-4 text-center text-3xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-400 tracking-widest shadow-lg"
                      />
                      <p className="mt-2 text-sm text-gray-600 text-center">
                        OTP sent to your registered mobile number
                      </p>
                    </div>

                    {authError && (
                      <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl animate-fadeIn">
                        <p className="text-red-700 font-semibold text-sm">{authError}</p>
                      </div>
                    )}

                    <button
                      onClick={handleVerifyOtp}
                      disabled={isLoading}
                      className={`w-full px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-lg ${
                        isLoading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                      }`}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Verifying...</span>
                        </span>
                      ) : (
                        'Verify & Enter'
                      )}
                    </button>

                    <button
                      onClick={() => setStep(1)}
                      className="w-full text-sm text-gray-600 hover:text-gray-800 font-medium"
                    >
                      ← Change ABHA ID
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            Protected by ABHA • Powered by AWS Bedrock AI
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthLogin
