begin;

create index if not exists beta_notifications_participation_idx
  on public.beta_notifications(participation_id)
  where participation_id is not null;

commit;
