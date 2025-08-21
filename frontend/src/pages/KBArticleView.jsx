import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, Link } from 'react-router-dom'
import Navigation from '../components/Navigation'
import { fetchKbArticle, selectKbCurrent, selectKbLoading, selectKbError, clearKbCurrent } from '../store/kbSlice'

const KBArticleView = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const article = useSelector(selectKbCurrent)
  const loading = useSelector(selectKbLoading)
  const error = useSelector(selectKbError)

  useEffect(() => {
    dispatch(fetchKbArticle(id))
    return () => dispatch(clearKbCurrent())
  }, [dispatch, id])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link to="/tickets" className="text-blue-600 hover:underline">Back to Tickets</Link>
        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">{error?.message || 'Error loading article'}</div>
        )}
        {loading && <div className="mt-4 text-gray-500">Loading…</div>}
        {article && (
          <article className="mt-6 bg-white shadow-sm rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900">{article.title}</h1>
            <div className="text-xs text-gray-500 mt-1">Last updated: {new Date(article.updatedAt).toLocaleString()}</div>
            <div className="prose max-w-none mt-4 whitespace-pre-wrap">{article.body}</div>
          </article>
        )}
      </main>
    </div>
  )
}

export default KBArticleView


