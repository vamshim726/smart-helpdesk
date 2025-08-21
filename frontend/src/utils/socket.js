import { io } from 'socket.io-client'

let socket = null
let currentUserId = null

export const connectSocket = (userId) => {
  // If we already have a socket for this user, return it
  if (socket && currentUserId === userId) {
    return socket
  }

  // If we have a socket for a different user, disconnect it first
  if (socket && currentUserId !== userId) {
    socket.disconnect()
    socket = null
    currentUserId = null
  }

  // Create new connection
  const url = `${window.location.protocol}//${window.location.hostname}:8080`

  socket = io(url, { 
    withCredentials: true,
    transports: ['websocket', 'polling'],
    timeout: 20000,
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  })

  currentUserId = userId

  socket.on('connect', () => {
    socket.emit('auth', userId)
  })

  socket.on('connect_error', (error) => {
    console.error('Socket.IO connection error:', error)
  })

  socket.on('disconnect', () => {
    // Intentionally empty to avoid logging disconnect reason
  })

  socket.on('error', (error) => {
    console.error('Socket.IO error:', error)
  })

  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
    currentUserId = null
  }
}
