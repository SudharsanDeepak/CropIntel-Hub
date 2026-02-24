import { useState, useEffect } from 'react'
import { Activity, Bell, Clock, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const AlertMonitoringStats = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [checking, setChecking] = useState(false)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/api/alerts/monitoring/stats`)
      setStats(response.data)
      setError(null)
    } catch (err) {
      console.error('Error fetching monitoring stats:', err)
      setError('Failed to load monitoring statistics')
    } finally {
      setLoading(false)
    }
  }

  const triggerManualCheck = async () => {
    try {
      setChecking(true)
      await axios.post(`${API_URL}/api/alerts/monitoring/check`)
      // Refresh stats after check
      await fetchStats()
    } catch (err) {
      console.error('Error triggering manual check:', err)
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    fetchStats()
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading && !stats) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  const { monitoring, alerts } = stats || {}

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Alert Monitoring System</h3>
        </div>
        <button
          onClick={triggerManualCheck}
          disabled={checking}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {checking ? 'Checking...' : 'Check Now'}
        </button>
      </div>

      {/* Monitoring Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Status</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {monitoring?.isRunning ? 'Active' : 'Inactive'}
          </p>
          <p className="text-xs text-green-700 mt-1">
            Checking every {monitoring?.checkInterval || '1 minute'}
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Total Checks</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {monitoring?.totalChecks || 0}
          </p>
          <p className="text-xs text-blue-700 mt-1">
            {monitoring?.lastCheckTime 
              ? `Last: ${new Date(monitoring.lastCheckTime).toLocaleTimeString()}`
              : 'No checks yet'}
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Triggered</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {monitoring?.totalTriggered || 0}
          </p>
          <p className="text-xs text-purple-700 mt-1">
            Total alerts triggered
          </p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">Active Alerts</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {alerts?.active || 0}
          </p>
          <p className="text-xs text-orange-700 mt-1">
            Being monitored now
          </p>
        </div>
      </div>

      {/* Alert Breakdown */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Alert Breakdown</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{alerts?.active || 0}</p>
            <p className="text-xs text-gray-600">Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{alerts?.triggered || 0}</p>
            <p className="text-xs text-gray-600">Triggered</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{alerts?.paused || 0}</p>
            <p className="text-xs text-gray-600">Paused</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{alerts?.total || 0}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {monitoring?.lastError && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Last Error</p>
              <p className="text-xs text-red-700 mt-1">{monitoring.lastError.message}</p>
              <p className="text-xs text-red-600 mt-1">
                {new Date(monitoring.lastError.time).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AlertMonitoringStats
