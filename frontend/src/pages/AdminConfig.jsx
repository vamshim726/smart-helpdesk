import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Navigation from '../components/Navigation'
import { loadConfig, saveConfig, selectConfigData, selectConfigLoading, selectConfigError, selectConfigSuccess, clearConfigStatus } from '../store/configSlice'
import { selectIsAdmin } from '../store/authSlice'
import { useNavigate } from 'react-router-dom'

const AdminConfig = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isAdmin = useSelector(selectIsAdmin)
  const data = useSelector(selectConfigData)
  const loading = useSelector(selectConfigLoading)
  const error = useSelector(selectConfigError)
  const success = useSelector(selectConfigSuccess)

  const [autoCloseEnabled, setAutoCloseEnabled] = useState(false)
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7)
  const [slaHours, setSlaHours] = useState(72)

  useEffect(() => { if (!isAdmin) navigate('/dashboard') }, [isAdmin, navigate])

  useEffect(() => { dispatch(loadConfig()) }, [dispatch])

  useEffect(() => {
    if (data) {
      setAutoCloseEnabled(!!data.autoCloseEnabled)
      setConfidenceThreshold(Number(data.confidenceThreshold || 0.7))
      setSlaHours(Number(data.slaHours || 72))
    }
  }, [data])

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => dispatch(clearConfigStatus()), 2000)
      return () => clearTimeout(t)
    }
  }, [success, dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await dispatch(saveConfig({ autoCloseEnabled, confidenceThreshold, slaHours }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Agent Configuration</h1>
          <p className="mt-2 text-gray-600">Control agent automation settings.</p>
        </div>

        {/* feedback via toasts */}

        <form onSubmit={handleSubmit} className="px-4 sm:px-0 bg-white shadow rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700">Enable Auto Close</div>
              <div className="text-xs text-gray-500">Automatically resolve tickets when confidence is above threshold.</div>
            </div>
            <input type="checkbox" checked={autoCloseEnabled} onChange={(e) => setAutoCloseEnabled(e.target.checked)} />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700">Confidence Threshold</div>
                <div className="text-xs text-gray-500">Only auto-close when classification confidence meets this value.</div>
              </div>
              <div className="text-sm text-gray-700">{confidenceThreshold.toFixed(2)}</div>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SLA Hours</label>
            <input
              type="number"
              min="1"
              value={slaHours}
              onChange={(e) => setSlaHours(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminConfig
