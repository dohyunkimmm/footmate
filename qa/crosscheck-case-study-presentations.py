#!/usr/bin/env python3
"""Cross-check public FootMate case-study copy, main PPT and 5-year PPT using stdlib."""
from __future__ import annotations
from html import unescape
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile
import json
import re

ROOT = Path(__file__).resolve().parents[1]
CASE = ROOT / "src" / "case-study"
JAVASCRIPT = (CASE / "nine-sections.js").read_text(encoding="utf-8")
TABLES = re.compile(r"<table\b[^>]*>.*?</table>", re.S | re.I)
ROWS = re.compile(r"<tr\b[^>]*>.*?</tr>", re.S | re.I)
CELLS = re.compile(r"<(?:th|td)\b[^>]*>(.*?)</(?:th|td)>", re.S | re.I)
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
P = "{http://schemas.openxmlformats.org/presentationml/2006/main}"
R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
PR = "{http://schemas.openxmlformats.org/package/2006/relationships}"

def plain(source: str) -> str:
    return unescape(re.sub(r"<[^>]*>", " ", source)).replace("\u00a0", " ").strip()

def no_spaces(source: str) -> str:
    return re.sub(r"\s+", "", source).replace("-", "−")

def cell_rows(markup: str) -> list[list[str]]:
    return [[no_spaces(plain(value)) for value in CELLS.findall(row)]
            for row in ROWS.findall(markup)]

tail = JAVASCRIPT.split("const sections = ", 1)[1]
sections = json.loads(tail[:tail.index("];\n") + 1])
assert len(sections) == 9, "Case study must have nine body sections"
body = "\n".join(item["title"] + " " + item["lead"] + " " + item["body"] for item in sections)
assert "가상 데이터" in body and "가정" in body, "Hypothetical data disclaimer disappeared"
five_year = next(table for table in TABLES.findall(sections[7]["body"])
                 if "5개년 경영계획" in table)
rows = cell_rows(five_year)
matrix = {row[0]: row[1:] for row in rows if row}

assert matrix["제휴공급처"] == ["5곳", "12곳", "20곳", "28곳", "36곳"]
assert matrix["수수료매출"] == ["901", "2,595", "4,327", "6,058", "7,788"]
assert matrix["거래변동비"] == ["646", "901", "1,502", "2,104", "2,704"]
assert matrix["현금운영비"] == ["770", "972", "1,260", "1,548", "1,836"]
assert matrix["구축·확장투자비"] == ["300", "100", "150", "200", "250"]
assert matrix["투자후현금수지"] == ["−815", "622", "1,415", "2,207", "2,998"]
assert matrix["기존수수료·결제조건유지시현금수지"] == ["−815", "−459", "−388", "−318", "−247"]

def deck(path: Path) -> tuple[list[str],list[list[list[str]]]]:
    with ZipFile(path) as archive:
        rels = ET.fromstring(archive.read("ppt/_rels/presentation.xml.rels"))
        by_id = {r.get("Id"): r.get("Target") for r in rels.findall(PR + "Relationship")}
        pres = ET.fromstring(archive.read("ppt/presentation.xml"))
        slides = []
        tables = []
        for elem in pres.findall(".//" + P + "sldId"):
            target = by_id[elem.get(R + "id")].lstrip("/")
            full = target if target.startswith("ppt/") else "ppt/" + target
            root = ET.fromstring(archive.read(full))
            slides.append(" ".join(t.text or "" for t in root.iter(A + "t")))
            slide_tables = []
            for table in root.iter(A + "tbl"):
                for row in table.findall(A + "tr"):
                    slide_tables.append(["".join(t.text or "" for t in cell.iter(A + "t"))
                                         for cell in row.findall(A + "tc")])
            tables.append(slide_tables)
    return slides, tables

main, main_tables = deck(CASE / "downloads" / "footmate_report.pptx")
strategy, strategy_tables = deck(CASE / "downloads" / "footmate_5year_strategy.pptx")
assert len(main) == 9 and len(strategy) == 6, (len(main), len(strategy))
print("DECKS", len(main), len(strategy))
assert "수익성" in main[0] and "운영자 제휴" in main[0]
assert all(str(i) in no_spaces(main[2]) for i in ("626", "751,200"))
assert all(term in no_spaces(main[3]) for term in ("340원", "940원", "2,766"))
assert all(term in no_spaces(main[4]) for term in ("−39,600", "−217,040"))
assert "단계적 투자" in main[-1] and "9" in main[-1]
final_tables = [r for r in main_tables[-1] if r and re.search(r"^[1-5]년\s*차$", r[0])]
assert len(final_tables) == 5, final_tables
for index, row in enumerate(final_tables):
    values = [no_spaces(item) for item in row]
    assert matrix["제휴공급처"][index] in values, (index, values)
    assert matrix["수수료매출"][index] in values, (index, values)
    operations = int(matrix["거래변동비"][index].replace(",", "")) + int(
        matrix["현금운영비"][index].replace(",", ""))
    assert f"{operations:,}" in values, (index, values)
    assert matrix["구축·확장투자비"][index] in values, (index, values)
    assert matrix["투자후현금수지"][index] in values, (index, values)
    assert matrix["기존수수료·결제조건유지시현금수지"][index] in values, (index, values)
assert all(term in no_spaces(strategy[1]) for term in ("5곳", "12곳", "20곳", "28곳", "36곳"))
assert all(term in no_spaces(strategy[2]) for term in ("340원", "700원", "940원", "28곳"))
expected_economics = ["−238.7만원", "−139.8만원", "−69.6만원", "+0.6만원", "+70.7만원"]
assert all(term in no_spaces(strategy[3]) for term in expected_economics), strategy[3]
assert all("기존9장발표자료보완" in no_spaces(s) for s in strategy[1:5]), \
    "5-year PPT footer still has a stale main-deck slide count"

for name, content in [
    ("body", body), ("README", (ROOT / "README.md").read_text(encoding="utf-8")),
    ("strategy generator", (ROOT / "qa" / "build-footmate-strategy-appendix-20261107.py").read_text(encoding="utf-8")),
    ("main slides", " ".join(main)), ("strategy slides", " ".join(strategy))
]:
    assert not re.search(r"Rolling\s*Forecast|수정\s*전망|재예측", content, re.I), name
    assert not re.search(r"(?:기존|총|발표자료)\s*10장", content), name
assert "후속 구축 범위" in body, "Implementation status must be clearly identified"
assert "자료 보완" in body and "목표 재점검" in body
assert "공급·책임 불명확 시 보류" not in body
assert "구독료·전환율 미확정" not in body
print("PASS: body vs 9-slide report vs 6-slide strategy figures, copy, and decisions match")
