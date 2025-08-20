import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const buildAuthHeaders = (getState) => {
  const token = getState().auth.token
  return token
    ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' }
}

export const fetchKbList = createAsyncThunk(
  'kb/fetchList',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString()
      const res = await fetch(`/api/kb${query ? `?${query}` : ''}`)
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data
    } catch (e) {
      return rejectWithValue({ message: 'Network error', error: 'NETWORK_ERROR' })
    }
  }
)

export const fetchKbArticle = createAsyncThunk(
  'kb/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/kb/${id}`)
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data.article
    } catch (e) {
      return rejectWithValue({ message: 'Network error', error: 'NETWORK_ERROR' })
    }
  }
)

export const createKbArticle = createAsyncThunk(
  'kb/create',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const res = await fetch('/api/kb', {
        method: 'POST',
        headers: buildAuthHeaders(getState),
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data.article
    } catch (e) {
      return rejectWithValue({ message: 'Network error', error: 'NETWORK_ERROR' })
    }
  }
)

export const updateKbArticle = createAsyncThunk(
  'kb/update',
  async ({ id, ...payload }, { getState, rejectWithValue }) => {
    try {
      const res = await fetch(`/api/kb/${id}`, {
        method: 'PUT',
        headers: buildAuthHeaders(getState),
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data.article
    } catch (e) {
      return rejectWithValue({ message: 'Network error', error: 'NETWORK_ERROR' })
    }
  }
)

export const deleteKbArticle = createAsyncThunk(
  'kb/delete',
  async (id, { getState, rejectWithValue }) => {
    try {
      const res = await fetch(`/api/kb/${id}`, {
        method: 'DELETE',
        headers: buildAuthHeaders(getState),
      })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return { id }
    } catch (e) {
      return rejectWithValue({ message: 'Network error', error: 'NETWORK_ERROR' })
    }
  }
)

export const toggleKbStatus = createAsyncThunk(
  'kb/toggleStatus',
  async ({ id, toStatus }, { getState, rejectWithValue }) => {
    try {
      const res = await fetch(`/api/kb/${id}`, {
        method: 'PUT',
        headers: buildAuthHeaders(getState),
        body: JSON.stringify({ status: toStatus }),
      })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data.article
    } catch (e) {
      return rejectWithValue({ message: 'Network error', error: 'NETWORK_ERROR' })
    }
  }
)

const kbSlice = createSlice({
  name: 'kb',
  initialState: {
    items: [],
    total: 0,
    page: 1,
    limit: 20,
    pages: 1,
    current: null,
    loading: false,
    error: null,
    // Track optimistic changes to revert on failure
    snapshot: null,
  },
  reducers: {
    clearKbCurrent: (state) => { state.current = null },
    // Optimistic toggles
    locallyToggleStatus: (state, action) => {
      const { id, toStatus } = action.payload
      const idx = state.items.findIndex(a => a._id === id)
      if (idx !== -1) {
        state.snapshot = state.snapshot || JSON.parse(JSON.stringify(state.items))
        state.items[idx].status = toStatus
      }
      if (state.current && state.current._id === id) {
        state.snapshot = state.snapshot || JSON.parse(JSON.stringify(state.items))
        state.current.status = toStatus
      }
    },
    revertOptimistic: (state) => {
      if (state.snapshot) {
        state.items = state.snapshot
        state.snapshot = null
      }
    },
    // Optimistic delete
    locallyDelete: (state, action) => {
      const { id } = action.payload
      state.snapshot = state.snapshot || JSON.parse(JSON.stringify(state.items))
      state.items = state.items.filter(a => a._id !== id)
      if (state.current && state.current._id === id) state.current = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKbList.pending, (state) => {
        state.loading = true; state.error = null
      })
      .addCase(fetchKbList.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.page = action.payload.page
        state.limit = action.payload.limit
        state.total = action.payload.total
        state.pages = action.payload.pages
      })
      .addCase(fetchKbList.rejected, (state, action) => {
        state.loading = false; state.error = action.payload || action.error
      })

      .addCase(fetchKbArticle.pending, (state) => {
        state.loading = true; state.error = null
      })
      .addCase(fetchKbArticle.fulfilled, (state, action) => {
        state.loading = false; state.current = action.payload
      })
      .addCase(fetchKbArticle.rejected, (state, action) => {
        state.loading = false; state.error = action.payload || action.error
      })

      .addCase(createKbArticle.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items]
      })

      .addCase(updateKbArticle.fulfilled, (state, action) => {
        const updated = action.payload
        const idx = state.items.findIndex(a => a._id === updated._id)
        if (idx !== -1) state.items[idx] = updated
        if (state.current && state.current._id === updated._id) state.current = updated
      })

      .addCase(deleteKbArticle.fulfilled, (state, action) => {
        const { id } = action.payload
        state.items = state.items.filter(a => a._id !== id)
        if (state.current && state.current._id === id) state.current = null
        state.snapshot = null
      })
      .addCase(deleteKbArticle.rejected, (state, action) => {
        state.error = action.payload || action.error
        // revert
        if (state.snapshot) { state.items = state.snapshot; state.snapshot = null }
      })

      .addCase(toggleKbStatus.fulfilled, (state, action) => {
        const updated = action.payload
        const idx = state.items.findIndex(a => a._id === updated._id)
        if (idx !== -1) state.items[idx] = updated
        if (state.current && state.current._id === updated._id) state.current = updated
        state.snapshot = null
      })
      .addCase(toggleKbStatus.rejected, (state, action) => {
        state.error = action.payload || action.error
        if (state.snapshot) { state.items = state.snapshot; state.snapshot = null }
      })
  }
})

export const { clearKbCurrent, locallyToggleStatus, revertOptimistic, locallyDelete } = kbSlice.actions
export default kbSlice.reducer

// Selectors
export const selectKbState = (state) => state.kb
export const selectKbItems = (state) => state.kb.items
export const selectKbLoading = (state) => state.kb.loading
export const selectKbError = (state) => state.kb.error
export const selectKbCurrent = (state) => state.kb.current
