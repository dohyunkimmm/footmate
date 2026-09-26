#!/usr/bin/env bash
set -euo pipefail

python - <<'PY'
from pathlib import Path

html = Path('app.html')
text = html.read_text()
expanded_conditions = '.fm-ai-conditions{display:flex!important;flex-wrap:nowrap!important;gap:3px;margin-top:7px;white-space:nowrap;overflow:hidden}'
original_conditions = '.fm-ai-conditions{display:flex!important;gap:5px;margin-top:7px}'
if expanded_conditions in text:
    text = text.replace(expanded_conditions, original_conditions, 1)
elif original_conditions not in text:
    raise SystemExit('connected conditions rule not found')

expanded_chip = '.fm-ai-conditions span{flex:0 0 auto;min-width:0;padding:4px 5px;border:1px solid rgba(20,61,45,.09);background:#f1f5f2;color:#455b51;font-size:9px;letter-spacing:-.04em}@media(max-width:359px){.fm-next-page[data-mode="real"] [data-screen="home"] .fm-ai-card[data-ia-role="primary-assistant"][data-ai-state="result"]:has(.fm-ai-mode[data-mode="connected-ai"]) .fm-ai-conditions{gap:2px}.fm-next-page[data-mode="real"] [data-screen="home"] .fm-ai-card[data-ia-role="primary-assistant"][data-ai-state="result"]:has(.fm-ai-mode[data-mode="connected-ai"]) .fm-ai-conditions span{padding:3px 4px;font-size:8px}.fm-next-page[data-mode="real"] [data-screen="home"] .fm-ai-card[data-ia-role="primary-assistant"][data-ai-state="result"]:has(.fm-ai-mode[data-mode="connected-ai"]) .fm-ai-conditions:has(>span:nth-child(6))>span:nth-child(3){display:none}}</style>'
original_chip = '.fm-ai-conditions span{padding:5px 7px;border:1px solid rgba(20,61,45,.09);background:#f1f5f2;color:#455b51;font-size:10px}</style>'
if expanded_chip in text:
    text = text.replace(expanded_chip, original_chip, 1)
elif original_chip not in text:
    raise SystemExit('connected chip rule not found')

text = text.replace('/src/v5/ai-match-assistant.css?v=511','/src/v5/ai-match-assistant.css?v=512',1)
text = text.replace('/src/v5/ai-match-assistant.js?v=511','/src/v5/ai-match-assistant.js?v=512',1)
html.write_text(text)

css = Path('src/v5/ai-match-assistant.css')
text = css.read_text()
marker = '/* Home connected AI conditions · compact single row */'
if marker not in text:
    text += '''\n/* Home connected AI conditions · compact single row */\n.fm-next-page[data-mode="real"] [data-screen="home"] .fm-ai-card[data-ia-role="primary-assistant"][data-ai-state="result"]:has(.fm-ai-mode[data-mode="connected-ai"]) .fm-ai-conditions{flex-wrap:nowrap!important;gap:3px!important;white-space:nowrap!important;overflow:hidden!important}\n.fm-next-page[data-mode="real"] [data-screen="home"] .fm-ai-card[data-ia-role="primary-assistant"][data-ai-state="result"]:has(.fm-ai-mode[data-mode="connected-ai"]) .fm-ai-conditions span{flex:0 0 auto!important;min-width:0!important;padding:4px 5px!important;font-size:9px!important;letter-spacing:-.04em!important}\n@media(max-width:359px){.fm-next-page[data-mode="real"] [data-screen="home"] .fm-ai-card[data-ia-role="primary-assistant"][data-ai-state="result"]:has(.fm-ai-mode[data-mode="connected-ai"]) .fm-ai-conditions{gap:2px!important}.fm-next-page[data-mode="real"] [data-screen="home"] .fm-ai-card[data-ia-role="primary-assistant"][data-ai-state="result"]:has(.fm-ai-mode[data-mode="connected-ai"]) .fm-ai-conditions span{padding:3px 4px!important;font-size:8px!important}.fm-next-page[data-mode="real"] [data-screen="home"] .fm-ai-card[data-ia-role="primary-assistant"][data-ai-state="result"]:has(.fm-ai-mode[data-mode="connected-ai"]) .fm-ai-conditions:has(>span:nth-child(6))>span:nth-child(3){display:none!important}}\n'''
    css.write_text(text)
PY

git diff --check
node scripts/check-v4.9-performance-budget.cjs

if git diff --quiet; then
  echo 'No migration changes needed.'
  exit 0
fi

PLAYWRIGHT_VERSION="$(node -p "require('./package.json').qaToolchain.playwright")"
AXE_VERSION="$(node -p "require('./package.json').qaToolchain.axeCorePlaywright")"
npm install --no-save --ignore-scripts "@playwright/test@$PLAYWRIGHT_VERSION" "@axe-core/playwright@$AXE_VERSION"
npx playwright install --with-deps chromium
npx playwright test --project=chromium tests/e2e/v5.1-ai-assistant.spec.cjs

git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git add app.html src/v5/ai-match-assistant.css
git commit -m 'Move Home chip layout out of inline HTML'
git push origin "HEAD:${GITHUB_REF_NAME}"
