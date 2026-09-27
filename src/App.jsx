import { useEffect, useState } from 'react'
import Home from './components/Home.jsx'
import CreateQuiz from './components/CreateQuiz.jsx'
import TakeQuiz from './components/TakeQuiz.jsx'
import Login from './components/Login.jsx'
import { loadQuizzes, saveQuizzes, createQuizId } from './data/quizStorage.js'
import { getSession, setSession, clearSession } from './data/userStorage.js'
import './App.css'

function App() {
  const [quizzes, setQuizzes] = useState(() => loadQuizzes())
  const [view, setView] = useState('home')
  const [activeQuizId, setActiveQuizId] = useState(null)
  const [currentUser, setCurrentUser] = useState(() => getSession())

  useEffect(() => {
    saveQuizzes(quizzes)
  }, [quizzes])

  function handlePublish(quizDraft) {
    const quiz = { id: createQuizId(), publishedAt: Date.now(), ...quizDraft }
    setQuizzes((qs) => [quiz, ...qs])
    setView('home')
  }

  function handleSelectQuiz(quizId) {
    setActiveQuizId(quizId)
    setView('take')
  }

  function handleLogin(username) {
    setSession(username)
    setCurrentUser(username)
  }

  function handleLogout() {
    clearSession()
    setCurrentUser(null)
    setView('home')
  }

  const activeQuiz = quizzes.find((q) => q.id === activeQuizId)

  if (!currentUser) {
    return (
      <section id="center">
        <Login onLogin={handleLogin} />
      </section>
    )
  }

  return (
    <section id="center">
      {view === 'home' && (
        <Home
          quizzes={quizzes}
          onSelectQuiz={handleSelectQuiz}
          onCreateNew={() => setView('create')}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}
      {view === 'create' && (
        <CreateQuiz onPublish={handlePublish} onCancel={() => setView('home')} />
      )}
      {view === 'take' && activeQuiz && (
        <TakeQuiz quiz={activeQuiz} onBack={() => setView('home')} />
      )}
    </section>
  )
}

export default App
