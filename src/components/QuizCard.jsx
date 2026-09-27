function QuizCard({ quiz, onSelect }) {
  return (
    <button type="button" className="quiz-card" onClick={() => onSelect(quiz.id)}>
      <h3>{quiz.title}</h3>
      {quiz.description && <p className="quiz-card-desc">{quiz.description}</p>}
      <span className="quiz-card-meta">
        {quiz.questions.length} question{quiz.questions.length === 1 ? '' : 's'}
      </span>
    </button>
  )
}

export default QuizCard
