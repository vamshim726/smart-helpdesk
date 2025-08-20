import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Navigation from '../components/Navigation'
import { useParams } from 'react-router-dom'
import { fetchTicket, selectTicketCurrent, selectTicketsLoading, selectTicketsError, clearTicketCurrent } from '../store/ticketSlice'
import { fetchSuggestion, fetchAuditLogs, selectAgentSuggestion, selectAgentLogs, agentSendReply, agentReopen, agentClose, selectAgentLoading } from '../store/agentSlice'
import { selectIsAdmin, selectIsAgent } from '../store/authSlice'

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
  const isAdmin = useSelector(selectIsAdmin)
  const isAgent = useSelector(selectIsAgent)

  const suggestion = useSelector(selectAgentSuggestion(id))
  const logs = useSelector(selectAgentLogs(id))
  const agentLoading = useSelector(selectAgentLoading)

  const [reply, setReply] = useState('')

  const canAct = isAdmin || isAgent

  useEffect(() => {
    dispatch(fetchTicket(id))
    dispatch(fetchAuditLogs(id))
    return () => dispatch(clearTicketCurrent())
  }, [dispatch, id])

  useEffect(() => {
    if (canAct) dispatch(fetchSuggestion(id))
  }, [dispatch, id, canAct])

  useEffect(() => {
    if (suggestion?.reply) setReply(suggestion.reply)
  }, [suggestion])

  const handleSendReply = async () => {
    if (!reply.trim()) return
    try {
      await dispatch(agentSendReply({ id, reply })).unwrap()
      dispatch(fetchAuditLogs(id))
    } catch {}
  }

  const handleReopen = async () => {
    await dispatch(agentReopen(id)).unwrap()
    dispatch(fetchTicket(id))
    dispatch(fetchAuditLogs(id))
  }

  const handleClose = async () => {
    await dispatch(agentClose(id)).unwrap()
    dispatch(fetchTicket(id))
    dispatch(fetchAuditLogs(id))
  }

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

              {canAct && (
                <div className="bg-white shadow rounded-lg p-6 space-y-4">
                  <div className="text-lg font-medium text-gray-900">AI Draft Reply</div>
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={10}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono"
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {suggestion?.classification && (
                        <>Classification: {suggestion.classification.category} (confidence {Math.round((suggestion.classification.confidence||0)*100)}%)</>
                      )}
                    </div>
                    <div className="space-x-3">
                      <button onClick={handleReopen} className="px-3 py-2 rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Reopen</button>
                      <button onClick={handleSendReply} disabled={agentLoading} className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">Send Reply</button>
                      <button onClick={handleClose} className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700">Close</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white shadow rounded-lg p-6">
                <div className="text-lg font-medium text-gray-900 mb-4">Audit Log</div>
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log._id} className="flex items-start space-x-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-gray-400" />
                      <div>
                        <div className="text-sm text-gray-900">{log.step}</div>
                        <div className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</div>
                        <div className="text-sm text-gray-700">{log.message}</div>
                      </div>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-sm text-gray-500">No logs yet.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="text-lg font-medium text-gray-900 mb-4">Suggested KB Articles</div>
                <div className="space-y-2">
                  {suggestion?.articles?.map((a) => (
                    <div key={a._id} className="text-sm">
                      <div className="font-medium">{a.title}</div>
                      <div className="text-gray-500">Last updated: {new Date(a.updatedAt).toLocaleDateString()}</div>
                    </div>
                  ))}
                  {!suggestion?.articles?.length && (
                    <div className="text-sm text-gray-500">No suggestions.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {!ticket && !loading && (
          <div className="px-4 sm:px-0 text-gray-500">Ticket not found.</div>
        )}
      </div>
    </div>
  )}

export default TicketDetail
