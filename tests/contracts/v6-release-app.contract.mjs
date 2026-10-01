import assert from 'node:assert/strict';
import fs from 'node:fs';
import {migrateSession} from '../../src/v4/platform/domain/contracts.js';

const read=path=>fs.readFileSync(new URL(`../../${path}`,import.meta.url),'utf8');
const release=read('src/v6/release-app.js');
const styles=read('src/v6/release-app.css');
const bootstrap=read('src/v4/platform/presentation/bootstrap.js');

assert.match(bootstrap,/\.\.\/\.\.\/\.\.\/v6\/release-app\.js/,'release app layer must boot with the product');
assert.match(release,/RELEASE_APP_VERSION='6\.0\.0'/,'release app version marker missing');
assert.match(release,/current\.route!==['"]schedule['"]/,'legacy Schedule route migration missing');
assert.equal(migrateSession({schemaVersion:2,route:'schedule'}).state.route,'profile','Schedule must migrate into MY');
assert.match(release,/무료로 참가 확정/,'release join must not present a simulated PG checkout');
assert.match(release,/paymentMethod:'none'/,'free join must persist a non-payment participation snapshot');
assert.match(release,/data-v6-lifecycle/,'state-aware Home contract missing');
assert.match(release,/data-v6-return/,'postgame ownership must live in MY');
assert.match(styles,/one canonical MY ownership/i,'release visual ownership marker missing');
assert.match(styles,/\[data-screen="detail"\] \.fm-next-detail-section/,'desktop Detail flattening missing');
assert.match(styles,/\[data-screen="profile"\] \.fm-next-profile-card/,'desktop MY flattening missing');
assert.match(styles,/\[data-v6-hidden-payment="true"\]/,'legacy payment surface must be hidden');
assert.doesNotMatch(release,/Supabase Connected|connected-beta|createSupabaseBetaClient/,'/app must not pretend the separate connected beta backend has been merged');

console.log('PASS v6 release app IA, join, MY ownership and provider-boundary contract');
