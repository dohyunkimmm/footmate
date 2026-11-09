#!/usr/bin/env python3
"""Align editable FootMate decks and browser previews with the planning portfolio.
Preserve numerical assumptions, tables, geometry and original font sizes.
"""
from __future__ import annotations

import base64
import json
import re
import subprocess
from pathlib import Path
from tempfile import TemporaryDirectory

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.dml import MSO_COLOR_TYPE, MSO_FILL

ROOT = Path(__file__).resolve().parents[1]
CASE = ROOT / "src/case-study"
DOWNLOADS = CASE / "downloads"
NAVY = RGBColor(20, 44, 57)
TEAL = RGBColor(8, 123, 96)
INK = RGBColor(27, 41, 49)
SLATE = RGBColor(82, 99, 109)
PAPER = RGBColor(245, 247, 246)
TINT = RGBColor(234, 245, 241)
LIME = RGBColor(205, 243, 93)
PALETTE = {
    # Existing strategy deck tokens
    "0F372C": NAVY, "1E6249": TEAL, "D1EEDD": TINT,
    "CAF7AC": LIME, "1E362E": INK, "657A6E": SLATE,
    "F8FBF8": PAPER,
    # Earlier business-report greens, if used as explicit RGB
    "0B4231": NAVY, "173329": INK, "155A40": TEAL,
    "326C50": TEAL, "E6F4E8": TINT, "EDF3ED": TINT,
}

def visit_runs(shape):
    if getattr(shape, "has_text_frame", False):
        for para in shape.text_frame.paragraphs:
            for run in para.runs:
                yield run
    if getattr(shape, "has_table", False):
        for row in shape.table.rows:
            for cell in row.cells:
                for para in cell.text_frame.paragraphs:
                    for run in para.runs:
                        yield run

def recolor(color):
    if color.type == MSO_COLOR_TYPE.RGB and color.rgb is not None:
        key = str(color.rgb).upper()
        if key in PALETTE:
            color.rgb = PALETTE[key]

def apply_color(shape):
    if getattr(shape, "has_text_frame", False) or getattr(shape, "has_table", False):
        for run in visit_runs(shape):
            if run.text:
                run.font.name = "Pretendard"
                recolor(run.font.color)
    try:
        if shape.fill.type == MSO_FILL.SOLID:
            recolor(shape.fill.fore_color)
    except (AttributeError, ValueError):
        pass
    try:
        if shape.line.fill.type == MSO_FILL.SOLID:
            recolor(shape.line.color)
    except (AttributeError, ValueError):
        pass
    if getattr(shape, "has_table", False):
        for row in shape.table.rows:
            for cell in row.cells:
                try:
                    if cell.fill.type == MSO_FILL.SOLID:
                        recolor(cell.fill.fore_color)
                except (AttributeError, ValueError):
                    pass

def replace_runs(slide, source, target):
    changed = 0
    for shape in slide.shapes:
        for run in visit_runs(shape):
            if source in run.text:
                changed += run.text.count(source)
                run.text = run.text.replace(source, target)
    return changed

main_path = DOWNLOADS / "footmate_report.pptx"
strategy_path = DOWNLOADS / "footmate_5year_strategy.pptx"
main = Presentation(main_path)
strategy = Presentation(strategy_path)
assert len(main.slides) == 9 and len(strategy.slides) == 6

checks = []
def rewrite(slides, targets, source, target, expected):
    changed = sum(replace_runs(slides[i], source, target) for i in targets)
    if changed != expected:
        raise RuntimeError(f"Slide text mismatch ({changed}/{expected}): {source}")
    checks.append((source, target, changed))

rewrite(main.slides, range(9), "FootMate · 사업·IT 기획",
        "FootMate · 사업성 분석·경영계획", 9)
rewrite(main.slides, [0], "FootMate 경영계획·수익성·투자 판단",
        "FootMate 사업성 분석·경영계획", 1)
