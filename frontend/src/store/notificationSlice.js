import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { API_BASE } from '../utils/api'

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token
      const res = await fetch(`${API_BASE}/notifications`, { headers: token ? { 'Authorization': `Bearer ${token}` } : {} })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data.notifications
    } catch (e) {
      return rejectWithValue({ message: 'Network error', error: 'NETWORK_ERROR' })
    }
  }
)

export const markRead = createAsyncThunk(
  'notifications/read',
  async (id, { getState, rejectWithValue }) => {
    try {
      // Validate ID before making request
      if (!id || id === 'undefined' || id === 'null') {
        return rejectWithValue({ 
          message: 'Invalid notification ID', 
          error: 'INVALID_ID',
          receivedId: id 
        })
      }
      
      const token = getState().auth.token
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, { 
        method: 'POST', 
        headers: token ? { 'Authorization': `Bearer ${token}` } : {} 
      })
      const data = await res.json()
      if (!res.ok) return rejectWithValue(data)
      return data.notification
    } catch (e) {
      return rejectWithValue({ message: 'Network error', error: 'NETWORK_ERROR' })
    }
  }
)

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    pushNotification: (state, action) => {
      // Ensure the notification has the correct structure
      const notification = action.payload;
      if (!notification._id) {
        console.error('Received notification without _id:', notification);
        return;
      }
      
      // Check if notification already exists to prevent duplicates
      const existingIndex = state.items.findIndex(item => item._id === notification._id);
      if (existingIndex !== -1) {
        console.log('Notification already exists, updating instead of adding:', notification._id);
        // Update existing notification if needed
        state.items[existingIndex] = { ...state.items[existingIndex], ...notification };
        return;
      }
      
      // Add new notification
      state.items = [notification, ...state.items].slice(0, 50)
      state.unreadCount += 1
    },
    setSocketConnected: (state, action) => { state.socketConnected = action.payload },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        state.unreadCount = action.payload.filter(n => !n.isRead).length
      })
      .addCase(fetchNotifications.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error })

      .addCase(markRead.fulfilled, (state, action) => {
        const upd = action.payload
        const idx = state.items.findIndex(n => n._id === upd._id)
        if (idx !== -1) state.items[idx] = upd
        state.unreadCount = state.items.filter(n => !n.isRead).length
      })
      .addCase(markRead.rejected, (state, action) => {
        console.error('Failed to mark notification as read:', action.payload)
        state.error = action.payload
      })
  }
})

export const { pushNotification, setSocketConnected } = notificationSlice.actions
export default notificationSlice.reducer

export const selectNotifications = (state) => state.notifications.items
export const selectUnreadCount = (state) => state.notifications.unreadCount
export const selectNotificationsLoading = (state) => state.notifications.loading
