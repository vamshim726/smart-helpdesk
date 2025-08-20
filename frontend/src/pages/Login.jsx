import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser, clearError, selectAuthLoading, selectAuthError } from '../store/authSlice'
import { validateForm, formatValidationError } from '../utils/validation'
import FormInput from '../components/FormInput'
import LoadingSpinner from '../components/LoadingSpinner'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const loading = useSelector(selectAuthLoading)
  const error = useSelector(selectAuthError)

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [validationErrors, setValidationErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Clear any existing errors when component mounts
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))

    // Validate field on blur
    const fieldValidation = validateForm({ [name]: formData[name] }, 'login')
    if (fieldValidation.errors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: fieldValidation.errors[name]
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate entire form
    const validation = validateForm(formData, 'login')
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      setTouched({
        email: true,
        password: true
      })
      return
    }

    try {
      const result = await dispatch(loginUser(formData)).unwrap()
      if (result.user) {
        navigate('/dashboard')
      }
    } catch (error) {
      // Error is handled by Redux slice
      console.error('Login failed:', error)
    }
  }

  const getFieldError = (fieldName) => {
    return touched[fieldName] ? (validationErrors[fieldName] || null) : null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <FormInput
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email"
              required
              error={getFieldError('email')}
              disabled={loading}
            />

            <FormInput
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your password"
              required
              error={getFieldError('password')}
              disabled={loading}
            />
          </div>

          {/* Server Error Display */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {formatValidationError(error)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`
                group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white
                ${loading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }
              `}
            >
              {loading ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/forgot-password"
              className="font-medium text-blue-600 hover:text-blue-500 text-sm"
            >
              Forgot your password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
