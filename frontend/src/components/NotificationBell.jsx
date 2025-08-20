import React, { useEffect, useState } from 'react'
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

  useEffect(() => {
    if (!user) return
    dispatch(fetchNotifications())
    const socket = connectSocket(user.id || user._id)
    socket.on('notification', (payload) => {
      dispatch(pushNotification(payload))
    })
  }, [dispatch, user])

  const onMarkRead = async (id) => {
    await dispatch(markRead(id))
  }

  return (
    <div className="relative">
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
            {items.map((n) => (
              <div key={n._id} className={`p-3 text-sm ${n.isRead ? 'bg-white' : 'bg-blue-50'}`}>
                <div className="font-medium text-gray-900">{n.title}</div>
                <div className="text-gray-600">{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                <div className="mt-2 flex items-center justify-between">
                  <button onClick={() => onMarkRead(n._id)} className="text-xs text-blue-600 hover:underline">Mark read</button>
                  {n.ticket && (
                    <Link to={`/tickets/${n.ticket}`} className="text-xs text-blue-600 hover:underline">Open ticket</Link>
                  )}
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="p-3 text-sm text-gray-500">No notifications</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
