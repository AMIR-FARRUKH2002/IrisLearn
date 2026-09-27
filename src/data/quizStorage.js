import { supabase } from './supabaseClient.js'

function mapQuizRow(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    publishedAt: new Date(row.published_at).getTime(),
    ownerId: row.owner_id,
    ownerUsername: row.profiles?.username ?? null,
    questions: (row.questions ?? []).map((q) => ({
      id: q.id,
      type: q.type,
      text: q.text,
      ...(q.type === 'short-answer'
        ? { answer: q.answer }
        : { options: q.options, correctIndex: q.correct_index }),
    })),
  }
}

export async function loadQuizzes() {
  const { data, error } = await supabase
    .from('quizzes')
    .select(
      'id, title, description, published_at, owner_id, profiles(username), questions(id, position, type, text, options, correct_index, answer)',
    )
    .order('published_at', { ascending: false })
    .order('position', { foreignTable: 'questions', ascending: true })
  if (error) throw new Error(error.message)
  return data.map(mapQuizRow)
}

export async function publishQuiz({ title, description, questions }) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be logged in to publish a quiz.')

  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .insert({ title, description, owner_id: user.id })
    .select()
    .single()
  if (quizError) throw new Error(quizError.message)

  const questionRows = questions.map((q, index) => ({
    quiz_id: quiz.id,
    position: index,
    type: q.type,
    text: q.text,
    options: q.type === 'multiple-choice' ? q.options : null,
    correct_index: q.type === 'multiple-choice' ? q.correctIndex : null,
    answer: q.type === 'short-answer' ? q.answer : null,
  }))

  const { error: questionsError } = await supabase.from('questions').insert(questionRows)
  if (questionsError) throw new Error(questionsError.message)

  return loadQuizzes()
}
