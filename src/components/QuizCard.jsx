function QuizCard({ quiz, onSelect, showCreator, isOwner, onEdit, onDelete }) {
  return (
    <div className="quiz-card">
      <button type="button" className="quiz-card-body" onClick={() => onSelect(quiz.id)}>
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
      {isOwner && (
        <div className="quiz-card-actions">
          <button
            type="button"
            className="btn-link"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(quiz.id)
            }}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn-link quiz-card-delete"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(quiz.id)
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default QuizCard
