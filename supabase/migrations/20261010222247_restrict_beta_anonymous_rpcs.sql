begin;

-- Supabase lint 0028: browser-unauthenticated clients have no need to
-- EXECUTE SECURITY DEFINER mutations, even though their bodies also enforce
-- auth.uid() IS NOT NULL. Explicit grants preserve existing Beta user flows.
revoke execute on function public.join_beta_waitlist(uuid, text) from public, anon;
revoke execute on function public.cancel_beta_waitlist(uuid) from public, anon;
revoke execute on function public.submit_beta_match_feedback(uuid, integer, integer, boolean, text) from public, anon;

grant execute on function public.join_beta_waitlist(uuid, text) to authenticated, service_role;
grant execute on function public.cancel_beta_waitlist(uuid) to authenticated, service_role;
grant execute on function public.submit_beta_match_feedback(uuid, integer, integer, boolean, text) to authenticated, service_role;

commit;
