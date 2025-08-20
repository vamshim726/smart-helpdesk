import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

const authHeaders = (getState) => {
  const token = getState().auth.token
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

// Module-level in-flight guard to prevent duplicate requests for the same ticket
const inFlightReplies = new Set()

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
  async ({ id, reply, status, traceId: providedTraceId }, { getState, rejectWithValue }) => {
    try {
      const traceId = providedTraceId || uuidv4()
      const res = await fetch(`/api/agent/tickets/${id}/reply`, {
        method: 'POST',
        headers: authHeaders(getState),
        body: JSON.stringify({ reply, status, traceId }),
      })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return { ticketId: id, ...data }
    } catch (e) {
      return rejectWithValue({ message: 'Network error', error: 'NETWORK_ERROR' })
    }
  },
  {
    condition: ({ id }, { getState }) => {
      if (!id) return false
      if (inFlightReplies.has(id)) return false
      // Optimistically lock before reducer handles pending
      inFlightReplies.add(id)
      const state = getState()
      const pending = state.agent?.pendingReplies?.[id]
      return !pending
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
    pendingReplies: {}, // keyed by ticketId
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

      .addCase(agentSendReply.pending, (state, action) => {
        state.loading = true
        state.error = null
        const ticketId = action.meta.arg?.id
        if (ticketId) state.pendingReplies[ticketId] = true
      })
      .addCase(agentSendReply.fulfilled, (state, action) => {
        state.loading = false
        const ticketId = action.meta.arg?.id || action.payload?.ticketId
        if (ticketId) delete state.pendingReplies[ticketId]
        if (ticketId) inFlightReplies.delete(ticketId)
      })
      .addCase(agentSendReply.rejected, (state, action) => {
        state.loading = false
        const ticketId = action.meta.arg?.id
        if (ticketId) delete state.pendingReplies[ticketId]
        if (ticketId) inFlightReplies.delete(ticketId)
        state.error = action.payload || action.error
      })

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
