#!/usr/bin/env python3
"""Swap FootMate presentation pages 9 and 10 and only their web-viewer metadata."""
from pathlib import Path
import json
import re
from pptx import Presentation

root = Path(__file__).resolve().parents[1]
pptx = root / "src/case-study/downloads/footmate_report.pptx"
preview = root / "src/case-study/report-previews.js"
materials = root / "src/case-study/materials.html"

prs = Presentation(str(pptx))
assert len(prs.slides) == 10, f"Unexpected slide count: {len(prs.slides)}"

def text_at(i):
    return " ".join(shape.text for shape in prs.slides[i].shapes if shape.has_text_frame)

first_eight_before = [prs.slides[i].slide_id for i in range(8)]
slide9 = text_at(8)
slide10 = text_at(9)
if "12개월 예상 ROI" in slide9 and "의사결정 메모" in slide10:
    print("PPT already in target order")
else:
    assert "의사결정 메모" in slide9, "Slide 9 is not the decision memo"
    assert "12개월 예상 ROI" in slide10, "Slide 10 is not ROI analysis"
    ids = prs.slides._sldIdLst
    # XML insertion moves slide 10's existing ID into position 9.
    # Slide objects, all fonts, icons, images and geometries remain unchanged.
    ids.insert(8, ids[9])
    prs.save(str(pptx))

verify = Presentation(str(pptx))
assert len(verify.slides) == 10
assert [verify.slides[i].slide_id for i in range(8)] == first_eight_before
assert "12개월 예상 ROI" in " ".join(s.text for s in verify.slides[8].shapes if s.has_text_frame)
assert "의사결정 메모" in " ".join(s.text for s in verify.slides[9].shapes if s.has_text_frame)

source = preview.read_text(encoding="utf-8").strip()
prefix = "window.REPORT_SLIDES="
assert source.startswith(prefix), "Unexpected preview format"
entries = json.loads(source[len(prefix):].rstrip(";"))
assert len(entries) == 10
first_eight = [(x["title"], x["src"]) for x in entries[:8]]
if "12개월 예상 ROI" in entries[8]["title"] and "의사결정 메모" in entries[9]["title"]:
    pass
else:
    assert "의사결정 메모" in entries[8]["title"]
    assert "12개월 예상 ROI" in entries[9]["title"]
    entries[8], entries[9] = entries[9], entries[8]
assert [(x["title"], x["src"]) for x in entries[:8]] == first_eight
preview.write_text(prefix + json.dumps(entries, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")

html = materials.read_text(encoding="utf-8")
m = re.search(r"const slideSummaries=(\[[^\]]+\]);", html)
assert m, "Missing slide summaries"
summaries = json.loads(m.group(1))
assert len(summaries) == 10
if "ROI" in summaries[8] and "투자 판단 기준" in summaries[9]:
    pass
else:
    assert "현장 검증" in summaries[8] and "ROI" in summaries[9]
    summaries[8], summaries[9] = summaries[9], summaries[8]
    updated = html[:m.start(1)] + json.dumps(summaries, ensure_ascii=False, separators=(",", ":")) + html[m.end(1):]
    materials.write_text(updated, encoding="utf-8")

assert "12개월 예상 ROI" in entries[8]["title"]
assert "의사결정 메모" in entries[9]["title"]
assert "ROI" in summaries[8] and "현장 검증" in summaries[9]
print("PASS: only PPT pages 9 and 10 reordered; viewer images and summaries synchronized")
