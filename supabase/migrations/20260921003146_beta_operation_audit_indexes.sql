begin;

create index if not exists beta_operation_events_actor_idx
  on public.beta_operation_events(actor_id)
  where actor_id is not null;

create index if not exists beta_operation_events_subject_user_idx
  on public.beta_operation_events(subject_user_id)
  where subject_user_id is not null;

create index if not exists beta_operation_events_participation_idx
  on public.beta_operation_events(participation_id)
  where participation_id is not null;

commit;
