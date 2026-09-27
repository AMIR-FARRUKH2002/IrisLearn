-- Adds the "multiselect" question type (select-all-that-apply, with all-or-nothing
-- or partial-credit scoring) to an EXISTING IrisLearn database.
-- Run this against a database that already has the tables from schema.sql.
--
-- IMPORTANT: run Step 1 by itself first (select it and click Run), then run Step 2
-- separately. Postgres won't let a new enum value be used in the same transaction
-- it was added in, so combining these into one script/run will fail.

-- Step 1: add the new enum value.
alter type question_type add value if not exists 'multiselect';

-- Step 2: add the new columns and update the shape constraint (run after Step 1 commits).
alter table questions add column if not exists correct_indexes int[];
alter table questions add column if not exists scoring_mode text
  check (scoring_mode in ('all-or-nothing', 'partial'));

alter table questions drop constraint if exists question_shape;
alter table questions add constraint question_shape check (
  (type = 'multiple-choice' and options is not null and correct_index is not null
    and answer is null and correct_indexes is null and scoring_mode is null)
  or
  (type = 'short-answer' and answer is not null and options is null
    and correct_index is null and correct_indexes is null and scoring_mode is null)
  or
  (type = 'multiselect' and options is not null and correct_indexes is not null
    and array_length(correct_indexes, 1) > 0 and scoring_mode is not null
    and answer is null and correct_index is null)
);
