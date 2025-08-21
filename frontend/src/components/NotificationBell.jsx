import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchNotifications, markRead, selectNotifications, selectUnreadCount, pushNotification } from '../store/notificationSlice'
import { selectCurrentUser } from '../store/authSlice'
import { connectSocket } from '../utils/socket'
import { Link } from 'react-router-dom'

const NotificationBell = () => {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const items = useSelector(selectNotifications)
  const unread = useSelector(selectUnreadCount)
  const [open, setOpen] = useState(false)
  const socketRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!user) return
    
    dispatch(fetchNotifications())
    
    const userId = user.id || user._id;
    console.log('Connecting socket with user ID:', userId);
    
    // Only create one socket connection
    if (!socketRef.current) {
      socketRef.current = connectSocket(userId)
    }
    
    const socket = socketRef.current
    
    // Remove any existing listeners to prevent duplicates
    socket.off('notification')
    
    // Add the notification listener
    socket.on('notification', (payload) => {
      console.log('Received notification via Socket.IO:', payload);
      console.log('Notification _id:', payload._id);
      dispatch(pushNotification(payload))
    })
    
    // Cleanup function
    return () => {
      if (socket) {
        socket.off('notification')
      }
    }
  }, [dispatch, user])

  // Close when clicking outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (!open) return
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [open])

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (open && e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.off('notification')
        socketRef.current = null
      }
    }
  }, [])

  const onMarkRead = async (id) => {
    if (!id) {
      console.error('Cannot mark notification as read: ID is undefined')
      return
    }
    try {
      await dispatch(markRead(id))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative inline-flex items-center justify-center p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a7 7 0 00-7 7v3.586l-.707.707A1 1 0 005 15h14a1 1 0 00.707-1.707L19 12.586V9a7 7 0 00-7-7zm0 20a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-3 border-b text-sm font-medium">Notifications</div>
          <div className="max-h-80 overflow-y-auto divide-y">
            {items.map((n) => {
              console.log('Notification data:', n); // Debug log
              return (
                <div key={n._id} className={`p-3 text-sm ${n.isRead ? 'bg-white' : 'bg-blue-50'}`}>
                  <div className="font-medium text-gray-900">{n.title}</div>
                  <div className="text-gray-600">{n.message}</div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                  <div className="mt-2 flex items-center justify-between">
                    {n._id ? (
                      <button 
                        onClick={() => {
                          console.log('Marking notification as read, ID:', n._id); // Debug log
                          onMarkRead(n._id);
                        }} 
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Mark read
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">Invalid ID</span>
                    )}
                    {n.ticket && (
                      <Link to={`/tickets/${n.ticket}`} className="text-xs text-blue-600 hover:underline">Open ticket</Link>
                    )}
                  </div>
                </div>
              );
            })}
            {items.length === 0 && (
              <div className="p-3 text-gray-500">No notifications</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
