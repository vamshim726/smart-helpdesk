import { io } from 'socket.io-client'

let socket

export const connectSocket = (userId) => {
  if (socket) return socket
  socket = io('/', { withCredentials: true })
  socket.on('connect', () => {
    socket.emit('auth', userId)
  })
  return socket
}

export const getSocket = () => socket
