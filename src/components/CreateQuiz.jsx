import { useState } from 'react'

const emptyQuestion = () => ({
  id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  text: '',
  options: ['', ''],
  correctIndex: 0,
})

function CreateQuiz({ onPublish, onCancel }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState([emptyQuestion()])
  const [error, setError] = useState('')

  function updateQuestion(id, changes) {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...changes } : q)))
  }

  function updateOption(qId, index, value) {
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.id !== qId) return q
        const options = [...q.options]
        options[index] = value
        return { ...q, options }
      }),
    )
  }

  function addOption(qId) {
    setQuestions((qs) =>
      qs.map((q) => (q.id === qId ? { ...q, options: [...q.options, ''] } : q)),
    )
  }

  function removeOption(qId, index) {
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.id !== qId) return q
        const options = q.options.filter((_, i) => i !== index)
        const correctIndex = q.correctIndex >= options.length ? 0 : q.correctIndex
        return { ...q, options, correctIndex }
      }),
    )
  }

  function addQuestion() {
    setQuestions((qs) => [...qs, emptyQuestion()])
  }

  function removeQuestion(id) {
    setQuestions((qs) => qs.filter((q) => q.id !== id))
  }

  function validate() {
    if (!title.trim()) return 'Please enter a quiz title.'
    if (questions.length === 0) return 'Add at least one question.'
    for (const q of questions) {
      if (!q.text.trim()) return 'Every question needs question text.'
      const filledOptions = q.options.filter((o) => o.trim())
      if (filledOptions.length < 2) return 'Every question needs at least two options.'
      if (!q.options[q.correctIndex] || !q.options[q.correctIndex].trim()) {
        return 'Select a valid correct answer for every question.'
      }
    }
    return ''
  }

  function handlePublish() {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    onPublish({
      title: title.trim(),
      description: description.trim(),
      questions: questions.map((q) => ({
        ...q,
        text: q.text.trim(),
        options: q.options.map((o) => o.trim()),
      })),
    })
  }

  return (
    <section className="create-quiz">
      <div className="home-header">
        <h1>Create a Quiz</h1>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <label className="field">
        <span>Quiz title</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. JavaScript Basics"
        />
      </label>

      <label className="field">
        <span>Description (optional)</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What will learners practice?"
          rows={2}
        />
      </label>

      <div className="questions-list">
        {questions.map((q, qIndex) => (
          <div className="question-card" key={q.id}>
            <div className="question-card-header">
              <h3>Question {qIndex + 1}</h3>
              {questions.length > 1 && (
                <button type="button" className="btn-link" onClick={() => removeQuestion(q.id)}>
                  Remove
                </button>
              )}
            </div>

            <label className="field">
              <span>Question text</span>
              <input
                type="text"
                value={q.text}
                onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                placeholder="Enter the question"
              />
            </label>

            <div className="options-list">
              {q.options.map((option, oIndex) => (
                <div className="option-row" key={oIndex}>
                  <input
                    type="radio"
                    name={`correct-${q.id}`}
                    checked={q.correctIndex === oIndex}
                    onChange={() => updateQuestion(q.id, { correctIndex: oIndex })}
                    title="Mark as correct answer"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(q.id, oIndex, e.target.value)}
                    placeholder={`Option ${oIndex + 1}`}
                  />
                  {q.options.length > 2 && (
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() => removeOption(q.id, oIndex)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn-secondary" onClick={() => addOption(q.id)}>
                + Add option
              </button>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn-secondary" onClick={addQuestion}>
        + Add question
      </button>

      {error && <p className="error-text">{error}</p>}

      <div className="create-quiz-actions">
        <button type="button" className="btn-primary" onClick={handlePublish}>
          Publish Quiz
        </button>
      </div>
    </section>
  )
}

export default CreateQuiz
