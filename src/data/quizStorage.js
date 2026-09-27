const STORAGE_KEY = 'irislearn.quizzes'

export function loadQuizzes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveQuizzes(quizzes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quizzes))
}

export function createQuizId() {
  return `quiz_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
