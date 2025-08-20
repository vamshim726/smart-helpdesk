// Form validation utility functions

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) return 'Email is required'
  if (!emailRegex.test(email)) return 'Please enter a valid email address'
  return null
}

export const validatePassword = (password) => {
  if (!password) return 'Password is required'
  if (password.length < 6) return 'Password must be at least 6 characters long'
  if (password.length > 128) return 'Password cannot exceed 128 characters'
  return null
}

export const validateName = (name) => {
  if (!name) return 'Name is required'
  if (name.trim().length < 2) return 'Name must be at least 2 characters long'
  if (name.trim().length > 50) return 'Name cannot exceed 50 characters'
  if (!/^[a-zA-Z\s]+$/.test(name.trim())) return 'Name can only contain letters and spaces'
  return null
}

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password'
  if (password !== confirmPassword) return 'Passwords do not match'
  return null
}

export const validateForm = (values, formType = 'login') => {
  const errors = {}

  if (formType === 'login') {
    const emailError = validateEmail(values.email)
    const passwordError = validatePassword(values.password)

    if (emailError) errors.email = emailError
    if (passwordError) errors.password = passwordError
  }

  if (formType === 'register') {
    const nameError = validateName(values.name)
    const emailError = validateEmail(values.email)
    const passwordError = validatePassword(values.password)
    const confirmPasswordError = validateConfirmPassword(values.password, values.confirmPassword)

    if (nameError) errors.name = nameError
    if (emailError) errors.email = emailError
    if (passwordError) errors.password = passwordError
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const formatValidationError = (error) => {
  if (typeof error === 'string') return error
  
  if (error?.message) return error.message
  
  if (error?.error) {
    const errorMessages = {
      'MISSING_FIELDS': 'Please fill in all required fields',
      'VALIDATION_ERROR': 'Please check your input and try again',
      'EMAIL_EXISTS': 'An account with this email already exists',
      'INVALID_CREDENTIALS': 'Invalid email or password',
      'WEAK_PASSWORD': 'Password is too weak',
      'NETWORK_ERROR': 'Network error occurred. Please check your connection',
      'NO_TOKEN': 'Authentication required',
      'INVALID_TOKEN': 'Session expired. Please login again',
             'INSUFFICIENT_PERMISSIONS': 'You do not have permission to access this resource',
       'INVALID_ROLE': 'Invalid role specified. Must be admin, agent, or user.',
      'USER_NOT_FOUND': 'User not found',
      'ACCOUNT_DEACTIVATED': 'Your account has been deactivated'
    }
    
    return errorMessages[error.error] || error.message || 'An error occurred'
  }
  
  return 'An unexpected error occurred'
}
