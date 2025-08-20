import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Navigation from '../components/Navigation'
import { useNavigate, useParams } from 'react-router-dom'
import { selectIsAdmin } from '../store/authSlice'
import {
  fetchKbArticle,
  createKbArticle,
  updateKbArticle,
  selectKbCurrent,
  selectKbLoading,
  selectKbError,
  clearKbCurrent,
} from '../store/kbSlice'

const inputBase = 'w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400'
const btn = 'inline-flex items-center justify-center px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition'
const btnPrimary = `${btn} text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`
const btnWarn = `${btn} text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:ring-yellow-500`
const card = 'bg-white shadow-sm rounded-lg p-6 border border-gray-100'

const AdminKBEditor = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams()
  const isAdmin = useSelector(selectIsAdmin)
  const current = useSelector(selectKbCurrent)
  const loading = useSelector(selectKbLoading)
  const error = useSelector(selectKbError)

  const isEdit = Boolean(id && id !== 'new')

  const [form, setForm] = useState({ title: '', body: '', tags: '', status: 'draft' })

  useEffect(() => { if (!isAdmin) navigate('/dashboard') }, [isAdmin, navigate])

  useEffect(() => { if (isEdit) dispatch(fetchKbArticle(id)); else dispatch(clearKbCurrent()); return () => dispatch(clearKbCurrent()) }, [dispatch, id, isEdit])

  useEffect(() => { if (current && isEdit) setForm({ title: current.title||'', body: current.body||'', tags: (current.tags||[]).join(', '), status: current.status||'draft' }) }, [current, isEdit])

  const handleChange = (e) => { const { name, value } = e.target; setForm((p) => ({ ...p, [name]: value })) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { title: form.title.trim(), body: form.body, tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean), status: form.status }
    try {
      if (isEdit) { await dispatch(updateKbArticle({ id, ...payload })).unwrap(); navigate('/admin/kb') }
      else { const created = await dispatch(createKbArticle(payload)).unwrap(); navigate(`/admin/kb/${created._id}`) }
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{isEdit ? 'Edit Article' : 'New Article'}</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">{isEdit ? 'Update the article details.' : 'Create a new KB article.'}</p>
        </header>

        {error && <div className="mb-4"><div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">{error?.message || 'An error occurred'}</div></div>}

        <form onSubmit={handleSubmit} className={`${card} space-y-6`}>
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input id="title" name="title" value={form.title} onChange={handleChange} required className={inputBase} placeholder="Article title" />
          </div>

          <div className="space-y-2">
            <label htmlFor="body" className="block text-sm font-medium text-gray-700">Body</label>
            <textarea id="body" name="body" value={form.body} onChange={handleChange} required rows={12} className={`${inputBase} font-mono`} placeholder="Write the content…" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags</label>
              <input id="tags" name="tags" value={form.tags} onChange={handleChange} className={inputBase} placeholder="Comma separated, e.g. howto, account, reset" />
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select id="status" name="status" value={form.status} onChange={handleChange} className={inputBase}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            {isEdit && (
              <button type="button" onClick={() => setForm((p) => ({ ...p, status: p.status === 'published' ? 'draft' : 'published' }))} className={btnWarn}>
                {form.status === 'published' ? 'Unpublish' : 'Publish'}
              </button>
            )}
            <button type="submit" disabled={loading} className={btnPrimary}>{isEdit ? 'Save Changes' : 'Create Article'}</button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default AdminKBEditor
