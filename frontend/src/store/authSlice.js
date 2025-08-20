import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data)
      }

      // Store token in localStorage for persistence
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      return data
    } catch (error) {
      return rejectWithValue({ 
        message: 'Network error occurred', 
        error: 'NETWORK_ERROR' 
      })
    }
  }
)

// Async thunk for registration
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data)
      }

      // Store token in localStorage for persistence
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      return data
    } catch (error) {
      return rejectWithValue({ 
        message: 'Network error occurred', 
        error: 'NETWORK_ERROR' 
      })
    }
  }
)

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      // Clear localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return {}
    } catch (error) {
      return rejectWithValue({ 
        message: 'Error during logout', 
        error: 'LOGOUT_ERROR' 
      })
    }
  }
)

// Async thunk for getting user profile
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState()
      const token = state.auth.token

      if (!token) {
        return rejectWithValue({ 
          message: 'No token available', 
          error: 'NO_TOKEN' 
        })
      }

      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data)
      }

      return data.user
    } catch (error) {
      return rejectWithValue({ 
        message: 'Network error occurred', 
        error: 'NETWORK_ERROR' 
      })
    }
  }
)

// Initialize state from localStorage
const getInitialState = () => {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  
  if (token && user) {
    try {
      const parsedUser = JSON.parse(user)
      return {
        user: parsedUser,
        token,
        isAuthenticated: true,
        loading: false,
        error: null,
      }
    } catch (error) {
      // If parsing fails, clear localStorage and return default state
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
  
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }
}

const initialState = getInitialState()

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload
      state.user = user
      state.token = token
      state.isAuthenticated = true
      state.error = null
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
    clearError: (state) => {
      state.error = null
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Registration
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.error = null
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Fetch Profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.error = null
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { 
  setCredentials, 
  logout, 
  setLoading, 
  setError, 
  clearError, 
  updateUser 
} = authSlice.actions

export default authSlice.reducer

// Selectors
export const selectCurrentUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectAuthToken = (state) => state.auth.token
export const selectAuthLoading = (state) => state.auth.loading
export const selectAuthError = (state) => state.auth.error

// Role-based selectors
export const selectUserRole = (state) => state.auth.user?.role || null
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin'
export const selectIsAgent = (state) => state.auth.user?.role === 'agent'
export const selectIsUser = (state) => state.auth.user?.role === 'user'
export const selectHasRole = (state, role) => state.auth.user?.role === role
export const selectHasAnyRole = (state, roles) => {
  const userRole = state.auth.user?.role
  return Array.isArray(roles) ? roles.includes(userRole) : roles === userRole
}
export const selectIsStaff = (state) => ['admin', 'agent'].includes(state.auth.user?.role)
