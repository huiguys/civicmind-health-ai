import { useState } from 'react'

function AuthLogin({ role, onLoginSuccess, onBack }) {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")

  const handleDoctorLogin = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onLoginSuccess()
    }, 1000)
  }

  const handleGetOtp = () => {
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
      onLoginSuccess()
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full mx-auto mt-20 p-8 shadow-lg rounded-xl bg-white">
        <button
          onClick={onBack}
          className="mb-6 text-gray-600 hover:text-gray-800 font-medium flex items-center space-x-1"
        >
          <span>&lt;</span>
          <span>Back</span>
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {role === 'doctor' ? '👨‍⚕️ Doctor Login' : '📱 Patient Login'}
          </h2>
        </div>

        {role === 'doctor' ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@hospital.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleDoctorLogin}
              disabled={isLoading}
              className={`w-full px-6 py-4 rounded-lg font-bold shadow-md hover:shadow-lg transition-all ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLoading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleGetOtp}
                  disabled={isLoading}
                  className={`w-full px-6 py-4 rounded-lg font-bold shadow-md hover:shadow-lg transition-all ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isLoading ? 'Sending OTP...' : 'Get OTP'}
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">4-Digit OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength="4"
                    placeholder="0000"
                    className="w-full px-4 py-3 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent tracking-widest"
                  />
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={isLoading}
                  className={`w-full px-6 py-4 rounded-lg font-bold shadow-md hover:shadow-lg transition-all ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isLoading ? 'Verifying...' : 'Verify & Enter'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthLogin
