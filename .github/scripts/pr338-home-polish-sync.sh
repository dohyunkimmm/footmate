#!/usr/bin/env bash
set -euo pipefail

git fetch origin main
git checkout origin/main -- src/v4/platform/presentation/release-candidate.js

python - <<'PY'
from pathlib import Path

app = Path('src/v4/app.js')
text = app.read_text()
old = '''    ${topbar({actionHtml:`<button type="button" class="fm-next-icon-button" data-action="nav-profile" aria-label="내 정보">${icon('user')}</button>`})}
    <div class="fm-next-greeting"><small>${returnUser?'다시 반가워요':'설정이 완료됐어요'}</small><h1>${state.userName||'도현'}님, <span>오늘 경기 어때요?</span></h1></div>'''
new = '''    ${topbar({actionHtml:'<span style="width:44px" aria-hidden="true"></span>'})}'''
if old not in text:
    raise SystemExit('homeView source block not found')
app.write_text(text.replace(old, new, 1))

ai = Path('src/v5/ai-match-assistant.js')
text = ai.read_text()
old_title = "setText(title,'AI에게 원하는 경기를 말해보세요.');"
if old_title not in text:
    raise SystemExit('Home AI title source not found')
text = text.replace(old_title, "setText(title,'AI에게 원하는 경기를 검색해보세요.');", 1)
old_greeting = """  const greeting=screen.querySelector('.fm-next-greeting');
  text(greeting?.querySelector('small'),'AI MATCH ASSISTANT');
  text(greeting?.querySelector('h1'),'오늘, 어떤 경기에서 뛸까요?');
"""
if old_greeting not in text:
    raise SystemExit('Home greeting orchestration block not found')
ai.write_text(text.replace(old_greeting, '', 1))

html = Path('app.html')
text = html.read_text()
old_conditions = '.fm-ai-conditions{display:flex!important;gap:5px;margin-top:7px}'
new_conditions = '.fm-ai-conditions{display:flex!important;flex-wrap:nowrap!important;gap:3px;margin-top:7px;white-space:nowrap;overflow:hidden}'
if old_conditions not in text:
    raise SystemExit('Home connected AI conditions rule not found')
text = text.replace(old_conditions, new_conditions, 1)
old_chip = '.fm-ai-conditions span{padding:5px 7px;border:1px solid rgba(20,61,45,.09);background:#f1f5f2;color:#455b51;font-size:10px}</style>'
new_chip = '.fm-ai-conditions span{flex:0 0 auto;min-width:0;padding:4px 5px;border:1px solid rgba(20,61,45,.09);background:#f1f5f2;color:#455b51;font-size:9px;letter-spacing:-.04em}@media(max-width:359px){.fm-next-page[data-mode="real"] [data-screen="home"] .fm-ai-card[data-ia-role="primary-assistant"][data-ai-state="result"]:has(.fm-ai-mode[data-mode="connected-ai"]) .fm-ai-conditions{gap:2px}.fm-next-page[data-mode="real"] [data-screen="home"] .fm-ai-card[data-ia-role="primary-assistant"][data-ai-state="result"]:has(.fm-ai-mode[data-mode="connected-ai"]) .fm-ai-conditions span{padding:3px 4px;font-size:8px}.fm-next-page[data-mode="real"] [data-screen="home"] .fm-ai-card[data-ia-role="primary-assistant"][data-ai-state="result"]:has(.fm-ai-mode[data-mode="connected-ai"]) .fm-ai-conditions:has(>span:nth-child(6))>span:nth-child(3){display:none}}</style>'
if old_chip not in text:
    raise SystemExit('Home connected AI chip rule not found')
text = text.replace(old_chip, new_chip, 1)
text = text.replace("set(title,'AI에게 원하는 경기를 말해보세요.');", "set(title,'AI에게 원하는 경기를 검색해보세요.');")
text = text.replace("set(title,'원하는 경기를 말해보세요.');", "set(title,'AI에게 원하는 경기를 검색해보세요.');")
html.write_text(text)

