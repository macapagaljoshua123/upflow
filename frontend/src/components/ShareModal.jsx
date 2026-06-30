import { useState } from 'react'

export default function ShareModal({ file, onClose, onShare }) {
  const [visibility, setVisibility] = useState(file?.visibility || 'private')
  const [email, setEmail] = useState('')
  const [copied, setCopied] = useState(false)

  const link = `https://upflow.app/p/${file?.slug || 'your-file'}`
  const accessList = file?.accessList || [
    { name: file?.owner || 'You', role: 'Owner' },
  ]

  function handleCopy() {
    navigator.clipboard?.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  function handleInvite() {
    if (!email) return
    onShare?.({ visibility, inviteEmail: email })
    setEmail('')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Share \u201c{file?.name}\u201d</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">\u00d7</button>
        </div>

        <div className="visibility-toggle">
          <button className={visibility === 'private' ? 'active' : ''} onClick={() => { setVisibility('private'); onShare?.({ visibility: 'private' }) }}>
            Private
          </button>
          <button className={visibility === 'public' ? 'active' : ''} onClick={() => { setVisibility('public'); onShare?.({ visibility: 'public' }) }}>
            Public
          </button>
        </div>
        <p className="visibility-hint">
          {visibility === 'public'
            ? 'Anyone with the link can open this preview.'
            : 'Only people you invite by email can open this preview.'}
        </p>

        <div className="link-row">
          <input readOnly value={link} />
          <button className="btn btn-ghost btn-sm" onClick={handleCopy}>{copied ? 'Copied' : 'Copy link'}</button>
        </div>

        <div className="invite-row">
          <input
            type="email"
            placeholder="Add people by email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn btn-primary btn-sm" onClick={handleInvite}>Send</button>
        </div>

        <div className="access-list">
          <span className="access-title">People with access</span>
          {accessList.map((person) => (
            <div key={person.name} className="access-row">
              <span>{person.name}</span>
              <span className="access-role">{person.role}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
        .modal-card { width: 100%; max-width: 440px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 26px; }
        .modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
        .modal-head h3 { font-size: 1.05rem; }
        .modal-close { background: none; color: var(--ink-dim); font-size: 1.3rem; line-height: 1; }
        .visibility-toggle { display: flex; background: var(--surface-2); border-radius: 999px; padding: 4px; gap: 4px; margin-bottom: 10px; }
        .visibility-toggle button { flex: 1; padding: 9px; border-radius: 999px; font-size: 0.85rem; color: var(--ink-dim); background: none; }
        .visibility-toggle button.active { background: var(--flow); color: #06231C; font-weight: 600; }
        .visibility-hint { font-size: 0.8rem; color: var(--ink-dim); margin-bottom: 18px; }
        .link-row, .invite-row { display: flex; gap: 8px; margin-bottom: 14px; }
        .link-row input, .invite-row input {
          flex: 1; background: var(--canvas); border: 1px solid var(--border); border-radius: var(--radius-sm);
          padding: 10px 12px; color: var(--ink); font-size: 0.85rem; font-family: var(--font-mono);
        }
        .invite-row input { font-family: var(--font-body); }
        .btn-sm { padding: 9px 16px; font-size: 0.82rem; white-space: nowrap; }
        .access-list { border-top: 1px solid var(--border); padding-top: 14px; display: flex; flex-direction: column; gap: 10px; }
        .access-title { font-size: 0.78rem; color: var(--ink-dim); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.05em; }
        .access-row { display: flex; justify-content: space-between; font-size: 0.88rem; }
        .access-role { color: var(--ink-dim); }
      `}</style>
    </div>
  )
}
