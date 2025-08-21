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
import TicketList from './pages/TicketList'
import TicketCreate from './pages/TicketCreate'
import TicketDetail from './pages/TicketDetail'
import AdminConfig from './pages/AdminConfig'
import KBArticleView from './pages/KBArticleView'

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

          {/* Tickets */}
          <Route path="/tickets" element={
            <ProtectedRoute>
              <TicketList />
            </ProtectedRoute>
          } />
          <Route path="/tickets/new" element={
            <ProtectedRoute>
              <TicketCreate />
            </ProtectedRoute>
          } />
          <Route path="/tickets/:id" element={
            <ProtectedRoute>
              <TicketDetail />
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

          {/* Public KB view for published articles */}
          <Route path="/kb/:id" element={<KBArticleView />} />

          {/* Admin config */}
          <Route path="/admin/config" element={
            <AdminRoute>
              <AdminConfig />
            </AdminRoute>
          } />

          {/* Agent and Admin routes */}
          {/* Ticket Management merged into Tickets page */}

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
