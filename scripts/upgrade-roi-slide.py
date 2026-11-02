#!/usr/bin/env python3
"""Improve ONLY ROI slide 9 and its matching image preview (validated table values).

The comparison uses sales-to-total-cash-cost coverage, so the widths are
100% * annual sales / annual total cash costs. The existing ROI values remain
negative, visually distinct and unchanged.
"""
import base64
import io
import json
import subprocess
import tempfile
from pathlib import Path

import pymupdf
from PIL import Image
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR
from pptx.oxml.xmlchemy import OxmlElement
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt

ROOT = Path(__file__).resolve().parents[1]
PPTX = ROOT / "src/case-study/downloads/footmate_report.pptx"
PREVIEW = ROOT / "src/case-study/report-previews.js"

prs = Presentation(str(PPTX))
assert len(prs.slides) == 10
slide = prs.slides[8]
assert any("12개월 예상 ROI" in sh.text for sh in slide.shapes if sh.has_text_frame)
assert any("의사결정 메모" in sh.text for sh in prs.slides[9].shapes if sh.has_text_frame)

def set_text(shape, content):
    paragraphs = shape.text_frame.paragraphs
    p = paragraphs[0]
    if p.runs:
        p.runs[0].text = content
        for run in p.runs[1:]:
            run.text = ""
    else:
        run = p.add_run()
        run.text = content
        run.font.name = "Pretendard"
    for extra in paragraphs[1:]:
        for run in extra.runs:
            run.text = ""

set_text(slide.shapes[0], "12개월 예상 ROI")
set_text(slide.shapes[3], "12개월 가정 · 총비용 회수율 100%가 기준 · 조건 검증 후 확대 결정")
table = slide.shapes[2].table
assert len(table.rows) == 5 and len(table.columns) == 3
table.cell(0,2).text_frame.paragraphs[0].runs[0].text = "예상 ROI"

# A narrow comparison strip uses the white space between the title and
# original table. Same green/mint palette; no badges or warning-red framing.
name_pct = [("보수",10.3), ("기준",52.5), ("확장",88.6), ("확장·관리비",85.4)]

def text(x,y,w,h,label,size=12,bold=False,color="173F33"):
    box=slide.shapes.add_textbox(Inches(x),Inches(y),Inches(w),Inches(h))
    frame=box.text_frame
    frame.clear()
    frame.word_wrap=False
    frame.margin_left=0
    frame.margin_right=0
    frame.margin_top=0
    frame.margin_bottom=0
    frame.vertical_anchor=MSO_ANCHOR.MIDDLE
    r=frame.paragraphs[0].add_run()
    r.text=label
    r.font.name="Pretendard"
    r.font.size=Pt(size)
    r.font.bold=bold
    r.font.color.rgb=RGBColor.from_string(color)
    rp=r._r.get_or_add_rPr()
    east=OxmlElement("a:ea")
    east.set("typeface","Pretendard")
    rp.append(east)
    return box

def rect(x,y,w,h,color):
    sh=slide.shapes.add_shape(MSO_SHAPE.RECTANGLE,Inches(x),Inches(y),Inches(w),Inches(h))
    sh.fill.solid()
    sh.fill.fore_color.rgb=RGBColor.from_string(color)
    sh.line.fill.background()
    return sh

text(.67,1.63,10.9,.24,"총현금비용 대비 매출 비율",size=13,bold=True,color="456F56")
colw=2.84
gap=.21
for i,(name,pct) in enumerate(name_pct):
    x=.67+i*(colw+gap)
    text(x,1.89,colw,.24,f"{name}  {pct:.1f}%",size=12,bold=(i==1))
    rect(x,2.23,colw,.065,"E3ECE5")
    rect(x,2.23,colw*pct/100,.065,"326C50" if i==1 else "79A68A")

prs.save(str(PPTX))

# Convert updated PPTX to exactly its ninth slide preview.
with tempfile.TemporaryDirectory(prefix="footmate-roi-") as temp:
    target=Path(temp)
    run=subprocess.run(
        ["libreoffice","-env:UserInstallation=file:///tmp/lo-footmate-roi-visual",
         "--headless","--convert-to","pdf:impress_pdf_Export","--outdir",str(target),str(PPTX)],
        capture_output=True,text=True,timeout=180,
    )
    pdf=target/(PPTX.stem+".pdf")
    if run.returncode or not pdf.is_file():
        raise RuntimeError(run.stdout+" "+run.stderr)
    doc=pymupdf.open(str(pdf))
    assert len(doc)==10
    page=doc[8]
    pix=page.get_pixmap(matrix=pymupdf.Matrix(4/3,4/3),alpha=False)
    img=Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
    if img.size!=(1280,720):
        img=img.resize((1280,720),Image.Resampling.LANCZOS)
    output=io.BytesIO()
    img.save(output,format="PNG",optimize=True)

raw=PREVIEW.read_text(encoding="utf-8").strip()
prefix="window.REPORT_SLIDES="
assert raw.startswith(prefix)
data=json.loads(raw[len(prefix):].rstrip(";"))
assert len(data)==10
assert "예상 ROI" in data[8]["title"]
old_other=[(i,item["title"],item["src"]) for i,item in enumerate(data) if i!=8]
data[8]={"title":"12개월 예상 ROI","src":"data:image/png;base64,"+base64.b64encode(output.getvalue()).decode("ascii")}
assert old_other==[(i,item["title"],item["src"]) for i,item in enumerate(data) if i!=8]
PREVIEW.write_text(prefix+json.dumps(data,ensure_ascii=False,separators=(",",":"))+";\n",encoding="utf-8")
print("PASS ROI visual strip (10.3/52.5/88.6/85.4%), unchanged ROI figures and slides 1–8/10, rendered page 9 only")
