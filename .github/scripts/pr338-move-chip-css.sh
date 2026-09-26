#!/usr/bin/env bash
set -euo pipefail

python - <<'PY'
from pathlib import Path
import re

html = Path('app.html')
text = html.read_text()
inline_ai = re.compile(r"\n<script>\(\(\)=>\{const root=document\.getElementById\('footmate-next'\),key='footmate:v5\.1:ai';.*?\}\)\(\);</script>\n", re.S)
text, count = inline_ai.subn('\n', text, count=1)
if count != 1:
    raise SystemExit(f'expected one Home AI inline sync script, found {count}')
text = text.replace('/src/v5/ai-match-assistant.js?v=511','/src/v5/ai-match-assistant.js?v=512',1)
text = text.replace('/src/v4/app.js?v=494','/src/v4/app.js?v=495',1)
html.write_text(text)

js = Path('src/v5/ai-match-assistant.js')
source = js.read_text()
condition_line = "function conditionLabels(result){const labels=[];if(result.region)labels.push(result.region);if(result.position)labels.push(result.position);if(result.level)labels.push(result.level);if(result.maxPrice!=null)labels.push(`${money(result.maxPrice)} 이하`);if(result.maxDistanceMin!=null)labels.push(`${result.maxDistanceMin}분 이내`);if(result.afterTime)labels.push(`${result.afterTime} 이후`);return labels.length?labels:['현재 설정 유지']}\n"
summary_line = "function homeStatusSummary(result){const region=String(result?.region||'').replace(/\\s*·\\s*/g,'·').trim(),role=[result?.level,result?.position].filter(Boolean).join(' ');if(region&&role)return `${region}에서 조건에 맞는 ${role} 경기를 찾습니다.`;if(region)return `${region}에서 조건에 맞는 경기를 찾습니다.`;if(role)return `조건에 맞는 ${role} 경기를 찾습니다.`;return '조건에 맞는 경기를 찾습니다.'}\n"
if 'function homeStatusSummary(result)' not in source:
    if condition_line not in source:
        raise SystemExit('conditionLabels anchor not found')
    source = source.replace(condition_line, condition_line + summary_line, 1)
old_status = "  if(status)status.innerHTML=`<b>${escapeHtml(result.reply)}</b><span>${saved.mode==='connected-ai'?'AI가 자연어를 조건으로 해석했고, 순위는 기존 추천 엔진이 계산했습니다.':'AI 연결 실패 후 rules-based fallback으로 같은 추천 엔진을 사용했습니다.'}</span>`;\n"
new_status = "  const statusCopy=card.closest('[data-screen=\"home\"]')&&saved.mode==='connected-ai'?homeStatusSummary(result):result.reply;\n  if(status)status.innerHTML=`<b>${escapeHtml(statusCopy)}</b><span>${saved.mode==='connected-ai'?'AI가 자연어를 조건으로 해석했고, 순위는 기존 추천 엔진이 계산했습니다.':'AI 연결 실패 후 rules-based fallback으로 같은 추천 엔진을 사용했습니다.'}</span>`;\n"
if old_status in source:
    source = source.replace(old_status, new_status, 1)
elif new_status not in source:
    raise SystemExit('renderSaved status anchor not found')
old_home = "    assistant.querySelector('.fm-ai-examples')?.setAttribute('aria-label','바로 실행할 AI 경기 검색 예시');\n    observeHome(assistant);\n"
new_home = "    assistant.querySelector('.fm-ai-examples')?.setAttribute('aria-label','바로 실행할 AI 경기 검색 예시');\n    const saved=readAssistant();if(saved?.mode==='connected-ai'&&saved.result)setText(assistant.querySelector('[data-ai-status] b'),homeStatusSummary(normalizeResult(saved.result)));\n    observeHome(assistant);\n"
if old_home in source:
    source = source.replace(old_home, new_home, 1)
elif new_home not in source:
    raise SystemExit('configureHome anchor not found')
js.write_text(source)
PY

git diff --check
node scripts/check-v4.9-performance-budget.cjs

git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git rm .github/scripts/pr338-move-chip-css.sh .github/workflows/pr338-move-chip-css.yml
git add app.html src/v5/ai-match-assistant.js
git commit -m 'fix: keep Home AI state in source runtime'
git push origin "HEAD:${GITHUB_REF_NAME}"
