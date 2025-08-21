import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logoutUser, selectCurrentUser, selectIsAuthenticated } from '../store/authSlice'
import { fetchTickets, selectTickets } from '../store/ticketSlice'
import Navigation from '../components/Navigation'

const card = 'bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-100 dark:border-gray-700'
const statIcon = (bg, text) => `h-8 w-8 rounded-md ${bg} flex items-center justify-center ${text}`
const quickCard = 'relative group bg-white dark:bg-gray-800 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow transition cursor-pointer'

const Dashboard = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const tickets = useSelector(selectTickets)

  useEffect(() => { 
    if (!isAuthenticated) navigate('/login') 
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (isAuthenticated && user) {
      // Admin: all tickets; Agent: assigned; User: mine
      if (user.role === 'admin') {
        dispatch(fetchTickets({}))
      } else if (user.role === 'agent') {
        dispatch(fetchTickets({ assigned: 'true' }))
      } else {
        dispatch(fetchTickets({ mine: 'true' }))
      }
    }
  }, [dispatch, isAuthenticated, user?.role, user?.id])

  const handleLogout = async () => { try { await dispatch(logoutUser()).unwrap(); navigate('/login') } catch {} }

  // Calculate ticket counts
  const totalTickets = tickets.length
  const openTickets = tickets.filter(ticket => 
    ['open', 'triaged', 'waiting_human'].includes(ticket.status)
  ).length
  const resolvedTickets = tickets.filter(ticket => 
    ['resolved', 'closed'].includes(ticket.status)
  ).length

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Welcome back, {user?.name}. 
              {user?.role === 'admin' ? ' Here\'s an overview of all tickets.' : user?.role === 'agent' ? ' Here\'s an overview of your assigned tickets.' : ' Here\'s a quick overview of your tickets.'}
            </p>
          </div>
          <button onClick={handleLogout} className="inline-flex items-center justify-center px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition cursor-pointer">Logout</button>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
          <div className={card}>
            <div className="flex items-center">
              <div className={statIcon('bg-blue-500/10','text-blue-600 dark:text-blue-400')}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {user?.role === 'admin' ? 'Total Tickets' : user?.role === 'agent' ? 'Assigned Tickets' : 'My Tickets'}
                </dt>
                <dd className="text-xl font-semibold text-gray-900 dark:text-white">{totalTickets}</dd>
              </div>
            </div>
          </div>
          <div className={card}>
            <div className="flex items-center">
              <div className={statIcon('bg-yellow-500/10','text-yellow-600 dark:text-yellow-400')}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {user?.role === 'admin' ? 'Open Tickets' : 'My Open Tickets'}
                </dt>
                <dd className="text-xl font-semibold text-gray-900 dark:text-white">{openTickets}</dd>
              </div>
            </div>
          </div>
          <div className={card}>
            <div className="flex items-center">
              <div className={statIcon('bg-green-500/10','text-green-600 dark:text-green-400')}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {user?.role === 'admin' ? 'Resolved Tickets' : 'My Resolved Tickets'}
                </dt>
                <dd className="text-xl font-semibold text-gray-900 dark:text-white">{resolvedTickets}</dd>
              </div>
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {user?.role === 'user' && (
            <button className={quickCard} onClick={() => navigate('/tickets/new')}>
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white dark:ring-gray-900 dark:bg-blue-900/30">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6"/></svg>
                </span>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Create New Ticket
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Submit a new support ticket for assistance.</p>
              </div>
            </button>
          )}

          <button className={quickCard} onClick={() => navigate('/tickets')}>
            <div>
              <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white dark:ring-gray-900 dark:bg-green-900/30">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/></svg>
              </span>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {user?.role === 'admin' ? 'View All Tickets' : user?.role === 'agent' ? 'View Assigned Tickets' : 'View My Tickets'}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {user?.role === 'admin' ? 'Check the status of all tickets in the system.' : user?.role === 'agent' ? 'Check the status of tickets assigned to you.' : 'Check the status of your existing tickets.'}
              </p>
            </div>
          </button>

          {(user?.role === 'admin') && (
            <button className={quickCard} onClick={() => navigate('/admin/users')}>
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white dark:ring-gray-900 dark:bg-purple-900/30">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </span>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manage Users</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Admin panel for user management.</p>
              </div>
            </button>
          )}
        </section>
      </main>
    </div>
  )
}

export default Dashboard