rewrite(main.slides, [4], "경유·취소·완료율 점검",
        "예약·취소·완료율 점검", 1)
rewrite(main.slides, [6], "36개월 기본 고정현금비 2,460만원",
        "36개월 운영·초기 구축비 2,460만 원", 1)
rewrite(main.slides, [6], "인력 기회비용 포함 9,660만원",
        "인력 기회비용 포함 9,660만 원", 1)
old_note = "가정 기반 분석 · 실제 계약·매출·운영 성과와 구분"
rewrite(main.slides, [0], old_note, "사업성 가정 · 실제 실적과 구분", 1)
rewrite(main.slides, [1, 4, 5], old_note, "사업성 검토 · 계획 시나리오", 3)

rewrite(strategy.slides, range(1, 5),
        "FOOTMATE  /  5-YEAR STRATEGY  /",
        "FootMate  /  5개년 경영계획  /", 4)
rewrite(strategy.slides, [0], "FOOTMATE", "FootMate", 1)
rewrite(strategy.slides, [0], "중장기 경영전략 및 수익성 개선",
        "5개년 경영계획·수익성 개선", 1)
rewrite(strategy.slides, [5], "FOOTMATE  /  경영진 의사결정",
        "FootMate  /  투자 판단", 1)
rewrite(strategy.slides, [5], "3  월별 실적 차이와 현금수지로 5개년 계획 점검",
        "3  월별 계획 대비 차이와 현금수지로 5개년 계획 점검", 1)

for deck in (main, strategy):
    for slide in deck.slides:
        for shape in slide.shapes:
            apply_color(shape)
main.save(main_path)
strategy.save(strategy_path)

# PDF renders are also the source of the published, clickable slide thumbnails.
with TemporaryDirectory(prefix="footmate-slide-sync-") as temporary:
    tmp = Path(temporary)
    for path in (main_path, strategy_path):
        subprocess.run(["libreoffice", "-env:UserInstallation=file:///tmp/footmate-polish-" + path.stem,
                        "--headless", "--convert-to", "pdf", "--outdir", str(tmp), str(path)],
                       check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        assert (tmp / (path.stem + ".pdf")).exists(), "Slide PDF conversion failed"
    subprocess.run(["pdftoppm", "-r", "96", "-png",
                    str(tmp / "footmate_report.pdf"), str(tmp / "report")], check=True)
    subprocess.run(["pdftoppm", "-r", "96", "-jpeg",
                    "-jpegopt", "quality=85",
                    str(tmp / "footmate_5year_strategy.pdf"), str(tmp / "strategy")], check=True)
    preview_file = CASE / "report-previews.js"
    raw = preview_file.read_text(encoding="utf-8").strip()
    prefix = "window.REPORT_SLIDES="
    assert raw.startswith(prefix) and raw.endswith(";")
    previews = json.loads(raw[len(prefix):-1])
    assert len(previews) == 9
    for i, slide in enumerate(previews, 1):
        png = tmp / f"report-{i}.png"
        assert png.exists()
        content = png.read_bytes()
        assert content.startswith(bytes.fromhex("89504e470d0a1a0a")) and len(content) > 5000
        slide["src"] = "data:image/png;base64," + base64.b64encode(content).decode("ascii")
    preview_file.write_text(prefix + json.dumps(previews, ensure_ascii=False, separators=(",", ":")) + ";\n",
                            encoding="utf-8")
    strategy_dir = CASE / "previews/strategy"
    strategy_dir.mkdir(parents=True, exist_ok=True)
    for i in range(1, 7):
        jpg = tmp / f"strategy-{i}.jpg"
        assert jpg.exists() and jpg.read_bytes().startswith(bytes.fromhex("ffd8ff"))
        (strategy_dir / f"slide-{i}.jpg").write_bytes(jpg.read_bytes())

print("PASS: revised 9+6 slide texts and generated 9 PNG + 6 JPG previews", len(checks))
