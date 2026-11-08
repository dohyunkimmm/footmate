"""Present FootMate as management planning without changing source financial data.
Keep all 10 slides, charts, financial tables and 5-year appendix unchanged.
Run after the existing financial alignment/visual polish scripts.
"""
from pathlib import Path
from pptx import Presentation

PATH=Path("src/case-study/downloads/footmate_report.pptx")
p=Presentation(PATH);assert len(p.slides)==10
before_charts=[]
before_tables=[]
for slide in p.slides:
 for shape in slide.shapes:
  if shape.has_chart: before_charts.append(tuple(tuple(s.values) for s in shape.chart.series))
  if shape.has_table: before_tables.append(tuple(tuple(c.text for c in r.cells) for r in shape.table.rows))
replacements={
 1:[
  ("FootMate 플랫폼 운영과 수익성 개선","FootMate 경영계획·수익성·투자 판단"),
  ("공급 확대·수익성·IT 투자를 경영성과 관리에 연결","예산·손익·수정 전망을 투자 판단에 연결"),
 ],
 5:[
  ("월간 성과관리와 수정 전망","월간 경영관리와 Rolling Forecast"),
  ("연간 현금 손익 · 수정 전망 −303.3만 원 / 연중 가상 비용 추세 반영 −484.1만 원",
   "연간 현금손익 · 기존 전망 −303.3만 원 / 최근 3개월 추세 재예측 −509.4만 원 (합성)")
 ],
 8:[("IT 투자 범위와 비용","투자비·운영비·인력 자원 계획")],
}
def frame_list(sh):
 out=[sh.text_frame] if sh.has_text_frame else []
 if sh.has_table:out.extend(cell.text_frame for row in sh.table.rows for cell in row.cells)
 return out
def swap(slide,old,new):
 hits=0
 for sh in slide.shapes:
  for frame in frame_list(sh):
   for para in frame.paragraphs:
    text="".join(run.text for run in para.runs) if para.runs else para.text
    if new in text:
     hits+=1;continue
    if old not in text:continue
    assert text.count(old)==1, old
    updated=text.replace(old,new)
    if para.runs:
     para.runs[0].text=updated
     for run in para.runs[1:]:run.text=""
     for run in para.runs:run.font.name="Pretendard"
    else:para.text=updated
    hits+=1
 assert hits==1,(old,hits)
for num,items in replacements.items():
 for old,new in items:swap(p.slides[num-1],old,new)
after_charts=[]
after_tables=[]
for slide in p.slides:
 for shape in slide.shapes:
  if shape.has_chart:after_charts.append(tuple(tuple(s.values) for s in shape.chart.series))
  if shape.has_table:after_tables.append(tuple(tuple(c.text for c in r.cells) for r in shape.table.rows))
assert before_charts==after_charts,"Source chart data changed"
assert before_tables==after_tables,"Financial table data changed"
p.save(PATH)
check=Presentation(PATH);assert len(check.slides)==10
for num,items in replacements.items():
 for old,new in items:
  assert sum(new in sh.text for sh in check.slides[num-1].shapes if sh.has_text_frame)==1,(num,new)
assert len(check.slides[9].shapes)>0
print("PASS FootMate management-planning slide focus, original chart and table values unchanged")
