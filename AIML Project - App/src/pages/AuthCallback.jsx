import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import axiosInstance from '../utils/axiosConfig'

const AuthCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setUser } = useAuth()
  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token')
      const error = searchParams.get('error')
      if (error) {
        toast.error('Authentication failed. Please try again.')
        navigate('/')
        return
      }
      if (token) {
        try {
          localStorage.setItem('token', token)
          const response = await axiosInstance.get('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          if (response.data.success) {
            const user = response.data.user
            setUser(user)
            localStorage.setItem('user', JSON.stringify(user))
            toast.success('Welcome!')
            navigate('/')
          } else {
            throw new Error('Failed to fetch user')
          }
        } catch (error) {
          console.error('Auth callback error:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          toast.error(error.userMessage || 'Authentication failed')
          navigate('/')
        }
      } else {
        navigate('/')
      }
    }
    handleCallback()
  }, [searchParams, navigate, setUser])
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}
export default AuthCallback