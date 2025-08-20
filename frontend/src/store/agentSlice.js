import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const authHeaders = (getState) => {
  const token = getState().auth.token
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

export const fetchSuggestion = createAsyncThunk(
  'agent/suggestion',
  async (ticketId, { getState, rejectWithValue }) => {
    try {
      const res = await fetch(`/api/agent/suggestion/${ticketId}`, { headers: authHeaders(getState) })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return { ticketId, ...data }
    } catch (e) {
      return rejectWithValue({ message: 'Network error', error: 'NETWORK_ERROR' })
    }
  }
)

export const fetchAuditLogs = createAsyncThunk(
  'agent/logs',
  async (ticketId, { getState, rejectWithValue }) => {
    try {
      const res = await fetch(`/api/agent/logs/${ticketId}`, { headers: authHeaders(getState) })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return { ticketId, logs: data.logs }
    } catch (e) {
      return rejectWithValue({ message: 'Network error', error: 'NETWORK_ERROR' })
    }
  }
)

export const agentSendReply = createAsyncThunk(
  'agent/reply',
  async ({ id, reply, status }, { getState, rejectWithValue }) => {
    try {
      const res = await fetch(`/api/agent/tickets/${id}/reply`, {
        method: 'POST',
        headers: authHeaders(getState),
        body: JSON.stringify({ reply, status }),
      })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data
    } catch (e) {
      return rejectWithValue({ message: 'Network error', error: 'NETWORK_ERROR' })
    }
  }
)

export const agentAssign = createAsyncThunk(
  'agent/assign',
  async ({ id, assigneeId }, { getState, rejectWithValue }) => {
    try {
      const res = await fetch(`/api/agent/tickets/${id}/assign`, {
        method: 'POST',
        headers: authHeaders(getState),
        body: JSON.stringify({ assigneeId }),
      })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data
    } catch (e) {
      return rejectWithValue({ message: 'Network error', error: 'NETWORK_ERROR' })
    }
  }
)

export const agentReopen = createAsyncThunk(
  'agent/reopen',
  async (id, { getState, rejectWithValue }) => {
    try {
      const res = await fetch(`/api/agent/tickets/${id}/reopen`, {
        method: 'POST', headers: authHeaders(getState)
      })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data
    } catch (e) {
      return rejectWithValue({ message: 'Network error', error: 'NETWORK_ERROR' })
    }
  }
)

export const agentClose = createAsyncThunk(
  'agent/close',
  async (id, { getState, rejectWithValue }) => {
    try {
      const res = await fetch(`/api/agent/tickets/${id}/close`, {
        method: 'POST', headers: authHeaders(getState)
      })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data
    } catch (e) {
      return rejectWithValue({ message: 'Network error', error: 'NETWORK_ERROR' })
    }
  }
)

const agentSlice = createSlice({
  name: 'agent',
  initialState: {
    suggestion: {}, // keyed by ticketId
    logs: {}, // keyed by ticketId
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuggestion.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchSuggestion.fulfilled, (state, action) => {
        state.loading = false
        const { ticketId, classification, articles, reply, traceId } = action.payload
        state.suggestion[ticketId] = { classification, articles, reply, traceId }
      })
      .addCase(fetchSuggestion.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error })

      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        const { ticketId, logs } = action.payload
        state.logs[ticketId] = logs
      })

      .addCase(agentSendReply.pending, (state) => { state.loading = true; state.error = null })
      .addCase(agentSendReply.fulfilled, (state) => { state.loading = false })
      .addCase(agentSendReply.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error })

      .addCase(agentAssign.fulfilled, (state) => {})
      .addCase(agentReopen.fulfilled, (state) => {})
      .addCase(agentClose.fulfilled, (state) => {})
  }
})

export default agentSlice.reducer

export const selectAgentLoading = (state) => state.agent.loading
export const selectAgentError = (state) => state.agent.error
export const selectAgentSuggestion = (ticketId) => (state) => state.agent.suggestion[ticketId]
export const selectAgentLogs = (ticketId) => (state) => state.agent.logs[ticketId] || []
