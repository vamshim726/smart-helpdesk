import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const authHeaders = (getState) => {
  const token = getState().auth.token
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

export const createTicket = createAsyncThunk(
  'tickets/create',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: authHeaders(getState),
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data.ticket
    } catch (e) {
      return rejectWithValue({ message: 'Network error', error: 'NETWORK_ERROR' })
    }
  }
)

export const fetchTickets = createAsyncThunk(
  'tickets/list',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString()
      const res = await fetch(`/api/tickets${query ? `?${query}` : ''}`, {
        headers: authHeaders(getState),
      })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data
    } catch (e) {
      return rejectWithValue({ message: 'Network error', error: 'NETWORK_ERROR' })
    }
  }
)

export const fetchTicket = createAsyncThunk(
  'tickets/detail',
  async (id, { getState, rejectWithValue }) => {
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        headers: authHeaders(getState),
      })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data.ticket
    } catch (e) {
      return rejectWithValue({ message: 'Network error', error: 'NETWORK_ERROR' })
    }
  }
)

const ticketSlice = createSlice({
  name: 'tickets',
  initialState: {
    items: [],
    total: 0,
    page: 1,
    limit: 20,
    pages: 1,
    current: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearTicketCurrent: (state) => { state.current = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTicket.pending, (state) => { state.loading = true; state.error = null })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.loading = false
        state.items = [action.payload, ...state.items]
      })
      .addCase(createTicket.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error })

      .addCase(fetchTickets.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.page = action.payload.page
        state.limit = action.payload.limit
        state.total = action.payload.total
        state.pages = action.payload.pages
      })
      .addCase(fetchTickets.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error })

      .addCase(fetchTicket.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchTicket.fulfilled, (state, action) => { state.loading = false; state.current = action.payload })
      .addCase(fetchTicket.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error })
  }
})

export const { clearTicketCurrent } = ticketSlice.actions
export default ticketSlice.reducer

export const selectTickets = (state) => state.tickets.items
export const selectTicketsLoading = (state) => state.tickets.loading
export const selectTicketsError = (state) => state.tickets.error
export const selectTicketCurrent = (state) => state.tickets.current