spec = Path('tests/e2e/v5.1-ai-assistant.spec.cjs')
text = spec.read_text()
marker = "test('Home AI search hierarchy keeps connected constraints on one row'"
if marker not in text:
    text += r'''

test('Home AI search hierarchy keeps connected constraints on one row',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await setup(page);
  await expect(page.locator('[data-screen="home"] .fm-next-greeting')).toHaveCount(0);
  await expect(page.locator('[data-screen="home"]>.fm-next-topbar [data-action="nav-profile"]')).toHaveCount(0);
  await expect(page.locator('[data-screen="home"] .fm-ai-head strong')).toHaveText('AI에게 원하는 경기를 검색해보세요.');
  await page.evaluate(()=>localStorage.setItem('footmate:v5.1:ai',JSON.stringify({version:'5.1.1',mode:'connected-ai',result:{intent:'search',region:'수원 · 영통',position:'MF',level:'중급',maxPrice:20000,maxDistanceMin:20,afterTime:'08:00',reply:'수원 · 영통에서 조건에 맞는 중급 MF 경기를 찾습니다.'}})));
  await page.goto('/app?resume=1',{waitUntil:'domcontentloaded'});
  const chips=page.locator('[data-screen="home"] [data-ai-conditions] span');
  await expect(chips).toHaveCount(6);
  const geometry=await chips.evaluateAll(nodes=>({tops:nodes.map(node=>Math.round(node.getBoundingClientRect().top)),last:nodes.at(-1).getBoundingClientRect().right,container:nodes[0].parentElement.getBoundingClientRect().right}));
  expect(new Set(geometry.tops).size).toBe(1);
  expect(geometry.last).toBeLessThanOrEqual(geometry.container+1);

  await page.setViewportSize({width:320,height:844});
  await page.reload({waitUntil:'domcontentloaded'});
  const compact=page.locator('[data-screen="home"] [data-ai-conditions] span:visible');
  await expect(compact).toHaveCount(5);
  const compactGeometry=await compact.evaluateAll(nodes=>({tops:nodes.map(node=>Math.round(node.getBoundingClientRect().top)),last:nodes.at(-1).getBoundingClientRect().right,container:nodes[0].parentElement.getBoundingClientRect().right}));
  expect(new Set(compactGeometry.tops).size).toBe(1);
  expect(compactGeometry.last).toBeLessThanOrEqual(compactGeometry.container+1);
});
'''
    spec.write_text(text)

release = Path('tests/e2e/v5.1-release-flow-review.spec.cjs')
text = release.read_text()
old_copy = "card.getByText('AI에게 원하는 경기를 말해보세요.',{exact:true})"
new_copy = "card.getByText('AI에게 원하는 경기를 검색해보세요.',{exact:true})"
if old_copy not in text:
    raise SystemExit('release-flow Home AI copy assertion not found')
release.write_text(text.replace(old_copy, new_copy, 1))

visual = Path('tests/e2e/v5.1-visual-system-completion.spec.cjs')
text = visual.read_text()
old_scroll = """    await screen.evaluate(element=>element.scrollTo({top:element.scrollHeight,behavior:'instant'}));
    await expect.poll(()=>screen.evaluate(element=>element.scrollTop)).toBeGreaterThan(0);
    const last=screen.locator('.fm-next-match-card').last();
"""
new_scroll = """    if(metrics.scrollHeight>metrics.clientHeight){
      await screen.evaluate(element=>element.scrollTo({top:element.scrollHeight,behavior:'instant'}));
      await expect.poll(()=>screen.evaluate(element=>element.scrollTop)).toBeGreaterThan(0);
    }
    const last=screen.locator('.fm-next-match-card').last();
"""
if old_scroll not in text:
    raise SystemExit('responsive scroll contract block not found')
visual.write_text(text.replace(old_scroll, new_scroll, 1))
PY

git diff --check
if git diff --quiet; then
  echo 'No source changes needed.'
  exit 0
fi

PLAYWRIGHT_VERSION="$(node -p "require('./package.json').qaToolchain.playwright")"
AXE_VERSION="$(node -p "require('./package.json').qaToolchain.axeCorePlaywright")"
npm install --no-save --ignore-scripts "@playwright/test@$PLAYWRIGHT_VERSION" "@axe-core/playwright@$AXE_VERSION"
npx playwright install --with-deps chromium

npx playwright test --project=chromium \
  tests/e2e/v5.1-visual-baseline.spec.cjs \
  tests/e2e/v5.1-visual-system-completion.spec.cjs \
  tests/e2e/v5.1-release-flow-review.spec.cjs \
  --update-snapshots

npx playwright test --project=chromium tests/e2e/v5.1-ai-assistant.spec.cjs

git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git add src/v4/app.js src/v4/platform/presentation/release-candidate.js src/v5/ai-match-assistant.js app.html tests/e2e/v5.1-ai-assistant.spec.cjs tests/e2e/v5.1-release-flow-review.spec.cjs tests/e2e/v5.1-visual-system-completion.spec.cjs tests/e2e/*-snapshots
git commit -m 'Apply Home AI polish and refresh visual baselines'
git push origin "HEAD:${GITHUB_REF_NAME}"
