import { useMemo, useState } from 'react'
import QuizCard from './QuizCard.jsx'

function Home({ quizzes, onSelectQuiz, onCreateNew, currentUserId }) {
  const [scope, setScope] = useState('community')
  const [search, setSearch] = useState('')

  const scopedQuizzes = useMemo(
    () => (scope === 'mine' ? quizzes.filter((q) => q.ownerId === currentUserId) : quizzes),
    [quizzes, scope, currentUserId],
  )

  const filteredQuizzes = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return scopedQuizzes
    return scopedQuizzes.filter(
      (quiz) =>
        quiz.title.toLowerCase().includes(query) ||
        (quiz.description || '').toLowerCase().includes(query),
    )
  }, [scopedQuizzes, search])

  return (
    <section className="home">
      <div className="home-header">
        <div>
          <h1>Practice Learning Modules</h1>
          <p>Browse quizzes published by the community, or create your own.</p>
        </div>
      </div>

      <div className="auth-tabs">
        <button
          type="button"
          className={scope === 'community' ? 'auth-tab active' : 'auth-tab'}
          onClick={() => setScope('community')}
        >
          Community Contributed Quizzes
        </button>
        <button
          type="button"
          className={scope === 'mine' ? 'auth-tab active' : 'auth-tab'}
          onClick={() => setScope('mine')}
        >
          My Quizzes
        </button>
      </div>

      <div className="home-toolbar">
        <input
          type="search"
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search quizzes..."
          aria-label="Search quizzes"
        />
        <button type="button" className="btn-primary" onClick={onCreateNew}>
          + Create Quiz
        </button>
      </div>

      {scopedQuizzes.length === 0 ? (
        <div className="empty-state">
          <p>
            {scope === 'mine'
              ? "You haven't published any quizzes yet."
              : 'No quizzes published yet. Be the first to create one!'}
          </p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="empty-state">
          <p>No quizzes match your search.</p>
        </div>
      ) : (
        <div className="quiz-grid">
          {filteredQuizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} onSelect={onSelectQuiz} />
          ))}
        </div>
      )}
    </section>
  )
}

export default Home
