-- IrisLearn Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists pgcrypto;

-- Public profile per authenticated user, keyed to auth.users
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles (id) on delete cascade,
  title text not null,
  description text,
  published_at timestamptz not null default now()
);

create type question_type as enum ('multiple-choice', 'short-answer', 'multiselect');

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes (id) on delete cascade,
  position int not null,
  type question_type not null,
  text text not null,
  options jsonb,
  correct_index int,
  correct_indexes int[],
  scoring_mode text check (scoring_mode in ('all-or-nothing', 'partial')),
  answer text,
  constraint question_shape check (
    (type = 'multiple-choice' and options is not null and correct_index is not null
      and answer is null and correct_indexes is null and scoring_mode is null)
    or
    (type = 'short-answer' and answer is not null and options is null
      and correct_index is null and correct_indexes is null and scoring_mode is null)
    or
    (type = 'multiselect' and options is not null and correct_indexes is not null
      and array_length(correct_indexes, 1) > 0 and scoring_mode is not null
      and answer is null and correct_index is null)
  )
);
create index if not exists questions_quiz_id_position_idx on questions (quiz_id, position);

-- Auto-create a profile row whenever a new auth user signs up.
-- Username is passed in via `options.data.username` on signUp().
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data ->> 'username');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Row Level Security
alter table profiles enable row level security;
alter table quizzes enable row level security;
alter table questions enable row level security;

create policy "profiles are publicly readable" on profiles
  for select using (true);
create policy "users manage their own profile" on profiles
  for update using (id = auth.uid());

create policy "quizzes are publicly readable" on quizzes
  for select using (true);
create policy "owners manage their quizzes" on quizzes
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "questions are publicly readable" on questions
  for select using (true);
create policy "owners manage their questions" on questions
  for all using (
    exists (select 1 from quizzes q where q.id = quiz_id and q.owner_id = auth.uid())
  )
  with check (
    exists (select 1 from quizzes q where q.id = quiz_id and q.owner_id = auth.uid())
  );
