import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrowserMark } from '../components/Header.jsx'
import Sidebar from '../components/Sidebar.jsx'
import FileCard from '../components/FileCard.jsx'
import FolderCard from '../components/FolderCard.jsx'
import UploadMenu from '../components/UploadMenu.jsx'
import ShareModal from '../components/ShareModal.jsx'
import PromptModal from '../components/PromptModal.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import MoveToModal from '../components/MoveToModal.jsx'
import {
  logout, listFiles, listFolders, uploadFile, createFolder,
  renameFile, deleteFile, moveFile, copyFile, downloadFile, reuploadFile,
  renameFolder, moveFolder, deleteFolder,
} from '../api/client.js'

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState('home')
  const [files, setFiles] = useState([])
  const [folders, setFolders] = useState([])
  const [currentFolder, setCurrentFolder] = useState(null) // { id, name } | null = root
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('new')
  const [shareTarget, setShareTarget] = useState(null)
  const [promptModal, setPromptModal] = useState(null) // { title, label, initialValue, confirmLabel, onConfirm }
  const [confirmModal, setConfirmModal] = useState(null) // { title, message, confirmLabel, onConfirm }
  const [moveModal, setMoveModal] = useState(null) // { itemName, currentParentId, excludeFolderId, onMove }
  const [uploadMenu, setUploadMenu] = useState(null) // { x, y } | null
  const [reuploadTargetId, setReuploadTargetId] = useState(null)

  const fileInputRef = useRef(null)
  const reuploadInputRef = useRef(null)
  const navigate = useNavigate()

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const folderId = currentFolder?.id ?? null
      const [filesData, foldersData] = await Promise.all([
        listFiles({ search, sort, folderId }),
        listFolders(folderId),
      ])
      setFiles(
        filesData.map((f) => ({
          id: f.id,
          name: f.name,
          updatedAt: formatRelativeTime(f.updated_at),
          visibility: f.visibility,
          slug: f.slug,
          previewUrl: f.preview_url,
        }))
      )
      setFolders(foldersData.map((fo) => ({ id: fo.id, name: fo.name })))
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate('/login')
        return
      }
      setError('Could not load your files. Check that the backend is running and try again.')
    } finally {
      setLoading(false)
    }
  }, [search, sort, currentFolder, navigate])

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort, currentFolder])

  async function handleFileAction(action, file) {
    try {
      if (action === 'Open') {
        window.open(`${file.previewUrl}?token=${localStorage.getItem('upflow_token')}`, '_blank')
      } else if (action === 'Download') {
        await downloadFile(file.id, file.name)
      } else if (action === 'Make a copy') {
        await copyFile(file.id)
        refresh()
      } else if (action === 'Share') {
        setShareTarget(file)
      } else if (action === 'Rename') {
        setPromptModal({
          title: 'Rename file',
          label: 'File name',
          initialValue: file.name,
          confirmLabel: 'Save',
          onConfirm: async (name) => {
            await renameFile(file.id, name)
            setPromptModal(null)
            refresh()
          },
        })
      } else if (action === 'Re-upload') {
        setReuploadTargetId(file.id)
        reuploadInputRef.current?.click()
      } else if (action === 'Move to') {
        setMoveModal({
          itemName: file.name,
          currentParentId: currentFolder?.id ?? null,
          excludeFolderId: null,
          onMove: async (destId) => {
            await moveFile(file.id, destId)
            setMoveModal(null)
            refresh()
          },
        })
      } else if (action === 'Delete') {
        setConfirmModal({
          title: 'Delete file',
          message: `Delete "${file.name}"? This can't be undone.`,
          confirmLabel: 'Delete',
          onConfirm: async () => {
            await deleteFile(file.id)
            setConfirmModal(null)
            refresh()
          },
        })
      }
    } catch (err) {
      window.alert(err?.response?.data?.detail || 'Something went wrong with that action.')
    }
  }

  async function handleFolderAction(action, folder) {
    try {
      if (action === 'Rename') {
        setPromptModal({
          title: 'Rename folder',
          label: 'Folder name',
          initialValue: folder.name,
          confirmLabel: 'Save',
          onConfirm: async (name) => {
            await renameFolder(folder.id, name)
            setPromptModal(null)
            refresh()
          },
        })
      } else if (action === 'Move to') {
        setMoveModal({
          itemName: folder.name,
          currentParentId: currentFolder?.id ?? null,
          excludeFolderId: folder.id,
          onMove: async (destId) => {
            await moveFolder(folder.id, destId)
            setMoveModal(null)
            refresh()
          },
        })
      } else if (action === 'Delete') {
        setConfirmModal({
          title: 'Delete folder',
          message: `Delete "${folder.name}" and everything inside it? This can't be undone.`,
          confirmLabel: 'Delete',
          onConfirm: async () => {
            await deleteFolder(folder.id)
            setConfirmModal(null)
            refresh()
          },
        })
      }
    } catch (err) {
      window.alert(err?.response?.data?.detail || 'Something went wrong with that action.')
    }
  }

  function handleUploadClick() {
    fileInputRef.current?.click()
  }

  async function handleFilesSelected(e) {
    const selected = Array.from(e.target.files || [])
    e.target.value = ''
    if (!selected.length) return
    try {
      for (const file of selected) {
        const formData = new FormData()
        formData.append('upload', file)
        await uploadFile(formData, currentFolder?.id ?? null)
      }
      refresh()
    } catch (err) {
      window.alert(err?.response?.data?.detail || 'Upload failed. Only .html/.htm files are accepted.')
    }
  }

  async function handleReuploadSelected(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !reuploadTargetId) return
    try {
      await reuploadFile(reuploadTargetId, file)
      refresh()
    } catch (err) {
      window.alert(err?.response?.data?.detail || 'Re-upload failed.')
    } finally {
      setReuploadTargetId(null)
    }
  }

  function handleNewFolder() {
    setPromptModal({
      title: 'New folder',
      label: 'Folder name',
      initialValue: 'Untitled folder',
      confirmLabel: 'Create',
      onConfirm: async (name) => {
        await createFolder(name, currentFolder?.id ?? null)
        setPromptModal(null)
        refresh()
      },
    })
  }

  function handleSignOut() {
    logout()
    navigate('/')
  }

  // Right-click on empty dashboard space opens the File/Folder upload popup.
  function handleMainContextMenu(e) {
    if (e.target.closest('.file-card, .folder-card, button, input, a')) return
    e.preventDefault()
    setUploadMenu({ x: e.clientX, y: e.clientY })
  }

  const filteredFolders = folders.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="dash-shell">
      <header className="dash-topbar">
        <a href="/" className="dash-brand">
          <BrowserMark size={26} />
          <span>Upflow</span>
        </a>
        <div className="dash-topbar-actions">
          <button className="btn btn-ghost btn-sm" onClick={handleNewFolder}>
            <FolderPlusIcon /> Folder
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleUploadClick}>
            <UploadIcon /> Upload
          </button>
          <input ref={fileInputRef} type="file" multiple accept=".html,.htm" hidden onChange={handleFilesSelected} />
          <input ref={reuploadInputRef} type="file" accept=".html,.htm" hidden onChange={handleReuploadSelected} />
          <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>Sign out</button>
        </div>
      </header>

      <div className="dash-body">
        <Sidebar active={activeNav} onChange={setActiveNav} />

        <main className="dash-main" onContextMenu={handleMainContextMenu}>
          <div className="dash-toolbar">
            <input
              className="dash-search"
              placeholder="Search folders and files"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="dash-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="new">Newest first</option>
              <option value="old">Oldest first</option>
            </select>
          </div>

          {currentFolder && (
            <button className="dash-breadcrumb" onClick={() => setCurrentFolder(null)}>
              &larr; Back to My uploads
            </button>
          )}

          {error && <div className="dash-error">{error}</div>}

          {loading ? (
            <div className="empty-state"><p>Loading your files…</p></div>
          ) : filteredFolders.length === 0 && files.length === 0 ? (
            <div className="empty-state">
              <p>No files yet. Upload an HTML file to get a live preview link.</p>
              <button className="btn btn-primary" onClick={handleUploadClick}>Upload your first file</button>
              <p className="empty-hint">Tip: right-click anywhere in this empty area for quick upload options.</p>
            </div>
          ) : (
            <>
              {filteredFolders.length > 0 && (
                <section className="dash-section">
                  <h3 className="dash-section-title">Folders</h3>
                  <div className="folder-grid">
                    {filteredFolders.map((folder) => (
                      <FolderCard
                        key={folder.id}
                        folder={folder}
                        onOpen={setCurrentFolder}
                        onAction={handleFolderAction}
                      />
                    ))}
                  </div>
                </section>
              )}
              {files.length > 0 && (
                <section className="dash-section">
                  <h3 className="dash-section-title">Files</h3>
                  <div className="file-grid">
                    {files.map((file) => (
                      <FileCard key={file.id} file={file} onAction={handleFileAction} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>

      <footer className="dash-footer">
        <span>Privacy · Terms © 2026 Upflow, from LightWeight Solutions</span>
      </footer>

      {shareTarget && (
        <ShareModal
          file={shareTarget}
          onClose={() => setShareTarget(null)}
          onShare={() => refresh()}
        />
      )}

      {promptModal && (
        <PromptModal
          title={promptModal.title}
          label={promptModal.label}
          initialValue={promptModal.initialValue}
          confirmLabel={promptModal.confirmLabel}
          onConfirm={promptModal.onConfirm}
          onClose={() => setPromptModal(null)}
        />
      )}

      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
          onConfirm={confirmModal.onConfirm}
          onClose={() => setConfirmModal(null)}
        />
      )}

      {moveModal && (
        <MoveToModal
          itemName={moveModal.itemName}
          currentParentId={moveModal.currentParentId}
          excludeFolderId={moveModal.excludeFolderId}
          onMove={moveModal.onMove}
          onClose={() => setMoveModal(null)}
        />
      )}

      {uploadMenu && (
        <UploadMenu
          x={uploadMenu.x}
          y={uploadMenu.y}
          onFileUpload={handleUploadClick}
          onFolderUpload={handleNewFolder}
          onClose={() => setUploadMenu(null)}
        />
      )}

      <style>{`
        .dash-shell { min-height: 100vh; display: flex; flex-direction: column; }
        .dash-topbar { display: flex; align-items: center; justify-content: space-between; padding: 0 24px; height: 68px; border-bottom: 1px solid var(--border); }
        .dash-brand { display: flex; align-items: center; gap: 10px; font-family: var(--font-display); font-weight: 700; }
        .dash-topbar-actions { display: flex; align-items: center; gap: 10px; }
        .btn-sm { padding: 9px 16px; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px; }
        .dash-body { flex: 1; display: flex; }
        .dash-main { flex: 1; padding: 24px 28px; min-height: calc(100vh - 68px - 52px); }
        .dash-toolbar { display: flex; gap: 12px; margin-bottom: 22px; }
        .dash-search { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 11px 14px; color: var(--ink); font-size: 0.9rem; }
        .dash-search:focus-visible { outline: 2px solid var(--flow); }
        .dash-sort { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 11px 14px; color: var(--ink); font-size: 0.88rem; }
        .dash-breadcrumb { background: none; color: var(--flow); font-size: 0.85rem; margin-bottom: 16px; padding: 0; }
        .dash-error { background: rgba(255,107,107,0.12); color: var(--coral); border: 1px solid rgba(255,107,107,0.3); border-radius: var(--radius-sm); padding: 12px 14px; margin-bottom: 18px; font-size: 0.87rem; }
        .dash-section { margin-bottom: 30px; }
        .dash-section-title { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-dim); margin: 0 0 12px; font-weight: 600; }
        .folder-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
        .file-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 18px; }
        .empty-state { text-align: center; padding: 80px 20px; color: var(--ink-dim); display: flex; flex-direction: column; align-items: center; gap: 18px; }
        .empty-hint { font-size: 0.78rem; opacity: 0.7; }
        .dash-footer { padding: 16px 24px; border-top: 1px solid var(--border); font-size: 0.8rem; color: var(--ink-dim); text-align: center; }
        @media (max-width: 640px) {
          .dash-topbar-actions span { display: none; }
        }
      `}</style>
    </div>
  )
}

function formatRelativeTime(isoString) {
  const then = new Date(isoString)
  const diffMs = Date.now() - then.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `Updated ${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Updated ${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `Updated ${days}d ago`
  return `Updated on ${then.toLocaleDateString()}`
}

function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 16v3a2 2 0 002 2h10a2 2 0 002-2v-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function FolderPlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M4 6.5a1 1 0 011-1h4.6l1.6 2h7.2a1 1 0 011 1v9.5a1 1 0 01-1 1H5a1 1 0 01-1-1V6.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M12 11v4M10 13h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}
