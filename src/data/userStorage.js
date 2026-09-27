const USERS_KEY = 'irislearn.users'
const SESSION_KEY = 'irislearn.session'

async function hashPassword(password) {
  const data = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export async function createUser(username, password) {
  const trimmed = username.trim()
  if (!trimmed) throw new Error('Username is required.')
  if (!password) throw new Error('Password is required.')
  const users = loadUsers()
  if (users.some((u) => u.username.toLowerCase() === trimmed.toLowerCase())) {
    throw new Error('That username is already taken.')
  }
  const passwordHash = await hashPassword(password)
  users.push({ username: trimmed, passwordHash })
  saveUsers(users)
  return trimmed
}

export async function verifyUser(username, password) {
  const trimmed = username.trim()
  const users = loadUsers()
  const user = users.find((u) => u.username.toLowerCase() === trimmed.toLowerCase())
  if (!user) throw new Error('Invalid username or password.')
  const passwordHash = await hashPassword(password)
  if (passwordHash !== user.passwordHash) throw new Error('Invalid username or password.')
  return user.username
}

export function getSession() {
  return localStorage.getItem(SESSION_KEY)
}

export function setSession(username) {
  localStorage.setItem(SESSION_KEY, username)
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}
