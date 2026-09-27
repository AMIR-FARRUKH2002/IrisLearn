import { useEffect, useState } from 'react'
import Home from './components/Home.jsx'
import CreateQuiz from './components/CreateQuiz.jsx'
import TakeQuiz from './components/TakeQuiz.jsx'
import Login from './components/Login.jsx'
import TopBar from './components/TopBar.jsx'
import { loadQuizzes, publishQuiz, updateQuiz, deleteQuiz } from './data/quizStorage.js'
import { getCurrentUser, onAuthChange, signOut } from './data/auth.js'
import './App.css'

function App() {
  const [quizzes, setQuizzes] = useState([])
  const [view, setView] = useState('home')
  const [activeQuizId, setActiveQuizId] = useState(null)
  const [editingQuizId, setEditingQuizId] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    getCurrentUser().then((user) => {
      setCurrentUser(user)
      setAuthLoading(false)
    })
    return onAuthChange((user) => setCurrentUser(user))
  }, [])

  useEffect(() => {
    if (!currentUser) return
    loadQuizzes()
      .then(setQuizzes)
      .catch((err) => console.error('Failed to load quizzes:', err.message))
  }, [currentUser])

  async function handleSaveQuiz(quizDraft) {
    const updatedQuizzes = editingQuizId
      ? await updateQuiz(editingQuizId, quizDraft)
      : await publishQuiz(quizDraft)
    setQuizzes(updatedQuizzes)
    setEditingQuizId(null)
    setView('home')
  }

  function handleCreateNew() {
    setEditingQuizId(null)
    setView('create')
  }

  function handleEditQuiz(quizId) {
    setEditingQuizId(quizId)
    setView('create')
  }

  async function handleDeleteQuiz(quizId) {
    if (!window.confirm('Delete this quiz? This cannot be undone.')) return
    const updatedQuizzes = await deleteQuiz(quizId)
    setQuizzes(updatedQuizzes)
  }

  function handleSelectQuiz(quizId) {
    setActiveQuizId(quizId)
    setView('take')
  }

  function handleLogin(user) {
    setCurrentUser(user)
  }

  async function handleLogout() {
    await signOut()
    setCurrentUser(null)
    setView('home')
  }

  const activeQuiz = quizzes.find((q) => q.id === activeQuizId)
  const editingQuiz = quizzes.find((q) => q.id === editingQuizId)

  if (authLoading) {
    return (
      <>
        <TopBar />
        <section id="center" />
      </>
    )
  }

  if (!currentUser) {
    return (
      <>
        <TopBar />
        <section id="center">
          <Login onLogin={handleLogin} />
        </section>
      </>
    )
  }

  return (
    <>
      <TopBar currentUser={currentUser.username} onLogout={handleLogout} />
      <section id="center">
        {view === 'home' && (
          <Home
            quizzes={quizzes}
            onSelectQuiz={handleSelectQuiz}
            onCreateNew={handleCreateNew}
            currentUserId={currentUser.id}
            onEditQuiz={handleEditQuiz}
            onDeleteQuiz={handleDeleteQuiz}
          />
        )}
        {view === 'create' && (
          <CreateQuiz
            initialQuiz={editingQuiz}
            onPublish={handleSaveQuiz}
            onCancel={() => {
              setEditingQuizId(null)
              setView('home')
            }}
          />
        )}
        {view === 'take' && activeQuiz && (
          <TakeQuiz quiz={activeQuiz} onBack={() => setView('home')} />
        )}
      </section>
    </>
  )
}

export default App
