import QuizCard from './QuizCard.jsx'

function Home({ quizzes, onSelectQuiz, onCreateNew, currentUser, onLogout }) {
  return (
    <section className="home">
      <div className="home-header">
        <div>
          <h1>Practice Learning Modules</h1>
          <p>Browse quizzes published by the community, or create your own.</p>
        </div>
        <div className="home-header-actions">
          {currentUser && (
            <span className="current-user">
              Signed in as <strong>{currentUser}</strong>
            </span>
          )}
          <button type="button" className="btn-primary" onClick={onCreateNew}>
            + Create Quiz
          </button>
          {onLogout && (
            <button type="button" className="btn-secondary" onClick={onLogout}>
              Log Out
            </button>
          )}
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="empty-state">
          <p>No quizzes published yet. Be the first to create one!</p>
        </div>
      ) : (
        <div className="quiz-grid">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} onSelect={onSelectQuiz} />
          ))}
        </div>
      )}
    </section>
  )
}

export default Home
