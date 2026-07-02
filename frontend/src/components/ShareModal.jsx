import { useEffect, useState } from 'react'
import Modal from './Modal.jsx'
import { getAuthToken, shareFile, getFileAccessList } from '../api/client.js'

/**
 * Share modal. Accepts a `files` array (length 1 or more). With a single
 * file it behaves like before — visibility toggle, copyable link, and the
 * "people with access" list. With 2+ files, those single-file-only bits
 * (link, visibility, access list) are hidden and it becomes a straight
 * "send these files to this email" flow — each recipient gets every
 * selected file as an actual HTML attachment, not just a link.
 */
export default function ShareModal({ files, onClose, onShare }) {
  const list = files || []
  const isMulti = list.length > 1
  const single = list[0]

  const [visibility, setVisibility] = useState(single?.visibility || 'private')
  const [email, setEmail] = useState('')
  const [copied, setCopied] = useState(false)
  const [accessList, setAccessList] = useState([])
  const [savingVisibility, setSavingVisibility] = useState(false)
  const [sendingInvite, setSendingInvite] = useState(false)
  const [banner, setBanner] = useState(null) // { type: 'success' | 'error', text }

  const baseLink = single?.previewUrl || `${window.location.origin}/p/${single?.slug || ''}`
  const link = visibility === 'private' ? `${baseLink}?token=${getAuthToken() || ''}` : baseLink

  useEffect(() => {
    let cancelled = false
    if (isMulti || !single?.id) return
    getFileAccessList(single.id)
      .then((data) => !cancelled && setAccessList(data))
      .catch(() => {})
    return () => { cancelled = true }
  }, [isMulti, single?.id])

  function handleCopy() {
    navigator.clipboard?.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  async function handleVisibilityChange(next) {
    if (next === visibility || savingVisibility || !single) return
    setVisibility(next)
    setSavingVisibility(true)
    setBanner(null)
    try {
      await shareFile(single.id, { visibility: next })
      onShare?.()
    } catch (err) {
      setVisibility(visibility) // revert on failure
      setBanner({ type: 'error', text: err?.response?.data?.detail || 'Could not update sharing settings.' })
    } finally {
      setSavingVisibility(false)
    }
  }

  async function handleInvite() {
    if (!email || sendingInvite || list.length === 0) return
    setSendingInvite(true)
    setBanner(null)
    try {
      // Fire off one share call per selected file so the recipient gets
      // every file as its own emailed attachment.
      const results = await Promise.all(
        list.map((f) => shareFile(f.id, { visibility: isMulti ? undefined : visibility, invite_email: email }))
      )
      const anyFailed = results.some((r) => r.invite_email_sent === false)
      if (anyFailed) {
        const failedMsg = results.find((r) => r.invite_email_sent === false)?.invite_email_error
        setBanner({ type: 'error', text: failedMsg || `${email} now has access, but the invite email failed to send.` })
      } else {
        setBanner({
          type: 'success',
          text: isMulti ? `${list.length} files sent to ${email}.` : `Invite sent to ${email}.`,
        })
      }
      setEmail('')
      if (!isMulti && single?.id) {
        const accData = await getFileAccessList(single.id)
        setAccessList(accData)
      }
      onShare?.()
    } catch (err) {
      setBanner({ type: 'error', text: err?.response?.data?.detail || "Couldn't send that invite. Try again." })
    } finally {
      setSendingInvite(false)
    }
  }

  const title = isMulti ? `Share ${list.length} files` : `Share \u201c${single?.name}\u201d`

  return (
    <Modal title={title} onClose={onClose} width={440} labelledBy="share-modal-title">
      {!isMulti && (
        <>
          <div className="visibility-toggle">
            <button className={visibility === 'private' ? 'active' : ''} disabled={savingVisibility} onClick={() => handleVisibilityChange('private')}>
              Private
            </button>
            <button className={visibility === 'public' ? 'active' : ''} disabled={savingVisibility} onClick={() => handleVisibilityChange('public')}>
              Public
            </button>
          </div>
          <p className="visibility-hint">
            {visibility === 'public'
              ? 'Anyone with the link can open this preview.'
              : "Only the owner and invited people can open this. \u201cCopy link\u201d below appends your session token so you can test the link yourself \u2014 don't send that version to anyone else."}
          </p>

          <div className="link-row">
            <input readOnly value={link} />
            <button className="btn btn-ghost btn-sm" onClick={handleCopy}>{copied ? 'Copied' : 'Copy link'}</button>
          </div>
        </>
      )}

      {isMulti && (
        <p className="visibility-hint">
          Sending <strong>{list.length}</strong> files: {list.map((f) => f.name).join(', ')}
        </p>
      )}

      <div className="invite-row">
        <input
          type="email"
          placeholder={isMulti ? "Send files to this email" : "Add people by email"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleInvite() }}
        />
        <button className="btn btn-primary btn-sm" onClick={handleInvite} disabled={sendingInvite || !email}>
          {sendingInvite ? 'Sending\u2026' : 'Send'}
        </button>
      </div>
      <p className="visibility-hint" style={{ marginTop: -6 }}>
        The actual HTML {isMulti ? 'files are' : 'file is'} attached to the email, along with a live preview link.
      </p>

      {banner && <p className={`share-banner ${banner.type}`}>{banner.text}</p>}

      {!isMulti && (
        <div className="access-list">
          <span className="access-title">People with access</span>
          {accessList.length === 0 ? (
            <p className="access-empty">Just you, for now.</p>
          ) : (
            accessList.map((person, i) => (
              <div key={`${person.email || person.name}-${i}`} className="access-row">
                <span className="access-name" title={person.email || ''}>{person.name}</span>
                <span className="access-role">{person.role}</span>
              </div>
            ))
          )}
        </div>
      )}

      <style>{`
        .visibility-toggle { display: flex; background: var(--surface-2); border-radius: 999px; padding: 4px; gap: 4px; margin-bottom: 10px; }
        .visibility-toggle button { flex: 1; padding: 9px; border-radius: 999px; font-size: 0.85rem; color: var(--ink-dim); background: none; }
        .visibility-toggle button:disabled { opacity: 0.6; cursor: default; }
        .visibility-toggle button.active { background: var(--flow); color: #06231C; font-weight: 600; }
        .visibility-hint { font-size: 0.8rem; color: var(--ink-dim); margin-bottom: 18px; }
        .link-row, .invite-row { display: flex; gap: 8px; margin-bottom: 14px; }
        .link-row input, .invite-row input {
          flex: 1; background: var(--canvas); border: 1px solid var(--border); border-radius: var(--radius-sm);
          padding: 10px 12px; color: var(--ink); font-size: 0.85rem; font-family: var(--font-mono); min-width: 0;
        }
        .invite-row input { font-family: var(--font-body); }
        .btn-sm { padding: 9px 16px; font-size: 0.82rem; white-space: nowrap; }
        .share-banner { font-size: 0.82rem; border-radius: var(--radius-sm); padding: 10px 12px; margin: -2px 0 14px; }
        .share-banner.success { color: var(--flow); background: rgba(52, 211, 153, 0.12); border: 1px solid rgba(52, 211, 153, 0.3); }
        .share-banner.error { color: var(--coral); background: rgba(255,107,107,0.12); border: 1px solid rgba(255,107,107,0.3); }
        .access-list { border-top: 1px solid var(--border); padding-top: 14px; display: flex; flex-direction: column; gap: 10px; }
        .access-title { font-size: 0.78rem; color: var(--ink-dim); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.05em; }
        .access-empty { font-size: 0.85rem; color: var(--ink-dim); margin: 0; }
        .access-row { display: flex; justify-content: space-between; gap: 10px; font-size: 0.88rem; }
        .access-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .access-role { color: var(--ink-dim); flex-shrink: 0; text-transform: capitalize; }
      `}</style>
    </Modal>
  )
}
