import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const hotfix=await readFile(new URL('../../supabase/migrations/20260921_cancel_participation_ambiguity_fix.sql',import.meta.url),'utf8');

for(const required of [
  'create or replace function public.cancel_participation',
  'update public.matches m',
  'greatest(m.joined_count - 1, 0)',
  "when m.status = 'full' and m.starts_at > now() then 'open'",
  'where m.id = p_match_id',
  'returning m.remaining_spots into v_remaining',
  'grant execute on function public.cancel_participation(uuid) to authenticated'
])assert.ok(hotfix.includes(required),`missing cancel hotfix contract: ${required}`);

assert.ok(!hotfix.includes('returning remaining_spots into v_remaining'),'unqualified remaining_spots must not return');
assert.ok(!hotfix.includes('service_role'),'service-role credentials must not be embedded');

console.log('PASS beta Must cancel-participation ambiguity hotfix contract');
