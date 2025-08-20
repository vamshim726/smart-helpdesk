import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser, clearError, selectAuthLoading, selectAuthError } from '../store/authSlice'
import { validateForm, formatValidationError } from '../utils/validation'
import FormInput from '../components/FormInput'
import LoadingSpinner from '../components/LoadingSpinner'

const Register = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const loading = useSelector(selectAuthLoading)
  const error = useSelector(selectAuthError)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    // Special handling for password confirmation
    if (name === 'password' && formData.confirmPassword) {
      const confirmError = validateForm({
        password: value,
        confirmPassword: formData.confirmPassword
      }, 'register').errors.confirmPassword
      
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: confirmError
      }))
    }

    if (name === 'confirmPassword' && formData.password) {
      const confirmError = validateForm({
        password: formData.password,
        confirmPassword: value
      }, 'register').errors.confirmPassword
      
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: confirmError
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
    const fieldValidation = validateForm({ [name]: formData[name] }, 'register')
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
    const validation = validateForm(formData, 'register')
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      setTouched({
        name: true,
        email: true,
        password: true,
        confirmPassword: true
      })
      return
    }

    try {
      const { confirmPassword, ...registrationData } = formData
      const result = await dispatch(registerUser(registrationData)).unwrap()
      if (result.user) {
        navigate('/dashboard')
      }
    } catch (error) {
      // Error is handled by Redux slice
      console.error('Registration failed:', error)
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
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <FormInput
              label="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your full name"
              required
              error={getFieldError('name')}
              disabled={loading}
            />

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
              placeholder="Create a password (min 6 characters)"
              required
              error={getFieldError('password')}
              disabled={loading}
            />

            <FormInput
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Confirm your password"
              required
              error={getFieldError('confirmPassword')}
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
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </div>

          <div className="text-center text-sm text-gray-600">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
