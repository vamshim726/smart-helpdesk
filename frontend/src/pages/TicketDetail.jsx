import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Navigation from '../components/Navigation'
import { useParams } from 'react-router-dom'
import { fetchTicket, selectTicketCurrent, selectTicketsLoading, selectTicketsError, clearTicketCurrent } from '../store/ticketSlice'

const Field = ({ label, children }) => (
  <div>
    <div className="text-sm font-medium text-gray-500">{label}</div>
    <div className="mt-1 text-gray-900">{children}</div>
  </div>
)

const TicketDetail = () => {
  const dispatch = useDispatch()
  const { id } = useParams()
  const ticket = useSelector(selectTicketCurrent)
  const loading = useSelector(selectTicketsLoading)
  const error = useSelector(selectTicketsError)

  useEffect(() => {
    dispatch(fetchTicket(id))
    return () => dispatch(clearTicketCurrent())
  }, [dispatch, id])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Ticket Details</h1>
          <p className="mt-2 text-gray-600">Review the ticket information and history.</p>
        </div>

        {error && (
          <div className="px-4 sm:px-0 mb-4">
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error?.message || 'Error loading ticket'}</div>
          </div>
        )}

        {ticket && (
          <div className="px-4 sm:px-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white shadow rounded-lg p-6 space-y-4">
                <Field label="Title">{ticket.title}</Field>
                <Field label="Description">
                  <pre className="whitespace-pre-wrap font-sans">{ticket.description}</pre>
                </Field>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Category">{ticket.category}</Field>
                  <Field label="Status">{ticket.status.replace('_', ' ')}</Field>
                  <Field label="Created By">{ticket.createdBy?.name} ({ticket.createdBy?.email})</Field>
                  <Field label="Assignee">{ticket.assignee ? `${ticket.assignee.name} (${ticket.assignee.email})` : 'Unassigned'}</Field>
                  <Field label="Created At">{new Date(ticket.createdAt).toLocaleString()}</Field>
                  <Field label="Updated At">{new Date(ticket.updatedAt).toLocaleString()}</Field>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <div className="text-lg font-medium text-gray-900 mb-4">History</div>
                <div className="text-gray-500 text-sm">History/events will appear here.</div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="text-lg font-medium text-gray-900 mb-4">Suggested KB Article</div>
                {ticket.agentSuggestion ? (
                  <div>
                    <div className="font-medium">{ticket.agentSuggestion.title}</div>
                    <div className="text-sm text-gray-500">Status: {ticket.agentSuggestion.status}</div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No suggestion yet.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {!ticket && !loading && (
          <div className="px-4 sm:px-0 text-gray-500">Ticket not found.</div>
        )}
      </div>
    </div>
  )
}

export default TicketDetail
