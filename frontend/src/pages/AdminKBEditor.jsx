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

const AdminKBEditor = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams()
  const isAdmin = useSelector(selectIsAdmin)
  const current = useSelector(selectKbCurrent)
  const loading = useSelector(selectKbLoading)
  const error = useSelector(selectKbError)

  const isEdit = Boolean(id && id !== 'new')

  const [form, setForm] = useState({
    title: '',
    body: '',
    tags: '',
    status: 'draft',
  })

  useEffect(() => {
    if (!isAdmin) navigate('/dashboard')
  }, [isAdmin, navigate])

  useEffect(() => {
    if (isEdit) dispatch(fetchKbArticle(id))
    else dispatch(clearKbCurrent())
    return () => dispatch(clearKbCurrent())
  }, [dispatch, id, isEdit])

  useEffect(() => {
    if (current && isEdit) {
      setForm({
        title: current.title || '',
        body: current.body || '',
        tags: (current.tags || []).join(', '),
        status: current.status || 'draft',
      })
    }
  }, [current, isEdit])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      title: form.title.trim(),
      body: form.body,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      status: form.status,
    }

    try {
      if (isEdit) {
        await dispatch(updateKbArticle({ id, ...payload })).unwrap()
      } else {
        const created = await dispatch(createKbArticle(payload)).unwrap()
        navigate(`/admin/kb/${created._id}`)
        return
      }
      navigate('/admin/kb')
    } catch (e) {
      // handled via slice error
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">{isEdit ? 'Edit Article' : 'New Article'}</h1>
          <p className="mt-2 text-gray-600">{isEdit ? 'Update the article details.' : 'Create a new KB article.'}</p>
        </div>

        {error && (
          <div className="px-4 sm:px-0 mb-4">
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error?.message || 'An error occurred'}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-4 sm:px-0 bg-white shadow rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Enter article title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Body</label>
            <textarea
              name="body"
              value={form.body}
              onChange={handleChange}
              required
              rows={12}
              className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono"
              placeholder="Write the content..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Comma separated, e.g. howto, account, reset"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {isEdit && current?.updatedAt && (
                <>Last updated: {new Date(current.updatedAt).toLocaleString()}</>
              )}
            </div>

            <div className="space-x-3">
              {isEdit && (
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, status: p.status === 'published' ? 'draft' : 'published' }))}
                  className={`px-4 py-2 rounded ${form.status === 'published' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                >
                  {form.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isEdit ? 'Save Changes' : 'Create Article'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminKBEditor
