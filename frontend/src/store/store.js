import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import kbReducer from './kbSlice'
import ticketsReducer from './ticketSlice'
import agentReducer from './agentSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    kb: kbReducer,
    tickets: ticketsReducer,
    agent: agentReducer,
  },
})
