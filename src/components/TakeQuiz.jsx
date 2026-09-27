import { useState } from 'react'

function TakeQuiz({ quiz, onBack }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  function selectAnswer(questionId, optionIndex) {
    if (submitted) return
    setAnswers((a) => ({ ...a, [questionId]: optionIndex }))
  }

  function enterAnswer(questionId, value) {
    if (submitted) return
    setAnswers((a) => ({ ...a, [questionId]: value }))
  }

  function isCorrectAnswer(q) {
    if (q.type === 'short-answer') {
      const given = (answers[q.id] || '').trim().toLowerCase()
      return given !== '' && given === q.answer.trim().toLowerCase()
    }
    return answers[q.id] === q.correctIndex
  }

  const score = quiz.questions.reduce(
    (total, q) => (isCorrectAnswer(q) ? total + 1 : total),
    0,
  )

  const allAnswered = quiz.questions.every((q) => {
    const a = answers[q.id]
    return q.type === 'short-answer' ? Boolean(a && a.trim()) : a !== undefined
  })

  return (
    <section className="take-quiz">
      <div className="home-header">
        <div>
          <h1>{quiz.title}</h1>
          {quiz.description && <p>{quiz.description}</p>}
        </div>
        <button type="button" className="btn-secondary" onClick={onBack}>
          Back to Home
        </button>
      </div>

      <div className="questions-list">
        {quiz.questions.map((q, qIndex) => (
          <div className="question-card" key={q.id}>
            <h3>
              {qIndex + 1}. {q.text}
            </h3>
            {q.type === 'short-answer' ? (
              <input
                type="text"
                className="short-answer-input"
                value={answers[q.id] || ''}
                onChange={(e) => enterAnswer(q.id, e.target.value)}
                disabled={submitted}
                placeholder="Type your answer"
              />
            ) : (
              <div className="options-list">
                {q.options.map((option, oIndex) => {
                  const isSelected = answers[q.id] === oIndex
                  const isCorrect = oIndex === q.correctIndex
                  let optionClass = 'option-choice'
                  if (submitted && isSelected) {
                    optionClass += isCorrect ? ' correct' : ' incorrect'
                  } else if (submitted && isCorrect) {
                    optionClass += ' correct'
                  } else if (isSelected) {
                    optionClass += ' selected'
                  }
                  return (
                    <button
                      type="button"
                      key={oIndex}
                      className={optionClass}
                      onClick={() => selectAnswer(q.id, oIndex)}
                      disabled={submitted}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            )}
            {submitted && q.type === 'short-answer' && (
              <p className={isCorrectAnswer(q) ? 'correct-text' : 'incorrect-text'}>
                Correct answer: {q.answer}
              </p>
            )}
          </div>
        ))}
      </div>

      {!submitted ? (
        <div className="create-quiz-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => setSubmitted(true)}
            disabled={!allAnswered}
          >
            Submit Answers
          </button>
        </div>
      ) : (
        <p className="quiz-score">
          You scored {score} / {quiz.questions.length}
        </p>
      )}
    </section>
  )
}

export default TakeQuiz
