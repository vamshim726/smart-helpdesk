import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Navigation from '../components/Navigation'
import { createTicket, selectTicketsLoading, selectTicketsError } from '../store/ticketSlice'
import { useNavigate } from 'react-router-dom'

const TicketCreate = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const loading = useSelector(selectTicketsLoading)
  const error = useSelector(selectTicketsError)

  const [form, setForm] = useState({ title: '', description: '', category: 'other' })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const created = await dispatch(createTicket(form)).unwrap()
      navigate(`/tickets/${created._id}`)
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Create Ticket</h1>
          <p className="mt-2 text-gray-600">Describe your issue and submit a ticket.</p>
        </div>

        {error && (
          <div className="px-4 sm:px-0 mb-4">
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error?.message || 'An error occurred'}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-4 sm:px-0 bg-white shadow rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Brief summary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={10}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Describe the issue with as much detail as possible"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="billing">Billing</option>
              <option value="tech">Technical</option>
              <option value="shipping">Shipping</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TicketCreate
