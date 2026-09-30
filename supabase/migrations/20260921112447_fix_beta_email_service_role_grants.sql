begin;

-- The transactional notification Edge Function uses ctx.supabaseAdmin (service_role)
-- to read the email outbox, resolve match/operator context, and persist delivery state.
grant select on table public.operators to service_role;
grant select on table public.matches to service_role;
grant select, update on table public.beta_notifications to service_role;

commit;
