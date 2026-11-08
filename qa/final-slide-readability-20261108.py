"""Lightly improve the readable table/footnote hierarchy on the existing final slide.

Keep all 10 slides, chart values, business assumptions and textual content intact.
Works on the editable PPTX and is safe on repeated preview builds.
"""
from pathlib import Path
from pptx import Presentation
from pptx.util import Inches, Pt

PPTX = Path("src/case-study/downloads/footmate_report.pptx")
MARKER = "footmate-final-readability-20261108"
prs = Presentation(PPTX)
assert len(prs.slides) == 10
if MARKER in (prs.core_properties.keywords or ""):
    print("PASS FootMate final-slide readability already applied; bytes unchanged")
    raise SystemExit(0)

def snapshot(p):
    result = []
    for slide in p.slides:
        for shape in slide.shapes:
            if shape.has_text_frame:
                result.append(("text", shape.text))
            if shape.has_table:
                result.append(("table", tuple(tuple(c.text for c in row.cells) for row in shape.table.rows)))
            if shape.has_chart:
                result.append(("chart", tuple(tuple(series.values) for series in shape.chart.series)))
    return result

before = snapshot(prs)
last = prs.slides[9]
tables = [shape.table for shape in last.shapes if shape.has_table]
assert len(tables) == 1, "Expected one editable five-year financial comparison table"
table = tables[0]
assert len(table.rows) == 6, "Expected header and five annual rows"
assert any("4년 차" in cell.text for cell in table.rows[4].cells)

for row_number, row in enumerate(table.rows):
    for cell in row.cells:
        frame = cell.text_frame
        frame.word_wrap = True
        frame.margin_left = Inches(0.045)
        frame.margin_right = Inches(0.045)
        frame.margin_top = Inches(0.035)
        frame.margin_bottom = Inches(0.035)
        for paragraph in frame.paragraphs:
            for run in paragraph.runs:
                current = run.font.size
                floor = Pt(10.5 if row_number == 0 else 10.4)
                if current is None or current < floor:
                    run.font.size = floor
                run.font.name = "Pretendard"

# Retain the scope/assumption disclosure at the bottom, but avoid tiny footnote text.
notes = 0
for shape in last.shapes:
    if not shape.has_text_frame:
        continue
    if "현금수지는 매출에서" not in shape.text:
        continue
    for paragraph in shape.text_frame.paragraphs:
        for run in paragraph.runs:
            current = run.font.size
            if current is None or current < Pt(10.5):
                run.font.size = Pt(10.5)
            run.font.name = "Pretendard"
            notes += 1
assert notes > 0, "Financial disclosure note not found"

assert snapshot(prs) == before, "Financial copy or numerical values changed"
prs.core_properties.keywords = ((prs.core_properties.keywords or "") + " " + MARKER).strip()
prs.save(PPTX)
verified = Presentation(PPTX)
assert len(verified.slides) == 10
assert snapshot(verified) == before
assert MARKER in (verified.core_properties.keywords or "")
print("PASS FootMate 10-slide final table and financial footnote readability; text and charts unchanged")
