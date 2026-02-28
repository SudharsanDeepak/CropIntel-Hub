import { useState } from 'react'
import { X, Mail, Lock, Chrome, Shield, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
const LoginModal = () => {
  const { isLoginOpen, setIsLoginOpen, setIsSignupOpen, sendOTPLogin, verifyOTPLogin, loginWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOTP] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) 
  const [devOTP, setDevOTP] = useState('') 
  const [showPassword, setShowPassword] = useState(false)
  const handleSendOTP = async (e) => {
    e.preventDefault()
    
    setLoading(true)
    try {
      const result = await sendOTPLogin(email, password)
      
      if (result.success) {
        if (result.devMode && result.otp) {
          setDevOTP(result.otp) 
        }
        setStep(2)
      }
      // Error already shown by toast in AuthContext
    } catch (error) {
      console.error('Login OTP error:', error)
    } finally {
      setLoading(false)
    }
  }
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    
    setLoading(true)
    try {
      const result = await verifyOTPLogin(email, otp)
      
      if (result.success) {
        setStep(1)
        setEmail('')
        setPassword('')
        setOTP('')
      }
      // Error already shown by toast in AuthContext
    } catch (error) {
      console.error('Verify OTP error:', error)
    } finally {
      setLoading(false)
    }
  }
  const handleGoogleLogin = () => {
    loginWithGoogle()
  }
  const switchToSignup = () => {
    setIsLoginOpen(false)
    setIsSignupOpen(true)
    setStep(1)
    setEmail('')
    setPassword('')
    setOTP('')
    setDevOTP('')
    setShowPassword(false)
  }
  const handleClose = () => {
    setIsLoginOpen(false)
    setStep(1)
    setEmail('')
    setPassword('')
    setOTP('')
    setDevOTP('')
    setShowPassword(false)
  }
  return (
    <AnimatePresence>
      {isLoginOpen && (
        <>
          {}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            {}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8 text-white relative">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <h2 className="text-2xl font-bold">Welcome Back!</h2>
                <p className="text-primary-100 mt-1">
                  {step === 1 ? 'Sign in to continue' : 'Enter verification code'}
                </p>
              </div>
              {}
              <div className="p-6">
                {step === 1 ? (
                  <>
                    {}
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="w-full flex items-center justify-center px-4 py-3 border-2 border-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors mb-6"
                    >
                      <Chrome className="h-5 w-5 text-primary-600 mr-2" />
                      <span className="text-primary-700 font-semibold">Sign in with Google</span>
                    </button>
                    {}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or sign in with email</span>
                      </div>
                    </div>
                    {}
                    <form onSubmit={handleSendOTP} className="space-y-4">
                      {}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field pl-10"
                            placeholder="you@example.com"
                            required
                          />
                        </div>
                      </div>
                      {}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field pl-10 pr-10"
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      {}
                      <div className="flex items-center justify-between">
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                          <span className="ml-2 text-sm text-gray-600">Remember me</span>
                        </label>
                        <button type="button" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                          Forgot password?
                        </button>
                      </div>
                      {}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Sending OTP...' : 'Continue'}
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    {}
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                        <Shield className="h-8 w-8 text-primary-600" />
                      </div>
                      <p className="text-gray-600">
                        We've sent a 6-digit code to<br />
                        <strong>{email}</strong>
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Please check your email inbox (and spam folder)
                      </p>
                    </div>
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                      {}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                          Enter Verification Code
                        </label>
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="input-field text-center text-2xl tracking-widest font-bold"
                          placeholder="000000"
                          maxLength="6"
                          required
                        />
                      </div>
                      {}
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setStep(1)
                            setOTP('')
                            setDevOTP('')
                          }}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Didn't receive code? Try again
                        </button>
                      </div>
                      {}
                      <button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        className="w-full btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Verifying...' : 'Verify & Sign In'}
                      </button>
                      {}
                      <button
                        type="button"
                        onClick={() => {
                          setStep(1)
                          setOTP('')
                          setDevOTP('')
                        }}
                        className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium"
                      >
                        Back
                      </button>
                    </form>
                  </>
                )}
                {}
                {step === 1 && (
                  <p className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={switchToSignup}
                      className="text-primary-600 hover:text-primary-700 font-semibold"
                    >
                      Sign up
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
export default LoginModal