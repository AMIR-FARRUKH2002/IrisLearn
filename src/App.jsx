import { useEffect, useState } from 'react'
import Home from './components/Home.jsx'
import CreateQuiz from './components/CreateQuiz.jsx'
import TakeQuiz from './components/TakeQuiz.jsx'
import Login from './components/Login.jsx'
import TopBar from './components/TopBar.jsx'
import { loadQuizzes, publishQuiz } from './data/quizStorage.js'
import { getCurrentUser, onAuthChange, signOut } from './data/auth.js'
import './App.css'

function App() {
  const [quizzes, setQuizzes] = useState([])
  const [view, setView] = useState('home')
  const [activeQuizId, setActiveQuizId] = useState(null)
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

  async function handlePublish(quizDraft) {
    const updatedQuizzes = await publishQuiz(quizDraft)
    setQuizzes(updatedQuizzes)
    setView('home')
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
            onCreateNew={() => setView('create')}
            currentUserId={currentUser.id}
          />
        )}
        {view === 'create' && (
          <CreateQuiz onPublish={handlePublish} onCancel={() => setView('home')} />
        )}
        {view === 'take' && activeQuiz && (
          <TakeQuiz quiz={activeQuiz} onBack={() => setView('home')} />
        )}
      </section>
    </>
  )
}

export default App
