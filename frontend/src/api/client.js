import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('upflow_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export async function signup(payload) {
  const { data } = await client.post('/auth/signup', payload)
  localStorage.setItem('upflow_token', data.access_token)
  return data
}

export async function login(payload) {
  const { data } = await client.post('/auth/login', payload)
  localStorage.setItem('upflow_token', data.access_token)
  return data
}

export function logout() {
  localStorage.removeItem('upflow_token')
}

export async function listFiles({ search = '', sort = 'new', folderId = null } = {}) {
  const { data } = await client.get('/files', { params: { search, sort, folder_id: folderId } })
  return data
}

export async function uploadFile(formData, folderId = null) {
  const { data } = await client.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    params: folderId ? { folder_id: folderId } : {},
  })
  return data
}

export async function createFolder(name, parentId = null) {
  const { data } = await client.post('/files/folders', { name, parent_id: parentId })
  return data
}

export async function renameFile(fileId, name) {
  const { data } = await client.patch(`/files/${fileId}`, { name })
  return data
}

export async function deleteFile(fileId) {
  const { data } = await client.delete(`/files/${fileId}`)
  return data
}

export async function moveFile(fileId, folderId) {
  const { data } = await client.patch(`/files/${fileId}/move`, { folder_id: folderId })
  return data
}

export async function copyFile(fileId) {
  const { data } = await client.post(`/files/${fileId}/copy`)
  return data
}

export async function listFolders(parentId = null) {
  const { data } = await client.get('/files/folders', { params: { parent_id: parentId } })
  return data
}

export async function renameFolder(folderId, name) {
  const { data } = await client.patch(`/files/folders/${folderId}`, { name })
  return data
}

export async function moveFolder(folderId, parentId) {
  const { data } = await client.patch(`/files/folders/${folderId}/move`, { parent_id: parentId })
  return data
}

export async function deleteFolder(folderId) {
  const { data } = await client.delete(`/files/folders/${folderId}`)
  return data
}

export async function downloadFile(fileId, fileName) {
  const res = await client.get(`/files/${fileId}/download`, { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([res.data]))
  const a = document.createElement('a')
  a.href = url
  a.download = fileName || 'download.html'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

export async function reuploadFile(fileId, file) {
  const formData = new FormData()
  formData.append('upload', file)
  const { data } = await client.post(`/files/${fileId}/reupload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export function getAuthToken() {
  return localStorage.getItem('upflow_token')
}

export async function shareFile(fileId, payload) {
  // payload: { visibility: 'public' | 'private', invite_email?: string }
  const { data } = await client.post(`/files/${fileId}/share`, payload)
  return data
}

export async function getFileAccessList(fileId) {
  const { data } = await client.get(`/files/${fileId}/access`)
  return data
}

export async function getUploadHistory() {
  const { data } = await client.get('/files/history')
  return data
}
