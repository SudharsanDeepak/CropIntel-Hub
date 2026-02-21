import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { useEffect } from 'react'
const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])
  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
    warning: <AlertCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />
  }
  const styles = {
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
      icon: 'text-white',
      border: 'border-green-400'
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-rose-600',
      icon: 'text-white',
      border: 'border-red-400'
    },
    warning: {
      bg: 'bg-gradient-to-r from-yellow-500 to-amber-600',
      icon: 'text-white',
      border: 'border-yellow-400'
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      icon: 'text-white',
      border: 'border-blue-400'
    }
  }
  const style = styles[type] || styles.info
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`${style.bg} text-white rounded-2xl shadow-2xl border-2 ${style.border} backdrop-blur-sm overflow-hidden max-w-md w-full`}
    >
      <div className="relative">
        {}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
        </div>
        {}
        <div className="relative p-3 flex items-start gap-3">
          {}
          <div className={`${style.icon} flex-shrink-0`}>
            {icons[type]}
          </div>
          {}
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm leading-relaxed">
              {message}
            </p>
          </div>
          {}
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close notification"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
        {}
        {duration > 0 && (
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
            className="h-1 bg-white/30 origin-left"
          />
        )}
      </div>
    </motion.div>
  )
}
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-6 left-6 z-[9998] flex flex-col gap-3 pointer-events-none max-w-md">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
export default Toast