import { useState } from 'react'

function TakeQuiz({ quiz, onBack }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  function selectAnswer(questionId, optionIndex) {
    if (submitted) return
    setAnswers((a) => ({ ...a, [questionId]: optionIndex }))
  }

  function toggleMultiselectAnswer(questionId, optionIndex) {
    if (submitted) return
    setAnswers((a) => {
      const current = a[questionId] || []
      const next = current.includes(optionIndex)
        ? current.filter((i) => i !== optionIndex)
        : [...current, optionIndex]
      return { ...a, [questionId]: next }
    })
  }

  function enterAnswer(questionId, value) {
    if (submitted) return
    setAnswers((a) => ({ ...a, [questionId]: value }))
  }

  function scoreForQuestion(q) {
    const given = answers[q.id]
    if (q.type === 'short-answer') {
      const trimmed = (given || '').trim().toLowerCase()
      return trimmed !== '' && trimmed === q.answer.trim().toLowerCase() ? 1 : 0
    }
    if (q.type === 'multiselect') {
      const selected = given || []
      const correctSet = new Set(q.correctIndexes)
      const selectedSet = new Set(selected)
      if (q.scoringMode === 'all-or-nothing') {
        if (selectedSet.size !== correctSet.size) return 0
        for (const i of selectedSet) if (!correctSet.has(i)) return 0
        return 1
      }
      let correctSelected = 0
      let incorrectSelected = 0
      for (const i of selectedSet) {
        if (correctSet.has(i)) correctSelected += 1
        else incorrectSelected += 1
      }
      return Math.max(0, (correctSelected - incorrectSelected) / correctSet.size)
    }
    return given === q.correctIndex ? 1 : 0
  }

  function isCorrectAnswer(q) {
    return scoreForQuestion(q) >= 1
  }

  const rawScore = quiz.questions.reduce((total, q) => total + scoreForQuestion(q), 0)
  const score = Math.round(rawScore * 100) / 100

  const allAnswered = quiz.questions.every((q) => {
    const a = answers[q.id]
    if (q.type === 'short-answer') return Boolean(a && a.trim())
    if (q.type === 'multiselect') return Array.isArray(a) && a.length > 0
    return a !== undefined
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
            ) : q.type === 'multiselect' ? (
              <div className="options-list">
                {q.options.map((option, oIndex) => {
                  const isSelected = (answers[q.id] || []).includes(oIndex)
                  const isCorrectOption = q.correctIndexes.includes(oIndex)
                  let optionClass = 'option-choice'
                  if (submitted && isSelected) {
                    optionClass += isCorrectOption ? ' correct' : ' incorrect'
                  } else if (submitted && isCorrectOption) {
                    optionClass += ' missed'
                  } else if (isSelected) {
                    optionClass += ' selected'
                  }
                  return (
                    <button
                      type="button"
                      key={oIndex}
                      className={optionClass}
                      onClick={() => toggleMultiselectAnswer(q.id, oIndex)}
                      disabled={submitted}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
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
            {submitted && q.type === 'multiselect' && (
              <p className={isCorrectAnswer(q) ? 'correct-text' : 'incorrect-text'}>
                {q.scoringMode === 'partial' && `Score: ${scoreForQuestion(q).toFixed(2)} of 1 — `}
                Correct answer{q.correctIndexes.length === 1 ? '' : 's'}:{' '}
                {q.correctIndexes.map((i) => q.options[i]).join(', ')}
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
