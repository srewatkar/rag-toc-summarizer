import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { deleteAccount } from '../lib/api'

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)

  const [name, setName] = useState('')
  const [nameLoading, setNameLoading] = useState(false)
  const [nameMsg, setNameMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  const modalRef = useRef<HTMLDivElement>(null)
  const deleteButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setName(user?.user_metadata?.full_name || '')
    })
  }, [])

  // Focus first focusable element when modal opens; restore focus on close
  useEffect(() => {
    if (showDeleteModal) {
      const el = modalRef.current?.querySelector<HTMLElement>('button, input, a[href]')
      el?.focus()
    } else {
      deleteButtonRef.current?.focus()
    }
  }, [showDeleteModal])

  // Close modal on Escape
  useEffect(() => {
    if (!showDeleteModal) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setShowDeleteModal(false); setDeleteInput('') }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [showDeleteModal])

  function trapFocus(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'Tab') return
    const focusable = Array.from(
      modalRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input, a[href], [tabindex]:not([tabindex="-1"])'
      ) ?? []
    )
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus()
    }
  }

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault()
    setNameLoading(true)
    setNameMsg(null)
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } })
    setNameMsg(error ? { ok: false, text: error.message } : { ok: true, text: 'Name updated!' })
    setNameLoading(false)
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordMsg(null)
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ ok: false, text: 'Passwords do not match.' }); return
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ ok: false, text: 'Password must be at least 6 characters.' }); return
    }
    setPasswordLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPasswordMsg({ ok: false, text: error.message })
    } else {
      setPasswordMsg({ ok: true, text: 'Password updated successfully.' })
      setNewPassword('')
      setConfirmPassword('')
    }
    setPasswordLoading(false)
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')
      await deleteAccount(`Bearer ${session.access_token}`)
      await supabase.auth.signOut()
      navigate('/')
    } catch {
      setDeleteLoading(false)
      setShowDeleteModal(false)
    }
  }

  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || '?'

  return (
    <div className="min-h-screen bg-gray-50">
      <main id="main-content" className="max-w-2xl mx-auto py-8 px-4 sm:py-12">
        <Link to="/dashboard" className="text-indigo-600 text-sm hover:underline mb-8 block">
          ← Back to dashboard
        </Link>

        {/* Avatar + heading */}
        <div className="flex items-center gap-4 mb-10">
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl select-none flex-shrink-0"
            aria-hidden="true"
          >
            {initials}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{name || 'Your Profile'}</h1>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>
        </div>

        {/* ── Profile info ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Profile Information</h2>
          <div className="mb-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</p>
            <p className="text-gray-700 text-sm font-medium py-1">{user?.email}</p>
          </div>
          <form onSubmit={handleUpdateName}>
            <div className="mb-3">
              <label htmlFor="display-name" className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                Display name
              </label>
              <input
                id="display-name"
                value={name}
                onChange={e => { setName(e.target.value); setNameMsg(null) }}
                placeholder="Your name"
                autoComplete="name"
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {nameMsg && (
              <p role={nameMsg.ok ? 'status' : 'alert'} className={`text-sm mb-3 ${nameMsg.ok ? 'text-green-600' : 'text-red-600'}`}>
                {nameMsg.text}
              </p>
            )}
            <button
              type="submit"
              disabled={nameLoading}
              aria-busy={nameLoading}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 min-h-[44px]"
            >
              {nameLoading ? 'Saving…' : 'Save name'}
            </button>
          </form>
        </div>

        {/* ── Change password ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Change Password</h2>
          {passwordMsg && (
            <p role={passwordMsg.ok ? 'status' : 'alert'} className={`text-sm mb-4 ${passwordMsg.ok ? 'text-green-600' : 'text-red-600'}`}>
              {passwordMsg.text}
            </p>
          )}
          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <div>
              <label htmlFor="new-pw" className="sr-only">New password</label>
              <input
                id="new-pw"
                type="password"
                placeholder="New password"
                autoComplete="new-password"
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setPasswordMsg(null) }}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                minLength={6}
              />
            </div>
            <div>
              <label htmlFor="confirm-pw" className="sr-only">Confirm new password</label>
              <input
                id="confirm-pw"
                type="password"
                placeholder="Confirm new password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setPasswordMsg(null) }}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              aria-busy={passwordLoading}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 min-h-[44px]"
            >
              {passwordLoading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>

        {/* ── Danger zone ── */}
        <div className="bg-white rounded-xl border border-red-100 p-6">
          <h2 className="text-base font-semibold text-red-600 mb-2">Danger Zone</h2>
          <p className="text-gray-500 text-sm mb-4">
            Permanently deletes your account and all documents, summaries, and chat history. This cannot be undone.
          </p>
          <button
            ref={deleteButtonRef}
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 min-h-[44px]"
          >
            Delete my account
          </button>
        </div>
      </main>

      {/* ── Delete confirmation modal ── */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          aria-hidden="false"
          onClick={e => { if (e.target === e.currentTarget) { setShowDeleteModal(false); setDeleteInput('') } }}
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            onKeyDown={trapFocus}
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
          >
            {/* Red header */}
            <div className="bg-red-600 px-8 py-5">
              <span aria-hidden="true" className="text-2xl block mb-1">⚠️</span>
              <h2 id="delete-modal-title" className="text-lg font-bold text-white">
                This action cannot be undone
              </h2>
            </div>

            <div className="px-8 py-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Deleting your account will permanently remove:</p>
              <ul className="space-y-2 mb-6" aria-label="Data that will be deleted">
                {[
                  'Your account and login credentials',
                  'All uploaded documents',
                  'All AI-generated summaries',
                  'All chat history',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <span aria-hidden="true" className="text-red-500 font-bold flex-shrink-0">✕</span>
                    {item}
                  </li>
                ))}
              </ul>

              <div role="alert" className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
                <p className="text-red-700 text-sm font-semibold">
                  This data cannot be recovered. There is no undo.
                </p>
              </div>

              <div className="mb-5">
                <label htmlFor="delete-confirm-input" className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                  Type <span className="font-mono text-gray-800">DELETE</span> to confirm
                </label>
                <input
                  id="delete-confirm-input"
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value)}
                  placeholder="DELETE"
                  autoComplete="off"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => { setShowDeleteModal(false); setDeleteInput('') }}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 min-h-[44px]"
                >
                  Cancel, keep my account
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== 'DELETE' || deleteLoading}
                  aria-busy={deleteLoading}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
                >
                  {deleteLoading ? 'Deleting…' : 'Delete everything'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
