function QuizCard({ quiz, onSelect, showCreator }) {
  return (
    <button type="button" className="quiz-card" onClick={() => onSelect(quiz.id)}>
      <div className="quiz-card-main">
        <h3>{quiz.title}</h3>
        {quiz.description && <p className="quiz-card-desc">{quiz.description}</p>}
      </div>
      <div className="quiz-card-meta">
        {showCreator && quiz.ownerUsername && (
          <span className="quiz-card-creator">by {quiz.ownerUsername}</span>
        )}
        <span>
          {quiz.questions.length} question{quiz.questions.length === 1 ? '' : 's'}
        </span>
      </div>
    </button>
  )
}

export default QuizCard
