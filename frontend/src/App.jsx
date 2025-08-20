import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { useDispatch, useSelector } from 'react-redux'
import { selectIsAuthenticated, selectAuthToken, fetchUserProfile } from './store/authSlice'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminUsers from './pages/AdminUsers'
import ProtectedRoute, { AdminRoute, AgentRoute, UserRoute, StaffRoute } from './components/ProtectedRoute'
import Navigation from './components/Navigation'
import AdminKBList from './pages/AdminKBList'
import AdminKBEditor from './pages/AdminKBEditor'

// App Routes Component (needs to be inside Redux Provider)
const AppRoutes = () => {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const token = useSelector(selectAuthToken)

  // Fetch user profile if we have a token but no user data
  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(fetchUserProfile())
    }
  }, [token, isAuthenticated, dispatch])

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
          } />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* Admin-only routes */}
          <Route path="/admin/users" element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          } />

          {/* KB management */}
          <Route path="/admin/kb" element={
            <AdminRoute>
              <AdminKBList />
            </AdminRoute>
          } />
          <Route path="/admin/kb/:id" element={
            <AdminRoute>
              <AdminKBEditor />
            </AdminRoute>
          } />

          {/* Agent and Admin routes */}
          <Route path="/ticket-management" element={
            <StaffRoute>
              <div className="min-h-screen bg-gray-50">
                <Navigation />
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                  <div className="px-4 py-6 sm:px-0">
                    <h1 className="text-3xl font-bold text-gray-900">Ticket Management</h1>
                    <p className="mt-2 text-gray-600">Manage and resolve support tickets.</p>
                  </div>
                  <div className="px-4 sm:px-0">
                    <div className="bg-white shadow rounded-lg p-6">
                      <p className="text-gray-500">Ticket management interface coming soon...</p>
                    </div>
                  </div>
                </div>
              </div>
            </StaffRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          } />

          {/* Catch-all route */}
          <Route path="*" element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          } />
        </Routes>
      </div>
    </Router>
  )
}

function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  )
}

export default App
