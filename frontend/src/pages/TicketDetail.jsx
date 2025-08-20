import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Navigation from '../components/Navigation'
import { useParams } from 'react-router-dom'
import { fetchTicket, selectTicketCurrent, selectTicketsLoading, selectTicketsError, clearTicketCurrent } from '../store/ticketSlice'
import { fetchSuggestion, fetchAuditLogs, selectAgentSuggestion, selectAgentLogs, agentSendReply, agentReopen, agentClose, selectAgentLoading } from '../store/agentSlice'
import { selectIsAdmin, selectIsAgent } from '../store/authSlice'

const card = 'bg-white shadow-sm rounded-lg p-6'
const label = 'text-sm font-medium text-gray-500'
const value = 'mt-1 text-gray-900'
const btn = 'inline-flex items-center justify-center px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition'
const btnPrimary = `${btn} text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`
const btnWarn = `${btn} text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:ring-yellow-500`
const btnDanger = `${btn} text-white bg-red-600 hover:bg-red-700 focus:ring-red-500`
const inputBase = 'w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400'

const Field = ({ label: l, children }) => (
  <div>
    <div className={label}>{l}</div>
    <div className={value}>{children}</div>
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
  const isSendingRef = useRef(false)

  const canAct = isAdmin || isAgent

  useEffect(() => {
    dispatch(fetchTicket(id))
    dispatch(fetchAuditLogs(id))
    return () => dispatch(clearTicketCurrent())
  }, [dispatch, id])

  useEffect(() => {
    if (canAct) dispatch(fetchSuggestion(id))
  }, [dispatch, id, canAct])

  useEffect(() => { if (suggestion?.reply) setReply(suggestion.reply) }, [suggestion])

  const handleSendReply = async () => {
    if (isSendingRef.current) return
    const trimmed = reply.trim()
    if (!trimmed) return
    isSendingRef.current = true
    try {
      await dispatch(agentSendReply({ id, reply: trimmed })).unwrap()
      dispatch(fetchAuditLogs(id))
    } catch {}
    finally {
      isSendingRef.current = false
    }
  }
  const handleReopen = async () => { await dispatch(agentReopen(id)).unwrap(); dispatch(fetchTicket(id)); dispatch(fetchAuditLogs(id)) }
  const handleClose = async () => { await dispatch(agentClose(id)).unwrap(); dispatch(fetchTicket(id)); dispatch(fetchAuditLogs(id)) }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ticket Details</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Review the ticket information and history.</p>
        </header>

        {error && (
          <div className="mb-4">
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">{error?.message || 'Error loading ticket'}</div>
          </div>
        )}

        {ticket && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2 space-y-6">
              <div className={card}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Title">{ticket.title}</Field>
                  <Field label="Status">{ticket.status.replace('_', ' ')}</Field>
                  <div className="md:col-span-2">
                    <div className={label}>Description</div>
                    <pre className="mt-1 whitespace-pre-wrap font-sans text-gray-900">{ticket.description}</pre>
                  </div>
                  <Field label="Category">{ticket.category}</Field>
                  <Field label="Assignee">{ticket.assignee ? `${ticket.assignee.name} (${ticket.assignee.email})` : 'Unassigned'}</Field>
                  <Field label="Created By">{ticket.createdBy?.name} ({ticket.createdBy?.email})</Field>
                  <Field label="Created At">{new Date(ticket.createdAt).toLocaleString()}</Field>
                  <Field label="Updated At">{new Date(ticket.updatedAt).toLocaleString()}</Field>
                </div>
              </div>

              {canAct && (
                <div className={card}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-900">AI Draft Reply</h2>
                    {suggestion?.classification && (
                      <div className="text-sm text-gray-600">Classification: <span className="font-medium">{suggestion.classification.category}</span> (conf {Math.round((suggestion.classification.confidence||0)*100)}%)</div>
                    )}
                  </div>
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={10}
                    className={`${inputBase} font-mono cursor-pointer`}
                    aria-label="AI Draft Reply"
                  />
                  <div className="mt-4 flex flex-wrap items-center gap-3 justify-end">
                    <button type="button" onClick={handleReopen} className={btnWarn + " cursor-pointer"}>Reopen</button>
                    <button type="button" onClick={handleSendReply} disabled={agentLoading || isSendingRef.current} className={btnPrimary + " cursor-pointer"}>{(agentLoading || isSendingRef.current) ? 'Sending…' : 'Send Reply'}</button>
                    <button type="button" onClick={handleClose} className={btnDanger + " cursor-pointer"}>Close</button>
                  </div>
                </div>
              )}

              <div className={card}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Audit Log</h2>
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log._id} className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-gray-400" />
                      <div>
                        <div className="text-sm text-gray-900 font-medium">{log.step}</div>
                        <div className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</div>
                        <div className="text-sm text-gray-700">{log.message}</div>
                      </div>
                    </div>
                  ))}
                  {logs.length === 0 && <div className="text-sm text-gray-500">No logs yet.</div>}
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className={card}>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Suggested KB Articles</h2>
                <div className="space-y-3">
                  {suggestion?.articles?.map((a) => (
                    <div key={a._id} className="text-sm">
                      <div className="font-medium text-gray-900">{a.title}</div>
                      <div className="text-gray-500">Last updated: {new Date(a.updatedAt).toLocaleDateString()}</div>
                    </div>
                  ))}
                  {!suggestion?.articles?.length && <div className="text-sm text-gray-500">No suggestions.</div>}
                </div>
              </div>
            </aside>
          </div>
        )}

        {!ticket && !loading && (
          <div className="text-gray-500">Ticket not found.</div>
        )}
      </main>
    </div>
  )
}

export default TicketDetail
