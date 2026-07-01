import { useEffect, useRef } from 'react'

export default function UploadMenu({ x, y, onFileUpload, onFolderUpload, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    function handleEsc(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [onClose])

  return (
    <div className="upload-menu" ref={ref} style={{ left: x, top: y }}>
      <button className="upload-menu-item" onClick={() => { onFileUpload(); onClose() }}>
        <UploadFileIcon />
        <span>File upload</span>
      </button>
      <button className="upload-menu-item" onClick={() => { onFolderUpload(); onClose() }}>
        <UploadFolderIcon />
        <span>Folder upload</span>
      </button>

      <style>{`
        .upload-menu { position: fixed; z-index: 50; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 6px; min-width: 180px; box-shadow: 0 14px 30px rgba(0,0,0,0.45); }
        .upload-menu-item { width: 100%; text-align: left; padding: 10px 12px; border-radius: 6px; font-size: 0.88rem; background: none; color: var(--ink); display: flex; align-items: center; gap: 10px; }
        .upload-menu-item:hover { background: var(--surface); }
      `}</style>
    </div>
  )
}

function UploadFileIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M14 3H7a1 1 0 00-1 1v16a1 1 0 001 1h10a1 1 0 001-1V8l-4-5z" stroke="var(--flow)" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 12v6M12 12l-2.5 2.5M12 12l2.5 2.5" stroke="var(--flow)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UploadFolderIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M4 6.5a1 1 0 011-1h4.6l1.6 2h7.2a1 1 0 011 1v9.5a1 1 0 01-1 1H5a1 1 0 01-1-1V6.5z" stroke="var(--flow)" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 11v4.5M9.75 13.25L12 11l2.25 2.25" stroke="var(--flow)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
