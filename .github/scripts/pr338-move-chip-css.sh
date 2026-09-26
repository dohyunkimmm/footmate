#!/usr/bin/env bash
set -euo pipefail

python - <<'PY'
from pathlib import Path

html = Path('app.html')
text = html.read_text()

expanded_conditions = '.fm-ai-conditions{display:flex!important;flex-wrap:nowrap!important;gap:3px;margin-top:7px;white-space:nowrap;overflow:hidden}'
compact_conditions = '.fm-ai-conditions{display:flex!important;flex-wrap:nowrap!important;gap:3px;margin-top:7px;white-space:nowrap;overflow:hidden}'
if expanded_conditions not in text:
    raise SystemExit('expanded conditions rule not found')
text = text.replace(expanded_conditions, compact_conditions, 1)

expanded_chip = '.fm-ai-conditions span{flex:0 0 auto;min-width:0;padding:4px 5px;border:1px solid rgba(20,61,45,.09);background:#f1f5f2;color:#455b51;font-size:9px;letter-spacing:-.04em}@media(max-width:359px){.fm-next-page[data-mode="real"] [data-screen="home"] .fm-ai-card[data-ia-role="primary-assistant"][data-ai-state="result"]:has(.fm-ai-mode[data-mode="connected-ai"]) .fm-ai-conditions{gap:2px}.fm-next-page[data-mode="real"] [data-screen="home"] .fm-ai-card[data-ia-role="primary-assistant"][data-ai-state="result"]:has(.fm-ai-mode[data-mode="connected-ai"]) .fm-ai-conditions span{padding:3px 4px;font-size:8px}.fm-next-page[data-mode="real"] [data-screen="home"] .fm-ai-card[data-ia-role="primary-assistant"][data-ai-state="result"]:has(.fm-ai-mode[data-mode="connected-ai"]) .fm-ai-conditions:has(>span:nth-child(6))>span:nth-child(3){display:none}}</style>'
compact_chip = '.fm-ai-conditions span{flex:0 0 auto;padding:4px 5px;border:1px solid rgba(20,61,45,.09);background:#f1f5f2;color:#455b51;font-size:9px;letter-spacing:-.04em}@media(max-width:359px){[data-screen="home"] .fm-ai-conditions{gap:2px!important}[data-screen="home"] .fm-ai-conditions span{padding:3px 4px!important;font-size:8px!important}[data-screen="home"] .fm-ai-conditions span:nth-child(3){display:none}}</style>'
if expanded_chip not in text:
    raise SystemExit('expanded chip rule not found')
text = text.replace(expanded_chip, compact_chip, 1)

text = text.replace('/src/v5/ai-match-assistant.js?v=511','/src/v5/ai-match-assistant.js?v=512',1)
text = text.replace('/src/v4/app.js?v=494','/src/v4/app.js?v=495',1)
html.write_text(text)
PY

git diff --check
node scripts/check-v4.9-performance-budget.cjs

git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git rm .github/scripts/pr338-move-chip-css.sh .github/workflows/pr338-move-chip-css.yml
git add app.html
git commit -m 'fix: keep Home condition chips compact within budget'
git push origin "HEAD:${GITHUB_REF_NAME}"
