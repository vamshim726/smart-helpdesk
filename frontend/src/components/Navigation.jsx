import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { logoutUser, selectCurrentUser, selectIsAuthenticated, selectIsAdmin, selectIsAgent } from '../store/authSlice'
import NotificationBell from './NotificationBell'

const Navigation = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  
  const user = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isAdmin = useSelector(selectIsAdmin)
  const isAgent = useSelector(selectIsAgent)
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const isActiveRoute = (path) => {
    return location.pathname === path
  }

  const getNavLinkClass = (path) => {
    return `
      px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
      ${isActiveRoute(path)
        ? 'bg-blue-100 text-blue-700'
        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
      }
    `
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="text-xl font-bold text-blue-600">
                Smart Helpdesk
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              <Link to="/dashboard" className={getNavLinkClass('/dashboard')}>
                Dashboard
              </Link>
              
              <Link to="/tickets" className={getNavLinkClass('/tickets')}>
                Tickets
              </Link>
              
              {(isAgent || isAdmin) && (
                <Link to="/ticket-management" className={getNavLinkClass('/ticket-management')}>
                  Ticket Management
                </Link>
              )}
              
              {isAdmin && (
                <>
                  <Link to="/admin/kb" className={getNavLinkClass('/admin/kb')}>
                    KB
                  </Link>
                  <Link to="/admin/users" className={getNavLinkClass('/admin/users')}>
                    Users
                  </Link>
                  <Link to="/admin/config" className={getNavLinkClass('/admin/config')}>
                    Config
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* User menu and mobile menu button */}
          <div className="flex items-center space-x-3">
            <NotificationBell />
            <div className="relative ml-1">
              <div>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="ml-2 text-gray-700 hidden sm:block">
                    {user?.name}
                  </span>
                  <svg
                    className="ml-1 h-4 w-4 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* User dropdown menu */}
              {isUserMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                    <div className="font-medium">{user?.name}</div>
                    <div className="text-gray-500">{user?.email}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Role: {user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1)}
                    </div>
                  </div>
                  
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Your Profile
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden ml-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 cursor-pointer"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
            <Link
              to="/dashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActiveRoute('/dashboard')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            
            <Link
              to="/tickets"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActiveRoute('/tickets')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Tickets
            </Link>
            
            {/* Agent and Admin can see ticket management */}
            {(isAgent || isAdmin) && (
              <Link
                to="/ticket-management"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActiveRoute('/ticket-management')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Ticket Management
              </Link>
            )}
            
            {/* Admin-only menu items */}
            {isAdmin && (
              <>
                <Link
                  to="/admin/users"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActiveRoute('/admin/users')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Users
                </Link>
                
                <Link
                  to="/admin/stats"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActiveRoute('/admin/stats')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Statistics
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navigation
