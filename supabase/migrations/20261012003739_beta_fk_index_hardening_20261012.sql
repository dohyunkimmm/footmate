-- Applied to Supabase beta as migration 20261012003739.
-- Cover foreign keys used by match lifecycle and user waitlist cleanup.
-- Both tables had zero records when this additive migration was applied.
create index if not exists beta_match_feedback_match_idx
  on public.beta_match_feedback (match_id);

create index if not exists beta_waitlist_user_idx
  on public.beta_waitlist (user_id);
