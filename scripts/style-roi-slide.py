#!/usr/bin/env python3
"""Restyle FootMate presentation using its own existing slide template.
Slides 1-9 retain their content/geometry; slide 10 is rebuilt from the
existing profitability-table slide. All text uses Pretendard, icon uses
an embedded image rendered from the official Tossface emoji font.
Re-render every slide into its browser preview from the actual PPTX.
Temporary script: not shipped as a font or font bundle.
"""
from __future__ import annotations

import base64
import io
import json
import os
import subprocess
import tempfile
from copy import deepcopy
from pathlib import Path

import fitz
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont
from pptx import Presentation
from pptx.oxml.xmlchemy import OxmlElement
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt

ROOT = Path(__file__).resolve().parents[1]
PPTX = ROOT / "src/case-study/downloads/footmate_report.pptx"
PREVIEW = ROOT / "src/case-study/report-previews.js"
TTF_SOURCE = Path("/tmp/TossFaceFontMac-09.woff2")


def set_text_retaining_style(shape, value):
    frame = shape.text_frame
    paragraph = frame.paragraphs[0]
    if paragraph.runs:
        paragraph.runs[0].text = value
        for r in paragraph.runs[1:]:
            r.text = ""
    else:
        paragraph.add_run().text = value
    for para in frame.paragraphs[1:]:
        for run in para.runs:
            run.text = ""


def apply_pretendard(frame):
    for para in frame.paragraphs:
        for run in para.runs:
            if not run.text:
                continue
            run.font.name = "Pretendard"
            rpr = run._r.get_or_add_rPr()
            ea = rpr.find(qn("a:ea"))
            if ea is None:
                ea = OxmlElement("a:ea")
                rpr.append(ea)
            ea.set("typeface", "Pretendard")
            cs = rpr.find(qn("a:cs"))
            if cs is None:
                cs = OxmlElement("a:cs")
                rpr.append(cs)
            cs.set("typeface", "Pretendard")


def make_tossface_icon():
    if not TTF_SOURCE.exists():
        raise FileNotFoundError("The official Tossface -09 font was not downloaded")
    ttf = TTFont(str(TTF_SOURCE))
    ttf.flavor = None
    out = Path("/tmp/footmate-tossface-09.ttf")
    ttf.save(out)

    emoji = "📊"
    font = ImageFont.truetype(str(out), size=160)
    canvas = Image.new("RGBA", (230, 230), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    draw.text((24, 10), emoji, font=font, embedded_color=True)
    bounds = canvas.getbbox()
    if not bounds:
        raise RuntimeError("Tossface icon missing: do not replace it with a generic emoji")
    icon = canvas.crop(bounds)
    icon.thumbnail((180, 180), Image.Resampling.LANCZOS)
    buffer = io.BytesIO()
    icon.save(buffer, format="PNG")
    return buffer


prs = Presentation(str(PPTX))
if len(prs.slides) != 10:
    raise RuntimeError(f"Unexpected slide count: {len(prs.slides)}")
ref = prs.slides[3]  # Original profitability table. Exact design source.
roi = prs.slides[9]  # Previously appended nonmatching slide.

# Replace slide 10 drawing tree with slide 4's exact layout:
# same coordinates, footer, table fill, typography hierarchy and table spacing.
for shape in list(roi.shapes):
    roi.shapes._spTree.remove(shape.element)
for shape in ref.shapes:
    roi.shapes._spTree.insert_element_before(deepcopy(shape.element), "p:extLst")

set_text_retaining_style(roi.shapes[0], "12개월 예상 ROI · 투자 판단")
set_text_retaining_style(
    roi.shapes[3],
    "총현금비용 대비 예상치 · 실제 성과 아님 · 공급·계약 검증 후 확대 결정",
)
table = roi.shapes[2].table
rows = [
    ["시나리오", "월 완료 예약", "12개월 예상 ROI"],
    ["보수", "83건", "−89.7%"],
    ["기준", "626건", "−47.5%"],
    ["확장", "1,803건", "−11.4%"],
    ["확장·관리비 반영", "1,803건", "−14.6%"],
]
if (len(table.rows), len(table.columns)) != (5, 3):
    raise RuntimeError("Original reference table layout unexpectedly changed")
for i, row in enumerate(rows):
    for j, value in enumerate(row):
        frame = table.cell(i, j).text_frame
        paragraph = frame.paragraphs[0]
        if paragraph.runs:
            paragraph.runs[0].text = value
            for r in paragraph.runs[1:]:
                r.text = ""
        else:
            paragraph.add_run().text = value

# Same font everywhere (including tables), preserving all original sizes,
# weights, alignments, positions and text except slide 10 edits.
for slide in prs.slides:
    for shape in slide.shapes:
        if shape.has_text_frame:
            apply_pretendard(shape.text_frame)
        if shape.has_table:
            for row in shape.table.rows:
                for cell in row.cells:
                    apply_pretendard(cell.text_frame)

# A real Tossface emoji raster, embedded in the PPTX:
# recipients need not install Tossface to see the icon.
icon = make_tossface_icon()
icon.seek(0)
roi.shapes.add_picture(icon, Inches(11.85), Inches(0.64), height=Inches(0.48))

prs.save(str(PPTX))

# Ensure the website is a preview of the edited PPTX, not an old, mismatched
# set of images. Use the official Pretendard fonts installed in this CI job.
with tempfile.TemporaryDirectory(prefix="footmate-roi-preview-") as tmp:
    tmpdir = Path(tmp)
    cmd = [
        "libreoffice",
        "-env:UserInstallation=file:///tmp/lo-footmate-roi-styles",
        "--headless",
        "--convert-to",
        "pdf:impress_pdf_Export",
        "--outdir",
        str(tmpdir),
        str(PPTX),
    ]
    run = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
    pdf = tmpdir / (PPTX.stem + ".pdf")
    if run.returncode or not pdf.exists():
        raise RuntimeError("PPT preview render failed: " + run.stdout + run.stderr)
    doc = fitz.open(str(pdf))
    if len(doc) != 10:
        raise RuntimeError("Renderer PDF does not contain 10 slides")
    existing = PREVIEW.read_text(encoding="utf-8").strip()
    prefix = "window.REPORT_SLIDES="
    if not existing.startswith(prefix):
        raise RuntimeError("Unexpected existing web preview format")
    entries = json.loads(existing[len(prefix):].rstrip(";"))
    if len(entries) != 10:
        raise RuntimeError("Existing web slides are not 10")
    new = []
    for i, page in enumerate(doc):
        pix = page.get_pixmap(matrix=fitz.Matrix(4/3, 4/3), alpha=False)
        image = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
        if image.size != (1280, 720):
            image = image.resize((1280, 720), Image.Resampling.LANCZOS)
        buf = io.BytesIO()
        image.save(buf, format="PNG", optimize=True)
        new.append({
            "title": entries[i]["title"],
            "src": "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii"),
        })
    PREVIEW.write_text(
        prefix + json.dumps(new, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )
print("PASS: Pretendard on all 10 slides, original slide 4 table geometry reused, Tossface chart icon embedded, 10 refreshed PNG previews")
