import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Navigation from '../components/Navigation'
import { selectIsAdmin } from '../store/authSlice'
import {
  fetchKbList,
  toggleKbStatus,
  deleteKbArticle,
  locallyToggleStatus,
  locallyDelete,
  revertOptimistic,
  selectKbItems,
  selectKbLoading,
  selectKbError
} from '../store/kbSlice'
import { Link, useNavigate } from 'react-router-dom'

const filterInput = 'border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900'
const btnPrimary = 'inline-flex items-center justify-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition'
const btnSmall = 'px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 transition'

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
  }`}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
)

const AdminKBList = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isAdmin = useSelector(selectIsAdmin)
  const items = useSelector(selectKbItems)
  const loading = useSelector(selectKbLoading)
  const error = useSelector(selectKbError)

  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => { if (!isAdmin) navigate('/dashboard') }, [isAdmin, navigate])

  useEffect(() => { dispatch(fetchKbList({ q, status })) }, [dispatch])

  const handleSearch = (e) => { e.preventDefault(); dispatch(fetchKbList({ q, status })) }

  const handleToggle = async (id, current) => {
    const toStatus = current === 'published' ? 'draft' : 'published'
    dispatch(locallyToggleStatus({ id, toStatus }))
    try { await dispatch(toggleKbStatus({ id, toStatus })).unwrap() } catch { dispatch(revertOptimistic()) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this article?')) return
    dispatch(locallyDelete({ id }))
    try { await dispatch(deleteKbArticle(id)).unwrap() } catch { dispatch(revertOptimistic()) }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Knowledge Base</h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600">Manage your published and draft articles.</p>
          </div>
          <Link to="/admin/kb/new" className={btnPrimary}>New Article</Link>
        </header>

        {error && (
          <div className="mb-4">
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">{error?.message || 'Error loading KB'}</div>
          </div>
        )}

        <section className="mb-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <input className={filterInput} placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className={filterInput} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <div className="lg:col-span-2 flex lg:justify-end">
              <button type="submit" className={btnPrimary}>Apply</button>
            </div>
          </form>
        </section>

        <section className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((a) => (
                  <tr key={a._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{a.title}</div>
                      {a.tags?.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {a.tags.map((t) => (
                            <span key={t} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">{t}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={a.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(a.updatedAt || a.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button onClick={() => handleToggle(a._id, a.status)} className={`${btnSmall} ${a.status === 'published' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:ring-yellow-500' : 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500'}`}>
                        {a.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <Link to={`/admin/kb/${a._id}`} className={`${btnSmall} bg-blue-100 text-blue-800 hover:bg-blue-200 focus:ring-blue-400`}>Edit</Link>
                      <button onClick={() => handleDelete(a._id)} className={`${btnSmall} bg-red-100 text-red-800 hover:bg-red-200 focus:ring-red-500`}>Delete</button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && !loading && (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500">No articles found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

export default AdminKBList
