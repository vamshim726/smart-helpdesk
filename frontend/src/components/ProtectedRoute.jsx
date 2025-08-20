import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { 
  selectIsAuthenticated, 
  selectCurrentUser, 
  selectAuthLoading,
  selectUserRole 
} from '../store/authSlice'
import LoadingSpinner from './LoadingSpinner'

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredRoles = null,
  redirectTo = '/login',
  showLoading = true 
}) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)
  const loading = useSelector(selectAuthLoading)
  const userRole = useSelector(selectUserRole)
  const location = useLocation()

  // Check if user has required role(s)
  const hasRequiredRole = () => {
    if (!requiredRole && !requiredRoles) return true
    
    if (requiredRole) {
      return userRole === requiredRole
    }
    
    if (requiredRoles) {
      return Array.isArray(requiredRoles) 
        ? requiredRoles.includes(userRole)
        : requiredRoles === userRole
    }
    
    return true
  }

  // Show loading spinner while checking authentication
  if (loading && showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Check role-based access
  if (!hasRequiredRole()) {
    // Redirect to dashboard or show access denied
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
            {requiredRole && (
              <span className="block text-sm text-gray-500 mt-1">
                Required role: {requiredRole}
              </span>
            )}
            {requiredRoles && Array.isArray(requiredRoles) && (
              <span className="block text-sm text-gray-500 mt-1">
                Required roles: {requiredRoles.join(', ')}
              </span>
            )}
          </p>
          <Navigate to="/dashboard" replace />
        </div>
      </div>
    )
  }

  return children
}

// Convenience components for common role requirements
export const AdminRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="admin" {...props}>
    {children}
  </ProtectedRoute>
)

export const AgentRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="agent" {...props}>
    {children}
  </ProtectedRoute>
)

export const UserRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="user" {...props}>
    {children}
  </ProtectedRoute>
)

export const StaffRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRoles={['admin', 'agent']} {...props}>
    {children}
  </ProtectedRoute>
)

export const RoleRoute = ({ children, roles, ...props }) => (
  <ProtectedRoute requiredRoles={roles} {...props}>
    {children}
  </ProtectedRoute>
)

export default ProtectedRoute
