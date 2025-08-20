import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import kbReducer from './kbSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    kb: kbReducer,
  },
})
