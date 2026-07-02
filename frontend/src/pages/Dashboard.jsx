import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { BrowserMark } from '../components/Header.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import Sidebar from '../components/Sidebar.jsx'
import FileCard from '../components/FileCard.jsx'
import FolderCard from '../components/FolderCard.jsx'
import UploadMenu from '../components/UploadMenu.jsx'
import ShareModal from '../components/ShareModal.jsx'
import SettingsModal from '../components/SettingsModal.jsx'
import PromptModal from '../components/PromptModal.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import MoveToModal from '../components/MoveToModal.jsx'
import AboutModal from '../components/AboutModal.jsx'
import UploadsView from '../components/UploadsView.jsx'
import UserMenu from '../components/UserMenu.jsx'
import {
  logout, listFiles, listFolders, uploadFile, createFolder,
  renameFile, deleteFile, moveFile, copyFile, downloadFile, reuploadFile,
  renameFolder, moveFolder, deleteFolder, getCurrentUser,
} from '../api/client.js'

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState('home')
  const [files, setFiles] = useState([])
  const [folders, setFolders] = useState([])
  const [currentFolder, setCurrentFolder] = useState(null) // { id, name } | null = root
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState('') // what the person is typing, updates instantly
  const [search, setSearch] = useState('') // debounced value that actually triggers the fetch
  const [sort, setSort] = useState('new')
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser())
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedFileIds, setSelectedFileIds] = useState(() => new Set())
  const [selectedFolderIds, setSelectedFolderIds] = useState(() => new Set())
  const [shareTargets, setShareTargets] = useState(null) // array of files being shared, or null
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [promptModal, setPromptModal] = useState(null) // { title, label, initialValue, confirmLabel, onConfirm }
  const [confirmModal, setConfirmModal] = useState(null) // { title, message, confirmLabel, onConfirm }
  const [moveModal, setMoveModal] = useState(null) // { itemName, currentParentId, excludeFolderId, onMove }
  const [uploadMenu, setUploadMenu] = useState(null) // { x, y } | null
  const [reuploadTargetId, setReuploadTargetId] = useState(null)
  const [aboutOpen, setAboutOpen] = useState(false)

  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)
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

  // Debounce the search box so typing feels instant while the actual fetch
  // (and the grid re-render it triggers) settles in smoothly instead of
  // jumping on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 220)
    return () => clearTimeout(t)
  }, [searchInput])

  // Leaving selection mode, or navigating between folders, clears the
  // current picks so stale selections don't carry across views.
  useEffect(() => {
    setSelectedFileIds(new Set())
    setSelectedFolderIds(new Set())
    setSelectionMode(false)
  }, [currentFolder])

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
        setShareTargets([file])
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

  function handleFolderUploadClick() {
    folderInputRef.current?.click()
  }

  async function handleFolderSelected(e) {
    const selected = Array.from(e.target.files || [])
    e.target.value = ''
    if (!selected.length) return

    const ALLOWED_EXT = ['html', 'htm', 'css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'json', 'woff', 'woff2']
    const folderCache = new Map()
    folderCache.set('', currentFolder?.id ?? null)

    async function ensureFolder(path) {
      if (folderCache.has(path)) return folderCache.get(path)
      const parts = path.split('/')
      const name = parts[parts.length - 1]
      const parentPath = parts.slice(0, -1).join('/')
      const parentId = await ensureFolder(parentPath)
      const folder = await createFolder(name, parentId)
      folderCache.set(path, folder.id)
      return folder.id
    }

    let uploaded = 0
    let skipped = 0
    try {
      for (const file of selected) {
        // webkitRelativePath looks like "PickedFolder/sub/page.html" — the
        // first segment is the folder the person actually selected, so
        // recreating that same path recreates the folder itself instead of
        // just dumping its contents into the current view.
        const relPath = file.webkitRelativePath || file.name
        const segments = relPath.split('/')
        const fileName = segments[segments.length - 1]
        const dirPath = segments.slice(0, -1).join('/')
        const ext = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : ''
        if (!ALLOWED_EXT.includes(ext)) {
          skipped += 1
          continue
        }
        const folderId = await ensureFolder(dirPath)
        const formData = new FormData()
        formData.append('upload', file)
        await uploadFile(formData, folderId)
        uploaded += 1
      }
      refresh()
      if (skipped > 0) {
        window.alert(`Uploaded ${uploaded} file${uploaded === 1 ? '' : 's'}. Skipped ${skipped} file${skipped === 1 ? '' : 's'} with unsupported types.`)
      }
    } catch (err) {
      refresh()
      window.alert(err?.response?.data?.detail || 'Folder upload failed partway through. Some files may not have been uploaded.')
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

  // ---- Selection (Google Drive-style multi-select) ----

  function toggleSelectionMode() {
    setSelectionMode((v) => {
      const next = !v
      if (!next) {
        setSelectedFileIds(new Set())
        setSelectedFolderIds(new Set())
      }
      return next
    })
  }

  function toggleFileSelected(fileId) {
    if (!selectionMode) setSelectionMode(true)
    setSelectedFileIds((prev) => {
      const next = new Set(prev)
      if (next.has(fileId)) next.delete(fileId)
      else next.add(fileId)
      return next
    })
  }

  function toggleFolderSelected(folderId) {
    if (!selectionMode) setSelectionMode(true)
    setSelectedFolderIds((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) next.delete(folderId)
      else next.add(folderId)
      return next
    })
  }

  const allSelected =
    filteredFolders.length + files.length > 0 &&
    filteredFolders.every((f) => selectedFolderIds.has(f.id)) &&
    files.every((f) => selectedFileIds.has(f.id))

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedFileIds(new Set())
      setSelectedFolderIds(new Set())
    } else {
      setSelectedFileIds(new Set(files.map((f) => f.id)))
      setSelectedFolderIds(new Set(filteredFolders.map((f) => f.id)))
      setSelectionMode(true)
    }
  }

  const selectedCount = selectedFileIds.size + selectedFolderIds.size
  const selectedFileObjs = files.filter((f) => selectedFileIds.has(f.id))
  const selectedFolderObjs = filteredFolders.filter((f) => selectedFolderIds.has(f.id))

  function clearSelection() {
    setSelectedFileIds(new Set())
    setSelectedFolderIds(new Set())
    setSelectionMode(false)
  }

  function handleBulkDelete() {
    const label = selectedCount === 1
      ? `"${(selectedFileObjs[0] || selectedFolderObjs[0])?.name}"`
      : `these ${selectedCount} items`
    setConfirmModal({
      title: 'Delete selected',
      message: `Delete ${label}? This can't be undone.`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        await Promise.all([
          ...selectedFileObjs.map((f) => deleteFile(f.id)),
          ...selectedFolderObjs.map((f) => deleteFolder(f.id)),
        ])
        setConfirmModal(null)
        clearSelection()
        refresh()
      },
    })
  }

  function handleBulkMove() {
    const label = selectedCount === 1
      ? (selectedFileObjs[0] || selectedFolderObjs[0])?.name
      : `${selectedCount} items`
    setMoveModal({
      itemName: label,
      currentParentId: currentFolder?.id ?? null,
      excludeFolderId: selectedFolderObjs[0]?.id ?? null,
      onMove: async (destId) => {
        await Promise.all([
          ...selectedFileObjs.map((f) => moveFile(f.id, destId)),
          ...selectedFolderObjs.map((f) => moveFolder(f.id, destId)),
        ])
        setMoveModal(null)
        clearSelection()
        refresh()
      },
    })
  }

  function handleBulkShare() {
    if (selectedFileObjs.length === 0 || selectedFolderObjs.length !== 0) return
    setShareTargets(selectedFileObjs)
  }

  async function handleBulkDownload() {
    for (const f of selectedFileObjs) {
      // eslint-disable-next-line no-await-in-loop
      await downloadFile(f.id, f.name)
    }
  }

  async function handleBulkCopy() {
    await Promise.all(selectedFileObjs.map((f) => copyFile(f.id)))
    clearSelection()
    refresh()
  }

  return (
    <div className="dash-shell">
      <header className="dash-topbar">
        <button type="button" className="dash-brand" onClick={() => setAboutOpen(true)}>
          <BrowserMark size={26} />
          <span>Upflow</span>
        </button>
        <div className="dash-topbar-actions">
          <Link to="/" className="btn btn-ghost btn-sm">
            <HomeIcon /> <span>Landing page</span>
          </Link>
          <button className="btn btn-ghost btn-sm" onClick={handleNewFolder}>
            <FolderPlusIcon /> Folder
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleUploadClick}>
            <UploadIcon /> Upload
          </button>
          <input ref={fileInputRef} type="file" multiple accept=".html,.htm" hidden onChange={handleFilesSelected} />
          <input
            ref={folderInputRef}
            type="file"
            webkitdirectory=""
            directory=""
            mozdirectory=""
            multiple
            hidden
            onChange={handleFolderSelected}
          />
          <input ref={reuploadInputRef} type="file" accept=".html,.htm" hidden onChange={handleReuploadSelected} />
          <ThemeToggle />
          <UserMenu name={currentUser?.name} email={currentUser?.email} onSignOut={handleSignOut} onSettings={() => setSettingsOpen(true)} />
        </div>
      </header>

      <div className="dash-body">
        <Sidebar active={activeNav} onChange={setActiveNav} onSignOut={handleSignOut} />

        <main className="dash-main" onContextMenu={handleMainContextMenu}>
          {activeNav === 'uploads' ? (
            <UploadsView />
          ) : (
            <>
              <div className="dash-toolbar">
                <input
                  className="dash-search"
                  placeholder="Search folders and files"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <select className="dash-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="new">Newest first</option>
                  <option value="old">Oldest first</option>
                </select>
              </div>

              <div className={`selection-bar ${selectionMode ? 'open' : ''}`}>
                {selectionMode ? (
                  <>
                    <button className="selection-close" onClick={clearSelection} aria-label="Clear selection">
                      <CloseIcon />
                    </button>
                    <span className="selection-count">
                      {selectedCount > 0 ? `${selectedCount} selected` : 'Select items below'}
                    </span>
                    {selectedCount > 0 && (
                      <div className="selection-actions">
                        <button className="selection-action-btn" onClick={toggleSelectAll} title="Select all">
                          <CheckIcon /> {allSelected ? 'Deselect all' : 'Select All'}
                        </button>
                        <button
                          className="selection-action-btn"
                          onClick={handleBulkDownload}
                          disabled={selectedFileObjs.length === 0 || selectedFolderObjs.length > 0}
                          title="Download"
                        >
                          <DownloadIcon /> Download
                        </button>
                        <button className="selection-action-btn" onClick={handleBulkMove} title="Move to">
                          <MoveIcon /> Move to
                        </button>
                        <button
                          className="selection-action-btn"
                          onClick={handleBulkShare}
                          disabled={selectedFileObjs.length === 0 || selectedFolderObjs.length > 0}
                          title="Share"
                        >
                          <ShareIcon /> Share
                        </button>
                        <button
                          className="selection-action-btn"
                          onClick={handleBulkCopy}
                          disabled={selectedFileObjs.length === 0 || selectedFolderObjs.length > 0}
                          title="Make a copy"
                        >
                          <CopyIcon /> Make a Copy
                        </button>
                        <button className="selection-action-btn danger" onClick={handleBulkDelete} title="Delete">
                          <DeleteIcon /> Delete
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <button className="selection-select-btn" onClick={toggleSelectionMode}>
                    <SelectIcon /> Select
                  </button>
                )}
              </div>

              {currentFolder && (
                <button className="dash-breadcrumb" onClick={() => setCurrentFolder(null)}>
                  &larr; Back to Home
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
                            selectionMode={selectionMode}
                            selected={selectedFolderIds.has(folder.id)}
                            onToggleSelect={() => toggleFolderSelected(folder.id)}
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
                          <FileCard
                            key={file.id}
                            file={file}
                            onAction={handleFileAction}
                            selectionMode={selectionMode}
                            selected={selectedFileIds.has(file.id)}
                            onToggleSelect={() => toggleFileSelected(file.id)}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>

      <footer className="dash-footer">
        <span>Privacy · Terms © 2026 Upflow, from LightWeight Solutions</span>
      </footer>

      {shareTargets && (
        <ShareModal
          files={shareTargets}
          onClose={() => setShareTargets(null)}
          onShare={() => refresh()}
        />
      )}

      {settingsOpen && (
        <SettingsModal
          user={currentUser}
          onClose={() => setSettingsOpen(false)}
          onUpdated={(updated) => setCurrentUser(updated)}
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
          onFolderUpload={handleFolderUploadClick}
          onClose={() => setUploadMenu(null)}
        />
      )}

      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}

      <style>{`
        .dash-shell { min-height: 100vh; display: flex; flex-direction: column; }
        .dash-topbar { display: flex; align-items: center; justify-content: space-between; padding: 0 24px; height: 68px; border-bottom: 1px solid var(--border); }
        .dash-brand {
          display: flex; align-items: center; gap: 10px; font-family: var(--font-display); font-weight: 700;
          background: none; border: none; padding: 0; color: var(--ink); cursor: pointer; font-size: 1rem;
          border-radius: var(--radius-sm);
        }
        .dash-brand:hover { color: var(--flow); }
        .dash-brand:focus-visible { outline: 2px solid var(--flow); outline-offset: 3px; }
        .dash-topbar-actions { display: flex; align-items: center; gap: 10px; }
        .btn-sm { padding: 9px 16px; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px; }
        .dash-body { flex: 1; display: flex; }
        .dash-main { flex: 1; padding: 24px 28px; min-height: calc(100vh - 68px - 52px); }

        .selection-bar { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 18px; min-height: 40px; }
        .selection-select-btn {
          display: inline-flex; align-items: center; gap: 7px; background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-sm); padding: 9px 14px; color: var(--ink-dim); font-size: 0.85rem;
          transition: border-color 0.15s ease, color 0.15s ease;
        }
        .selection-select-btn:hover { border-color: var(--flow); color: var(--flow); }
        .selection-close { flex-shrink: 0; background: none; color: var(--ink-dim); padding: 6px; border-radius: 50%; display: flex; }
        .selection-close:hover { background: var(--surface-2); color: var(--ink); }
        .selection-count { font-size: 0.85rem; color: var(--ink-dim); white-space: nowrap; }
        .selection-actions { display: flex; flex-wrap: wrap; gap: 8px; }
        .selection-action-btn {
          display: inline-flex; align-items: center; gap: 6px; background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-sm); padding: 8px 13px; color: var(--ink); font-size: 0.83rem; white-space: nowrap;
          transition: border-color 0.15s ease, color 0.15s ease, opacity 0.15s ease;
        }
        .selection-action-btn:hover:not(:disabled) { border-color: var(--flow); color: var(--flow); }
        .selection-action-btn:disabled { opacity: 0.4; cursor: default; }
        .selection-action-btn.danger:hover:not(:disabled) { border-color: var(--coral); color: var(--coral); }

        .dash-toolbar { display: flex; gap: 12px; margin-bottom: 22px; transition: margin-top 0.22s ease; }
        .dash-search { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 11px 14px; color: var(--ink); font-size: 0.9rem; transition: border-color 0.15s ease, box-shadow 0.15s ease; }
        .dash-search:focus-visible { outline: 2px solid var(--flow); }
        .dash-search:focus { border-color: var(--flow); box-shadow: 0 0 0 3px rgba(94,230,197,0.12); }
        .dash-sort { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 11px 14px; color: var(--ink); font-size: 0.88rem; }
        .dash-breadcrumb { background: none; color: var(--flow); font-size: 0.85rem; margin-bottom: 16px; padding: 0; }
        .dash-error { background: rgba(255,107,107,0.12); color: var(--coral); border: 1px solid rgba(255,107,107,0.3); border-radius: var(--radius-sm); padding: 12px 14px; margin-bottom: 18px; font-size: 0.87rem; }
        .dash-section { margin-bottom: 30px; animation: sectionFadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1); }
        .dash-section-title { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-dim); margin: 0 0 12px; font-weight: 600; }
        .folder-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
        .file-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
        .empty-state { text-align: center; padding: 80px 20px; color: var(--ink-dim); display: flex; flex-direction: column; align-items: center; gap: 18px; animation: sectionFadeIn 0.28s ease; }
        .empty-hint { font-size: 0.78rem; opacity: 0.7; }
        .dash-footer { padding: 16px 24px; border-top: 1px solid var(--border); font-size: 0.8rem; color: var(--ink-dim); text-align: center; }
        @keyframes sectionFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .dash-topbar-actions span { display: none; }
          .selection-actions { margin-left: 0; }
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

function HomeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M4 11.5L12 4l8 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9a1 1 0 001 1h3v-5a1 1 0 011-1h2a1 1 0 011 1v5h3a1 1 0 001-1v-9" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
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

function SelectIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.5 12.5l2.3 2.3L16 9.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M5 12.5l4.5 4.5L19 7" stroke="#06231C" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="6" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="6" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="18" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.1 10.9L14.9 7.1M8.1 13.1l6.8 3.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function MoveIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M4 6.5a1 1 0 011-1h4.6l1.6 2h7.2a1 1 0 011 1v9.5a1 1 0 01-1 1H5a1 1 0 01-1-1V6.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9.5 12.5h5M12.2 9.8l3 2.7-3 2.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M8 8V5a1 1 0 011-1h9a1 1 0 011 1v9a1 1 0 01-1 1h-3M6 8h9a1 1 0 011 1v9a1 1 0 01-1 1H6a1 1 0 01-1-1V9a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M12 4v11M12 15l-4-4M12 15l4-4M5 18h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DeleteIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M5 7h14M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0v12a1 1 0 001 1h8a1 1 0 001-1V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
