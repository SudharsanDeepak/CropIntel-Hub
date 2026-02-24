import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Plus, X, Mail, TrendingDown, TrendingUp, Trash2, Edit, Check, AlertCircle, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { ToastContainer } from '../components/Toast'
import { useToast } from '../hooks/useToast'
import ConfirmModal from '../components/ConfirmModal'
import { useConfirm } from '../hooks/useConfirm'
import { useAuth } from '../context/AuthContext'
import { withAuth } from '../utils/authHeaders'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const Alerts = () => {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState([])
  const [products, setProducts] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingAlert, setEditingAlert] = useState(null) 
  const { toasts, removeToast, success, error, warning, info } = useToast()
  const { confirmState, confirm, close: closeConfirm } = useConfirm()
  const [formData, setFormData] = useState({
    product: '',
    targetPrice: '',
    condition: 'below', 
    notifyOnce: false
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  useEffect(() => {
    fetchProducts()
    fetchAlerts()
  }, [])
  
  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${API_URL}/api/products/latest`, {
        timeout: 10000
      })
      setProducts(response.data || [])
    } catch (err) {
      console.error('Error fetching products:', err)
      error('Failed to load products. Please refresh the page.')
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }
  
  const fetchAlerts = async () => {
    try {
      // Use authenticated request - no need to pass email
      const response = await axios.get(`${API_URL}/api/alerts`, withAuth({
        timeout: 10000
      }));
      setAlerts(response.data || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      error('Failed to load alerts. Please try again.')
      const savedAlerts = localStorage.getItem('priceAlerts');
      if (savedAlerts) {
        setAlerts(JSON.parse(savedAlerts));
      }
    }
  };
  const validateForm = () => {
    const errors = {}
    if (!formData.product) {
      errors.product = 'Please select a product'
    }
    if (!formData.targetPrice || parseFloat(formData.targetPrice) <= 0) {
      errors.targetPrice = 'Please enter a valid price'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }
  const handleCreateAlert = async () => {
    if (!validateForm()) return
    setIsSubmitting(true)
    try {
      const selectedProduct = products.find(p => p.product === formData.product)
      if (editingAlert) {
        await axios.put(`${API_URL}/api/alerts/${editingAlert._id}`, {
          product: formData.product,
          targetPrice: parseFloat(formData.targetPrice),
          condition: formData.condition,
          notifyOnce: formData.notifyOnce,
        }, withAuth());
        success('Price alert updated successfully!')
      } else {
        await axios.post(`${API_URL}/api/alerts`, {
          product: formData.product,
          targetPrice: parseFloat(formData.targetPrice),
          condition: formData.condition,
          notifyOnce: formData.notifyOnce,
        }, withAuth());
        success('Price alert created! You will receive an email when the price condition is met.')
      }
      await fetchAlerts()
      setFormData({
        product: '',
        targetPrice: '',
        condition: 'below',
        notifyOnce: false
      })
      setEditingAlert(null)
      setShowCreateModal(false)
    } catch (err) {
      console.error('Error saving alert:', err)
      if (err.response?.status === 401) {
        error('Please log in to create alerts.')
      } else {
        error('Failed to save alert. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }
  const handleEditAlert = (alert) => {
    setEditingAlert(alert)
    setFormData({
      product: alert.product,
      targetPrice: alert.targetPrice.toString(),
      condition: alert.condition,
      email: alert.email,
      notifyOnce: alert.notifyOnce
    })
    setShowCreateModal(true)
  }
  const handleDeleteAlert = async (alertId) => {
    const confirmed = await confirm({
      title: 'Delete Alert?',
      message: 'Are you sure you want to delete this price alert? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    })
    if (confirmed) {
      try {
        await axios.delete(`${API_URL}/api/alerts/${alertId}`, withAuth());
        await fetchAlerts();
        success('Alert deleted successfully!')
      } catch (err) {
        console.error('Error deleting alert:', err);
        error('Failed to delete alert. Please try again.')
      }
    }
  }
  const handleToggleAlert = async (alertId) => {
    try {
      await axios.patch(`${API_URL}/api/alerts/${alertId}/toggle`, {}, withAuth());
      await fetchAlerts();
      success('Alert status updated!')
    } catch (err) {
      console.error('Error toggling alert:', err);
      error('Failed to update alert status. Please try again.')
    }
  }
  const handleResetAlert = async (alertId) => {
    try {
      await axios.patch(`${API_URL}/api/alerts/${alertId}/reset`, {}, withAuth());
      await fetchAlerts();
      success('Alert reactivated successfully!')
    } catch (err) {
      console.error('Error resetting alert:', err);
      error('Failed to reset alert. Please try again.')
    }
  }
  const filteredProducts = products.filter(p => 
    p.product.toLowerCase().includes(searchTerm.toLowerCase())
  )
  return (
    <>
      {}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
        isLoading={confirmState.isLoading}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
      {}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Price Alerts</h1>
          <p className="text-gray-600 mt-2">Get notified when prices reach your target via email</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          New Alert
        </button>
      </div>
      {}
      {alerts.length === 0 ? (
        <div className="card text-center py-16">
          <Bell className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Alerts Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create your first price alert to get notified via email when fruits or vegetables reach your target price
          </p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Create Your First Alert
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {alerts.map((alert, index) => (
            <motion.div
              key={alert._id || alert.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`card relative ${
                alert.status === 'paused' ? 'opacity-60' : ''
              }`}
            >
              {}
              <div className="absolute top-4 right-4 flex items-center gap-2 flex-wrap justify-end">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  alert.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : alert.status === 'triggered'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {alert.status === 'active' ? 'Active' : alert.status === 'triggered' ? 'Triggered' : 'Paused'}
                </span>
                {alert.notifyOnce && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    Notify Once
                  </span>
                )}
              </div>
              {}
              <div className="mb-4 pr-24">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{alert.product}</h3>
                <p className="text-sm text-gray-500">
                  Created {new Date(alert.createdAt).toLocaleDateString()}
                </p>
              </div>
              {}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Target Price</p>
                  <p className="text-lg font-bold text-primary-600">₹{alert.targetPrice.toFixed(2)}/kg</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Condition</p>
                  <p className="text-sm font-bold text-gray-900 capitalize">{alert.condition}</p>
                </div>
              </div>
              {}
              <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
                {alert.condition === 'below' ? (
                  <TrendingDown className="h-5 w-5 text-blue-600" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                )}
                <span className="text-sm font-medium text-gray-900">
                  Notify when price goes {alert.condition} ₹{alert.targetPrice.toFixed(2)}/kg
                </span>
              </div>
              {}
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{alert.email}</span>
              </div>
              {}
              {alert.triggered && alert.lastTriggeredAt && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <Check className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Alert triggered on {new Date(alert.lastTriggeredAt).toLocaleString()}
                    </span>
                  </div>
                  {alert.notifyOnce && alert.status === 'triggered' && (
                    <p className="text-xs text-green-600 mt-1">
                      This alert has been automatically disabled (notify once)
                    </p>
                  )}
                </div>
              )}
              {}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEditAlert(alert)}
                  disabled={alert.status === 'triggered'}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    alert.status === 'triggered'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                {alert.status === 'triggered' ? (
                  <button
                    onClick={() => handleResetAlert(alert._id)}
                    className="flex-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Reactivate
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleAlert(alert._id)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      alert.status === 'active'
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {alert.status === 'active' ? 'Pause' : 'Resume'}
                  </button>
                )}
                <button
                  onClick={() => handleDeleteAlert(alert._id)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {editingAlert ? 'Edit Price Alert' : 'Create Price Alert'}
                    </h2>
                    <p className="text-primary-100 mt-1">Get notified via email when price conditions are met</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateModal(false)
                      setEditingAlert(null)
                      setFormData({
                        product: '',
                        targetPrice: '',
                        condition: 'below',
                        email: '',
                        notifyOnce: false
                      })
                    }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              {}
              <div className="p-6 space-y-6">
                {}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Product *
                  </label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                  <select
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    className={`input-field ${formErrors.product ? 'border-red-500' : ''}`}
                  >
                    <option value="">Choose a product...</option>
                    {filteredProducts.map((product) => (
                      <option key={product.product} value={product.product}>
                        {product.product} - Current: ₹{product.price.toFixed(2)}/kg
                      </option>
                    ))}
                  </select>
                  {formErrors.product && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.product}</p>
                  )}
                </div>
                {}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition *
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      className="input-field"
                    >
                      <option value="below">Price goes below</option>
                      <option value="above">Price goes above</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Price (₹/kg) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.targetPrice}
                      onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                      className={`input-field ${formErrors.targetPrice ? 'border-red-500' : ''}`}
                    />
                    {formErrors.targetPrice && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.targetPrice}</p>
                    )}
                  </div>
                </div>
                {}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`input-field ${formErrors.email ? 'border-red-500' : ''}`}
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    We'll send notifications to this email address
                  </p>
                </div>
                {}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="notifyOnce"
                    checked={formData.notifyOnce}
                    onChange={(e) => setFormData({ ...formData, notifyOnce: e.target.checked })}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="notifyOnce" className="text-sm text-gray-700 cursor-pointer">
                    Notify only once (alert will be automatically disabled after first notification)
                  </label>
                </div>
                {}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-1">How it works:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-800">
                        <li>We check prices every hour</li>
                        <li>You'll receive an email when your condition is met</li>
                        <li>You can pause or delete alerts anytime</li>
                        <li>Multiple alerts can be set for different products</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              {}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingAlert(null)
                    setFormData({
                      product: '',
                      targetPrice: '',
                      condition: 'below',
                      email: '',
                      notifyOnce: false
                    })
                  }}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAlert}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {editingAlert ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      {editingAlert ? 'Update Alert' : 'Create Alert'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    </>
  )
}
export default Alerts