import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const authHeaders = (getState) => {
  const token = getState().auth.token
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

export const loadConfig = createAsyncThunk(
  'config/load',
  async (_, { getState, rejectWithValue }) => {
    try {
      const res = await fetch('/api/config', { headers: authHeaders(getState) })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data.config
    } catch (e) {
      return rejectWithValue({ message: 'Network error', error: 'NETWORK_ERROR' })
    }
  }
)

export const saveConfig = createAsyncThunk(
  'config/save',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: authHeaders(getState),
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data.config
    } catch (e) {
      return rejectWithValue({ message: 'Network error', error: 'NETWORK_ERROR' })
    }
  }
)

const configSlice = createSlice({
  name: 'config',
  initialState: {
    data: null,
    loading: false,
    error: null,
    success: null,
  },
  reducers: { clearConfigStatus: (state) => { state.success = null; state.error = null } },
  extraReducers: (builder) => {
    builder
      .addCase(loadConfig.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loadConfig.fulfilled, (state, action) => { state.loading = false; state.data = action.payload })
      .addCase(loadConfig.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error })

      .addCase(saveConfig.pending, (state) => { state.loading = true; state.error = null; state.success = null })
      .addCase(saveConfig.fulfilled, (state, action) => { state.loading = false; state.data = action.payload; state.success = 'Configuration saved.' })
      .addCase(saveConfig.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error })
  }
})

export const { clearConfigStatus } = configSlice.actions
export default configSlice.reducer

export const selectConfigData = (state) => state.config.data
export const selectConfigLoading = (state) => state.config.loading
export const selectConfigError = (state) => state.config.error
export const selectConfigSuccess = (state) => state.config.success
