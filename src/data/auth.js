import { supabase } from './supabaseClient.js'

// Supabase Auth requires an email, so we derive a stable synthetic one from the username.
// This only works with email confirmations disabled (Authentication > Providers > Email),
// since no email is ever actually sent.
const EMAIL_DOMAIN = 'users.irislearn.app'

function usernameToEmail(username) {
  return `${username.trim().toLowerCase()}@${EMAIL_DOMAIN}`
}

export async function signUp(username, password) {
  const trimmed = username.trim()
  if (!trimmed) throw new Error('Username is required.')
  if (!password) throw new Error('Password is required.')

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .ilike('username', trimmed)
    .maybeSingle()
  if (existing) throw new Error('That username is already taken.')

  const { data, error } = await supabase.auth.signUp({
    email: usernameToEmail(trimmed),
    password,
    options: { data: { username: trimmed } },
  })
  if (error) throw new Error(error.message)
  if (!data.session) {
    throw new Error('Account created, but no session was returned. Check that email confirmations are disabled in Supabase.')
  }
  return { id: data.user.id, username: trimmed }
}

export async function signIn(username, password) {
  const trimmed = username.trim()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(trimmed),
    password,
  })
  if (error) throw new Error('Invalid username or password.')
  return { id: data.user.id, username: data.user.user_metadata?.username ?? trimmed }
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getSession()
  const user = data.session?.user
  if (!user) return null
  return { id: user.id, username: user.user_metadata?.username ?? null }
}


export function onAuthChange(callback) {
  const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user
    callback(user ? { id: user.id, username: user.user_metadata?.username ?? null } : null)
  })
  return () => subscription.subscription.unsubscribe()
}
