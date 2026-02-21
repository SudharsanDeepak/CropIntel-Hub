import { useState } from 'react'
import { X, Mail, Lock, User, Chrome, Shield, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
const SignupModal = () => {
  const { isSignupOpen, setIsSignupOpen, setIsLoginOpen, sendOTPSignup, verifyOTPSignup, loginWithGoogle } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOTP] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState(1) 
  const [devOTP, setDevOTP] = useState('') 
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const validate = () => {
    const newErrors = {}
    if (name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid'
    }
    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const result = await sendOTPSignup(email)
    setLoading(false)
    if (result.success) {
      if (result.devMode && result.otp) {
        setDevOTP(result.otp) 
      }
      setStep(2)
    }
  }
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    const result = await verifyOTPSignup(name, email, password, otp)
    setLoading(false)
    if (result.success) {
      setStep(1)
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setOTP('')
      setErrors({})
    }
  }
  const handleGoogleSignup = () => {
    loginWithGoogle()
  }
  const switchToLogin = () => {
    setIsSignupOpen(false)
    setIsLoginOpen(true)
    setStep(1)
    setName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setOTP('')
    setErrors({})
    setShowPassword(false)
    setShowConfirmPassword(false)
  }
  const handleClose = () => {
    setIsSignupOpen(false)
    setStep(1)
    setName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setOTP('')
    setDevOTP('')
    setErrors({})
    setShowPassword(false)
    setShowConfirmPassword(false)
  }
  return (
    <AnimatePresence>
      {isSignupOpen && (
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8 text-white relative">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <h2 className="text-2xl font-bold">Create Account</h2>
                <p className="text-primary-100 mt-1">
                  {step === 1 ? 'Join Market Intelligence today' : 'Verify your email'}
                </p>
              </div>
              {}
              <div className="p-6">
                {step === 1 ? (
                  <>
                    {}
                    <button
                      type="button"
                      onClick={handleGoogleSignup}
                      className="w-full flex items-center justify-center px-4 py-3 border-2 border-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors mb-6"
                    >
                      <Chrome className="h-5 w-5 text-primary-600 mr-2" />
                      <span className="text-primary-700 font-semibold">Sign up with Google</span>
                    </button>
                    {}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
                      </div>
                    </div>
                    {}
                    <form onSubmit={handleSendOTP} className="space-y-4">
                      {}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`input-field pl-10 ${errors.name ? 'border-red-500' : ''}`}
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                      </div>
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
                            className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                            placeholder="you@example.com"
                            required
                          />
                        </div>
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
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
                            className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
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
                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                      </div>
                      {}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`input-field pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                      </div>
                      {}
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          required
                          className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label className="ml-2 text-sm text-gray-600">
                          I agree to the{' '}
                          <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                            Terms of Service
                          </a>{' '}
                          and{' '}
                          <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                            Privacy Policy
                          </a>
                        </label>
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
                        {loading ? 'Creating account...' : 'Verify & Create Account'}
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
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={switchToLogin}
                      className="text-primary-600 hover:text-primary-700 font-semibold"
                    >
                      Sign in
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
export default SignupModal