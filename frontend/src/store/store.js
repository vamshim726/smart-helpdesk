import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import kbReducer from './kbSlice'
import ticketsReducer from './ticketSlice'
import agentReducer from './agentSlice'
import configReducer from './configSlice'
import notificationsReducer from './notificationSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    kb: kbReducer,
    tickets: ticketsReducer,
    agent: agentReducer,
    config: configReducer,
    notifications: notificationsReducer,
  },
})
