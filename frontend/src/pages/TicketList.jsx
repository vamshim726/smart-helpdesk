import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Navigation from '../components/Navigation'
import { fetchTickets, selectTickets, selectTicketsLoading, selectTicketsError } from '../store/ticketSlice'
import { Link } from 'react-router-dom'

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    status === 'open' ? 'bg-blue-100 text-blue-800' :
    status === 'triaged' ? 'bg-yellow-100 text-yellow-800' :
    status === 'waiting_human' ? 'bg-purple-100 text-purple-800' :
    status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }`}>
    {status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
  </span>
)

const TicketList = () => {
  const dispatch = useDispatch()
  const items = useSelector(selectTickets)
  const loading = useSelector(selectTicketsLoading)
  const error = useSelector(selectTicketsError)

  const [status, setStatus] = useState('')
  const [mine, setMine] = useState('true')

  useEffect(() => {
    dispatch(fetchTickets({ status, mine }))
  }, [dispatch])

  const handleApply = (e) => {
    e.preventDefault()
    dispatch(fetchTickets({ status, mine }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
              <p className="mt-2 text-gray-600">View your support tickets.</p>
            </div>
            <Link
              to="/tickets/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              New Ticket
            </Link>
          </div>
        </div>

        {error && (
          <div className="px-4 sm:px-0 mb-4">
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error?.message || 'Error loading tickets'}</div>
          </div>
        )}

        <div className="px-4 sm:px-0 mb-6">
          <form onSubmit={handleApply} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              className="border border-gray-300 rounded-md px-3 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="triaged">Triaged</option>
              <option value="waiting_human">Waiting Human</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select
              className="border border-gray-300 rounded-md px-3 py-2"
              value={mine}
              onChange={(e) => setMine(e.target.value)}
            >
              <option value="true">My Tickets</option>
              <option value="false">All Tickets</option>
            </select>
            <button
              type="submit"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-700 hover:bg-gray-800"
            >
              Apply
            </button>
          </form>
        </div>

        <div className="px-4 sm:px-0 bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{t.title}</div>
                      <div className="text-xs text-gray-500">Category: {t.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/tickets/${t._id}`} className="px-3 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200">View</Link>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500">No tickets found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketList
