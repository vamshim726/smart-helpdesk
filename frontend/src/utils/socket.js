import { io } from 'socket.io-client'

let socket

export const connectSocket = (userId) => {
  if (socket) return socket
  const url = `${window.location.protocol}//${window.location.hostname}:8080`
  socket = io(url, { withCredentials: true })
  socket.on('connect', () => {
    socket.emit('auth', userId)
  })
  return socket
}

export const getSocket = () => socket
