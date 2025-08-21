import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Navigation from '../components/Navigation'
import { createTicket, selectTicketsLoading } from '../store/ticketSlice'
import { useNavigate } from 'react-router-dom'

const inputBase = 'w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400'
const btnPrimary = 'inline-flex items-center justify-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed'
const card = 'bg-white shadow-sm rounded-lg p-6'

const TicketCreate = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const loading = useSelector(selectTicketsLoading)
  const error = null

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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create Ticket</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Describe your issue and submit a ticket. Fields marked with <span className="text-red-600">*</span> are required.</p>
        </header>

        {/* feedback via toasts */}

        <form onSubmit={handleSubmit} className={`${card} space-y-6`}>
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title <span className="text-red-600">*</span></label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className={inputBase}
              placeholder="Brief summary (e.g., App won't open)"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description <span className="text-red-600">*</span></label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={10}
              className={`${inputBase} resize-y`}
              placeholder="Describe the issue with as much detail as possible"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className={inputBase + " cursor-pointer"}
              >
                <option value="billing">Billing</option>
                <option value="tech">Technical</option>
                <option value="shipping">Shipping</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/tickets')}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition cursor-pointer"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className={btnPrimary + " cursor-pointer"}>
              {loading ? 'Submitting…' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default TicketCreate
