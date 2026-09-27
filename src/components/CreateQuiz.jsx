import { useState } from 'react'

const emptyQuestion = (type = 'multiple-choice') => ({
  id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  type,
  text: '',
  options: ['', ''],
  correctIndex: 0,
  correctIndexes: [],
  scoringMode: 'all-or-nothing',
  answer: '',
})

function CreateQuiz({ onPublish, onCancel, initialQuiz }) {
  const isEditing = Boolean(initialQuiz)
  const [title, setTitle] = useState(initialQuiz?.title ?? '')
  const [description, setDescription] = useState(initialQuiz?.description ?? '')
  const [questions, setQuestions] = useState(() =>
    initialQuiz
      ? initialQuiz.questions.map((q) => ({
          id: q.id,
          type: q.type,
          text: q.text,
          options: q.type === 'short-answer' ? ['', ''] : q.options,
          correctIndex: q.type === 'multiple-choice' ? q.correctIndex : 0,
          correctIndexes: q.type === 'multiselect' ? q.correctIndexes : [],
          scoringMode: q.type === 'multiselect' ? q.scoringMode : 'all-or-nothing',
          answer: q.type === 'short-answer' ? q.answer : '',
        }))
      : [emptyQuestion()],
  )
  const [error, setError] = useState('')
  const [publishing, setPublishing] = useState(false)

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
        if (q.type === 'multiselect') {
          const correctIndexes = q.correctIndexes
            .filter((i) => i !== index)
            .map((i) => (i > index ? i - 1 : i))
          return { ...q, options, correctIndexes }
        }
        const correctIndex = q.correctIndex >= options.length ? 0 : q.correctIndex
        return { ...q, options, correctIndex }
      }),
    )
  }

  function toggleCorrectOption(qId, index) {
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.id !== qId) return q
        const correctIndexes = q.correctIndexes.includes(index)
          ? q.correctIndexes.filter((i) => i !== index)
          : [...q.correctIndexes, index]
        return { ...q, correctIndexes }
      }),
    )
  }

  function addQuestion() {
    setQuestions((qs) => [...qs, emptyQuestion()])
  }

  function removeQuestion(id) {
    setQuestions((qs) => qs.filter((q) => q.id !== id))
  }

  function changeQuestionType(id, type) {
    setQuestions((qs) =>
      qs.map((q) => (q.id === id ? { ...emptyQuestion(type), id: q.id, text: q.text } : q)),
    )
  }

  function validate() {
    if (!title.trim()) return 'Please enter a quiz title.'
    if (questions.length === 0) return 'Add at least one question.'
    for (const q of questions) {
      if (!q.text.trim()) return 'Every question needs question text.'
      if (q.type === 'short-answer') {
        if (!q.answer.trim()) return 'Every short answer question needs a correct answer.'
      } else if (q.type === 'multiselect') {
        const filledOptions = q.options.filter((o) => o.trim())
        if (filledOptions.length < 2) return 'Every question needs at least two options.'
        if (q.correctIndexes.length === 0) {
          return 'Select at least one correct answer for every multi-select question.'
        }
        if (q.correctIndexes.some((i) => !q.options[i] || !q.options[i].trim())) {
          return 'Correct answers must have option text filled in.'
        }
      } else {
        const filledOptions = q.options.filter((o) => o.trim())
        if (filledOptions.length < 2) return 'Every question needs at least two options.'
        if (!q.options[q.correctIndex] || !q.options[q.correctIndex].trim()) {
          return 'Select a valid correct answer for every question.'
        }
      }
    }
    return ''
  }

  async function handlePublish() {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setPublishing(true)
    try {
      await onPublish({
        title: title.trim(),
        description: description.trim(),
        questions: questions.map((q) => {
          if (q.type === 'short-answer') {
            return { id: q.id, type: q.type, text: q.text.trim(), answer: q.answer.trim() }
          }
          if (q.type === 'multiselect') {
            return {
              id: q.id,
              type: q.type,
              text: q.text.trim(),
              options: q.options.map((o) => o.trim()),
              correctIndexes: q.correctIndexes,
              scoringMode: q.scoringMode,
            }
          }
          return {
            id: q.id,
            type: q.type,
            text: q.text.trim(),
            options: q.options.map((o) => o.trim()),
            correctIndex: q.correctIndex,
          }
        }),
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setPublishing(false)
    }
  }

  return (
    <section className="create-quiz">
      <div className="home-header">
        <h1>{isEditing ? 'Edit Quiz' : 'Create a Quiz'}</h1>
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
              <span>Question type</span>
              <select
                value={q.type}
                onChange={(e) => changeQuestionType(q.id, e.target.value)}
              >
                <option value="multiple-choice">Multiple choice (single answer)</option>
                <option value="multiselect">Multiple choice (select all that apply)</option>
                <option value="short-answer">Written text entry (short)</option>
              </select>
            </label>

            <label className="field">
              <span>Question text</span>
              <input
                type="text"
                value={q.text}
                onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                placeholder="Enter the question"
              />
            </label>

            {q.type === 'short-answer' ? (
              <label className="field">
                <span>Correct answer</span>
                <input
                  type="text"
                  value={q.answer}
                  onChange={(e) => updateQuestion(q.id, { answer: e.target.value })}
                  placeholder="Enter the expected answer"
                />
              </label>
            ) : q.type === 'multiselect' ? (
              <>
                <div className="options-list">
                  {q.options.map((option, oIndex) => (
                    <div className="option-row" key={oIndex}>
                      <input
                        type="checkbox"
                        checked={q.correctIndexes.includes(oIndex)}
                        onChange={() => toggleCorrectOption(q.id, oIndex)}
                        title="Mark as a correct answer"
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

                <label className="field">
                  <span>Scoring</span>
                  <select
                    value={q.scoringMode}
                    onChange={(e) => updateQuestion(q.id, { scoringMode: e.target.value })}
                  >
                    <option value="all-or-nothing">
                      All or nothing (every correct answer must be selected)
                    </option>
                    <option value="partial">Partial credit (points for each correct selection)</option>
                  </select>
                </label>
              </>
            ) : (
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
            )}
          </div>
        ))}
      </div>

      <button type="button" className="btn-secondary" onClick={addQuestion}>
        + Add question
      </button>

      {error && <p className="error-text">{error}</p>}

      <div className="create-quiz-actions">
        <button type="button" className="btn-primary" onClick={handlePublish} disabled={publishing}>
          {publishing ? (isEditing ? 'Saving...' : 'Publishing...') : isEditing ? 'Save Changes' : 'Publish Quiz'}
        </button>
      </div>
    </section>
  )
}

export default CreateQuiz
