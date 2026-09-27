import { useEffect, useState } from 'react'
import Home from './components/Home.jsx'
import CreateQuiz from './components/CreateQuiz.jsx'
import TakeQuiz from './components/TakeQuiz.jsx'
import { loadQuizzes, saveQuizzes, createQuizId } from './data/quizStorage.js'
import './App.css'

function App() {
  const [quizzes, setQuizzes] = useState(() => loadQuizzes())
  const [view, setView] = useState('home')
  const [activeQuizId, setActiveQuizId] = useState(null)

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

  const activeQuiz = quizzes.find((q) => q.id === activeQuizId)

  return (
    <section id="center">
      {view === 'home' && (
        <Home quizzes={quizzes} onSelectQuiz={handleSelectQuiz} onCreateNew={() => setView('create')} />
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
