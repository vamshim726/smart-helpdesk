import { io } from 'socket.io-client'

let socket = null
let currentUserId = null

export const connectSocket = (userId) => {
  // If we already have a socket for this user, return it
  if (socket && currentUserId === userId) {
    console.log('Reusing existing Socket.IO connection for user:', userId)
    return socket
  }
  
  // If we have a socket for a different user, disconnect it first
  if (socket && currentUserId !== userId) {
    console.log('Disconnecting existing socket for user:', currentUserId)
    socket.disconnect()
    socket = null
    currentUserId = null
  }
  
  // Create new connection
  const url = `${window.location.protocol}//${window.location.hostname}:8080`
  console.log('Creating new Socket.IO connection at:', url)
  console.log('User ID:', userId)
  
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
    console.log('Socket.IO connected successfully, socket ID:', socket.id)
    socket.emit('auth', userId)
  })
  
  socket.on('connect_error', (error) => {
    console.error('Socket.IO connection error:', error)
    console.error('Error details:', {
      message: error.message,
      description: error.description,
      context: error.context
    })
  })
  
  socket.on('disconnect', (reason) => {
    console.log('Socket.IO disconnected:', reason)
  })
  
  socket.on('error', (error) => {
    console.error('Socket.IO error:', error)
  })
  
  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) {
    console.log('Disconnecting Socket.IO connection')
    socket.disconnect()
    socket = null
    currentUserId = null
  }
}
