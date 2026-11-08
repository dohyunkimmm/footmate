"""P0: align slide 5 editable plan/reforecast chart to the case study's formula.
Read the SAME DATA.monthly from src/case-study/forecast.html; do not hardcode
monthly values or manufacture observed July-December outcomes.
Run after reframe-finance-deck and before generating PDF/previews.
"""
import json, math, re
from pathlib import Path
from pptx import Presentation
from pptx.chart.data import CategoryChartData

HTML=Path("src/case-study/forecast.html").read_text(encoding="utf-8")
PPT=Path("src/case-study/downloads/footmate_report.pptx")
match=re.search(r"const DATA=(\{[\s\S]*?\});\s*\nconst \$=",HTML)
assert match, "The canonical 2027 forecast source DATA was not found"
data=json.loads(match.group(1))
rows=data["monthly"]
assert len(rows)==12 and [r["month"] for r in rows]==[f"2027-{i:02d}" for i in range(1,13)]
assert all(r["source"]=="synthetic" for r in rows[:6])
fixed=data["configs"]["FootMate"]["fixed"]
assert fixed==600000, "Canonical monthly cash fixed cost changed"
recent=rows[3:6]
closed=rows[:6]
future=rows[6:]
def total(items,key):
    return sum(item[key] for item in items)
def jsround(n):
    # Matches JavaScript Math.round for the nonnegative transaction quantities.
    return int(math.floor(n+0.5))
completed=total(recent,"sim_orders")
plan_orders=total(recent,"plan_orders")
assert completed>0 and plan_orders>0
completion_ratio=completed/plan_orders
unit_revenue=total(recent,"sim_revenue")/completed
unit_variable_cost=sum(r["sim_revenue"]-r["sim_profit"]-fixed for r in recent)/completed
scenarios=[]
for r in future:
    orders=jsround(r["plan_orders"]*completion_ratio)
    scenarios.append({"orders":orders,
      "revenue":jsround(orders*unit_revenue),
      "profit":jsround(orders*(unit_revenue-unit_variable_cost)-fixed)})
plan=tuple(r["plan_revenue"] for r in rows)
revision=tuple([r["sim_revenue"] for r in closed]+[r["revenue"] for r in scenarios])
revised_profit=total(closed,"sim_profit")+total(scenarios,"profit")
planned_profit=total(rows,"plan_profit")
# Anchors derived from the current canonical management model, not invented observations.
assert plan[11]==2415600 and revision[11]==2301435
assert planned_profit==-2034040 and revised_profit==-5094242
assert revision[11]-plan[11]==-114165
prs=Presentation(PPT)
assert len(prs.slides)==10
slide=prs.slides[4]
chart_shapes=[s for s in slide.shapes if s.has_chart]
assert len(chart_shapes)==1, "Expected exactly one editable month-by-month chart"
chart=chart_shapes[0].chart
assert len(chart.series)==2
before=tuple(tuple(series.values) for series in chart.series)
assert len(before[0])==len(before[1])==12
assert tuple(round(v) for v in before[0])==plan, "Original chart plan differs from current case-study source"
assert tuple(round(v) for v in before[1][:6])==revision[:6], "First-half synthetic observations differ"
if tuple(round(v) for v in before[1])!=revision:
    chart_data=CategoryChartData()
    chart_data.categories=[f"{i}월" for i in range(1,13)]
    chart_data.add_series("계획",plan)
    chart_data.add_series("수정 전망",revision)
    chart.replace_data(chart_data)

def update_text(needle,value):
    matches=[s for s in slide.shapes if s.has_text_frame and needle in s.text]
    assert len(matches)==1, (needle,len(matches))
    frame=matches[0].text_frame
    if matches[0].text==value:return
    paragraph=frame.paragraphs[0]
    if paragraph.runs:
        paragraph.runs[0].text=value
        for run in paragraph.runs[1:]:run.text=""
    else:paragraph.text=value
    for para in frame.paragraphs[1:]:
        for run in para.runs:run.text=""
    frame.word_wrap=True

def delta(amount):
    return ("+" if amount>0 else "−" if amount<0 else "±")+f"{abs(amount):,d}원"
update_text("계획 대비 수정 전망 차이",
    "계획 대비 차이  |  "+" · ".join(f"{m}월 {delta(revision[m-1]-plan[m-1])}" for m in (1,6,12)))
update_text("가상 데이터 · 계획과 수정 전망 비교",
    "가상 데이터 · 1~6월 합성 실적 / 7~12월 재예측")
update_text("연간 현금손익",
    f"연간 현금운영손익 · 기존 계획 {planned_profit/10000:,.1f}만 원 / 재예측 {revised_profit/10000:,.1f}만 원 (합성)")
prs.save(PPT)
check=Presentation(PPT)
values=tuple(tuple(round(v) for v in s.values) for s in
    [sh.chart for sh in check.slides[4].shapes if sh.has_chart][0].series)
assert values==(plan,revision)
copy="\n".join(sh.text for sh in check.slides[4].shapes if sh.has_text_frame)
assert "12월 −114,165원" in copy
assert "−509.4만 원" in copy and "−203.4만 원" in copy
assert "1~6월 합성 실적 / 7~12월 재예측" in copy
print("PASS slide 5 Rolling Forecast monthly series and year-end economic scope")
print("PASS December forecast",revision[11],"vs plan",plan[11],"delta",revision[11]-plan[11])
print("PASS annual cash operating forecast",revised_profit,"vs plan",planned_profit)
