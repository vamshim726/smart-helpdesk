import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Navigation from '../components/Navigation'
import { fetchTickets, selectTickets, selectTicketsLoading, selectTicketsError } from '../store/ticketSlice'
import { selectCurrentUser } from '../store/authSlice'

const btnPrimary = 'inline-flex items-center justify-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition cursor-pointer'
const btnLink = 'text-blue-600 hover:text-blue-900 hover:underline cursor-pointer'
const filterInput = 'w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900'

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    status === 'open' ? 'bg-blue-100 text-blue-800' :
    status === 'triaged' ? 'bg-yellow-100 text-yellow-800' :
    status === 'waiting_human' ? 'bg-orange-100 text-orange-800' :
    status === 'resolved' ? 'bg-green-100 text-green-800' :
    status === 'closed' ? 'bg-gray-100 text-gray-800' :
    'bg-gray-100 text-gray-800'
  }`}>
    {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
  </span>
)

const TicketList = () => {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const items = useSelector(selectTickets)
  const loading = useSelector(selectTicketsLoading)
  const error = useSelector(selectTicketsError)

  const [status, setStatus] = useState('')
  // For admin users, default to showing all tickets; for regular users, default to their own tickets
  const [mine, setMine] = useState(user?.role === 'admin' ? 'false' : 'true')

  useEffect(() => {
    dispatch(fetchTickets({ status, mine }))
  }, [dispatch, mine])

  const handleApply = (e) => {
    e.preventDefault()
    dispatch(fetchTickets({ status, mine }))
  }

  const isAdmin = user?.role === 'admin'
  const pageTitle = isAdmin ? 'All Tickets' : 'My Tickets'
  const pageDescription = isAdmin ? 'Filter and manage all support tickets in the system.' : 'Filter and manage your support tickets.'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600">{pageDescription}</p>
          </div>
          <Link to="/tickets/new" className={btnPrimary + " cursor-pointer"}>New Ticket</Link>
        </header>

        {error && (
          <div className="mb-4">
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">{error?.message || 'Error loading tickets'}</div>
          </div>
        )}

        <section className="mb-6">
          <form onSubmit={handleApply} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select className={filterInput + " cursor-pointer"} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="triaged">Triaged</option>
              <option value="waiting_human">Waiting Human</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            {isAdmin && (
              <select className={filterInput + " cursor-pointer"} value={mine} onChange={(e) => setMine(e.target.value)} aria-label="Ownership">
                <option value="false">All Tickets</option>
                <option value="true">My Tickets</option>
              </select>
            )}
            <div className="flex md:justify-end">
              <button type="submit" className={btnPrimary + " cursor-pointer"}>Apply</button>
            </div>
          </form>
        </section>

        <section className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  {isAdmin && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th scope="col" className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{t.title}</div>
                      <div className="text-xs text-gray-500">Category: {t.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={t.status} /></td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {t.createdBy?.name || 'Unknown'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(t.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/tickets/${t._id}`} className={btnLink + " cursor-pointer"}>View</Link>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && !loading && (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="px-6 py-10 text-center text-gray-500">No tickets found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

export default TicketList
