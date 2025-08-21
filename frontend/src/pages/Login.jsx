import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser, clearError, selectAuthLoading } from '../store/authSlice'
import { validateForm, formatValidationError } from '../utils/validation'

const inputBase = 'w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400'
const btnPrimary = 'inline-flex items-center justify-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed'
const card = 'bg-white shadow-sm rounded-lg p-6 border border-gray-100'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const loading = useSelector(selectAuthLoading)
  const error = null

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [validationErrors, setValidationErrors] = useState({})
  const [touched, setTouched] = useState({})

  useEffect(() => { dispatch(clearError()) }, [dispatch])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (validationErrors[name]) setValidationErrors(prev => ({ ...prev, [name]: null }))
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    const v = validateForm({ [name]: formData[name] }, 'login')
    if (v.errors[name]) setValidationErrors(prev => ({ ...prev, [name]: v.errors[name] }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const v = validateForm(formData, 'login')
    if (!v.isValid) {
      setValidationErrors(v.errors); setTouched({ email: true, password: true }); return
    }
    try {
      const result = await dispatch(loginUser(formData)).unwrap()
      if (result.user) navigate('/dashboard')
    } catch {}
  }

  const fieldError = (name) => touched[name] ? validationErrors[name] : null

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <header className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sign in to your account</h1>
          <p className="mt-2 text-sm text-gray-600">or <Link to="/register" className="text-blue-600 hover:text-blue-500 font-medium">create a new account</Link></p>
        </header>

        {/* Sample accounts for assignment */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Sample Accounts</h3>
          <div className="space-y-1 text-xs text-blue-800">
            <div><strong>Admin:</strong> admin@gmail.com / 123456</div>
            <div><strong>Agent:</strong> agent@gmail.com / 123456</div>
            <div><strong>User:</strong> user1@gmail.com / 123456</div>
          </div>
        </div>

        {/* feedback via toasts */}

        <form onSubmit={handleSubmit} className={`${card} space-y-5`}>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
            <input id="email" name="email" type="email" required className={inputBase} value={formData.email} onChange={handleChange} onBlur={handleBlur} placeholder="you@example.com" />
            {fieldError('email') && <p className="text-xs text-red-600">{fieldError('email')}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input id="password" name="password" type="password" required className={inputBase} value={formData.password} onChange={handleChange} onBlur={handleBlur} placeholder="••••••••" />
            {fieldError('password') && <p className="text-xs text-red-600">{fieldError('password')}</p>}
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading} className={btnPrimary}>{loading ? 'Signing in…' : 'Sign in'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
