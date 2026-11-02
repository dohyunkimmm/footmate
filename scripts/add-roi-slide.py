#!/usr/bin/env python3
"""Append one assumption-based ROI slide to FootMate's existing nine-slide deck.
Preserve the existing slide content, and add a matching web preview image.
"""
from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import quote
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Inches, Pt

ROOT = Path(__file__).resolve().parents[1]
DECK = ROOT / "src/case-study/downloads/footmate_report.pptx"
PREVIEWS = ROOT / "src/case-study/report-previews.js"
TITLE = "12개월 예상 ROI · 투자 판단"

def rgb(hexstr):
    return RGBColor.from_string(hexstr)

def box(slide, x, y, w, h, color, radius=False, stroke=None):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE, x, y, w, h)
    shape.fill.solid()
    shape.fill.fore_color.rgb = rgb(color)
    if stroke:
        shape.line.color.rgb = rgb(stroke)
    else:
        shape.line.fill.background()
    return shape

def txt(slide, value, x, y, w, h, size=16, color="173F33", bold=False, align=None):
    shape = slide.shapes.add_textbox(x,y,w,h)
    tf = shape.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.07)
    tf.margin_right = Inches(0.07)
    tf.margin_top = Inches(0.03)
    tf.margin_bottom = Inches(0.03)
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p=tf.paragraphs[0]
    p.text=value
    p.font.name="Malgun Gothic"
    p.font.size=Pt(size)
    p.font.bold=bold
    p.font.color.rgb=rgb(color)
    if align is not None: p.alignment=align
    return shape

prs=Presentation(str(DECK))
if len(prs.slides) not in (9,10):
    raise SystemExit(f"Expected 9 or 10 slides, got {len(prs.slides)}")
already = any(TITLE in sh.text for slide in prs.slides for sh in slide.shapes if sh.has_text_frame)
if not already:
    slide=prs.slides.add_slide(prs.slide_layouts[6])
    W,H=prs.slide_width,prs.slide_height
    # Use relative coordinates to preserve the source presentation size.
    X=lambda v: int(W*v/13.333)
    Y=lambda v: int(H*v/7.5)
    box(slide,0,0,W,H,"F8FAF8")
    box(slide,0,0,W,Y(0.13),"173F33")
    txt(slide,"FOOTMATE  /  FINANCIAL DECISION",X(.66),Y(.42),X(8),Y(.37),size=11,color="50876A",bold=True)
    txt(slide,TITLE,X(.64),Y(.9),X(12.0),Y(.63),size=30,color="173F33",bold=True)
    txt(slide,"실제 운영 성과가 아닌 사업계획 가정 · 유료 예약 12개월 지속 가정",X(.66),Y(1.57),X(12),Y(.35),size=12,color="576D60")
    cards=[
        ("보수 · 83건/월","−89.7%","연 순손익 −1,036.1만 원"),
        ("기준 · 626건/월","−47.5%","연 순손익 −814.6만 원"),
        ("확장 · 1,803건/월","−11.4%","연 순손익 −334.4만 원"),
    ]
    for i,(caption,roi,profit) in enumerate(cards):
        x=.62+i*4.24
        box(slide,X(x),Y(2.11),X(4.04),Y(1.55),"FFFFFF",True,"D9E6DC")
        txt(slide,caption,X(x+.19),Y(2.26),X(3.7),Y(.29),size=14,bold=True)
        txt(slide,roi,X(x+.16),Y(2.55),X(3.65),Y(.68),size=31,color="9B493F",bold=True)
        txt(slide,profit,X(x+.19),Y(3.24),X(3.7),Y(.31),size=12,color="576D60")
    box(slide,X(.62),Y(3.99),X(12.12),Y(1.44),"E8F0E9",True)
    txt(slide,"ROI 산출 기준",X(.83),Y(4.13),X(2.05),Y(.38),size=16,bold=True)
    txt(slide,"수수료 1,200원/건  −  변동비 860원/건  −  월 고정비 60만 원",X(2.92),Y(4.13),X(9.6),Y(.38),size=15,bold=True)
    txt(slide,"초기 구축 300만 원 + 시범비 50만 원 포함  |  ROI = 12개월 예상 순손익 ÷ 총현금비용 × 100",X(.83),Y(4.71),X(11.6),Y(.36),size=13,color="456353")
    txt(slide,"의사결정",X(.69),Y(5.75),X(1.5),Y(.38),size=15,bold=True)
    txt(slide,"3개 시나리오 모두 첫해 ROI 음수 → 제휴 수수료·결제비·공급 유지율 검증 후 확대 투자 판단",X(2.02),Y(5.74),X(10.65),Y(.71),size=15,color="173F33",bold=True)
    txt(slide,"확장 공급처 추가 관리비 반영 시 ROI −14.6%  |  인력 기회비용 제외 현금 기준, 실적 미검증",X(.72),Y(6.72),X(12),Y(.35),size=11,color="6B7B70")
    prs.save(str(DECK))
if len(Presentation(str(DECK)).slides)!=10:
    raise SystemExit("ROI presentation must contain 10 slides")

# Append a true tenth preview without changing any of the existing embedded slide screenshots.
raw=PREVIEWS.read_text(encoding="utf-8").strip()
prefix="window.REPORT_SLIDES="
if not raw.startswith(prefix):
    raise SystemExit("Unexpected web-preview asset structure")
items=json.loads(raw[len(prefix):].rstrip(";"))
if len(items)==9:
    svg="""<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
<rect width="1280" height="720" fill="#f8faf8"/><rect width="1280" height="13" fill="#173f33"/>
<g font-family="Pretendard,Malgun Gothic,sans-serif" fill="#173f33">
<text x="65" y="83" font-size="19" font-weight="700" fill="#50876a">FOOTMATE / FINANCIAL DECISION</text>
<text x="64" y="147" font-size="47" font-weight="800">12개월 예상 ROI · 투자 판단</text>
<text x="66" y="191" font-size="20" fill="#576d60">실제 운영 성과가 아닌 사업계획 가정 · 유료 예약 12개월 지속 가정</text>
</g>
<g font-family="Pretendard,Malgun Gothic,sans-serif">
<rect x="65" y="226" width="368" height="177" rx="15" fill="white" stroke="#d9e6dc"/><rect x="456" y="226" width="368" height="177" rx="15" fill="white" stroke="#d9e6dc"/><rect x="847" y="226" width="368" height="177" rx="15" fill="white" stroke="#d9e6dc"/>
<g fill="#173f33" font-size="23" font-weight="700"><text x="89" y="269">보수 · 83건/월</text><text x="480" y="269">기준 · 626건/월</text><text x="871" y="269">확장 · 1,803건/월</text></g>
<g fill="#9b493f" font-size="57" font-weight="800"><text x="89" y="343">−89.7%</text><text x="480" y="343">−47.5%</text><text x="871" y="343">−11.4%</text></g>
<g fill="#576d60" font-size="20"><text x="89" y="379">연 순손익 −1,036.1만 원</text><text x="480" y="379">연 순손익 −814.6만 원</text><text x="871" y="379">연 순손익 −334.4만 원</text></g>
<rect x="65" y="443" width="1150" height="130" rx="16" fill="#e8f0e9"/>
<text x="93" y="489" fill="#173f33" font-size="26" font-weight="700">ROI 산출 기준</text>
<text x="305" y="489" fill="#173f33" font-size="23" font-weight="700">수수료 1,200원 − 변동비 860원 − 월 고정비 60만 원</text>
<text x="93" y="543" fill="#456353" font-size="19">초기 구축 300만 + 시범비 50만 포함  |  ROI = 12개월 순손익 ÷ 총현금비용 × 100</text>
<text x="65" y="625" font-size="24" fill="#173f33" font-weight="700">의사결정</text>
<text x="200" y="625" font-size="21" fill="#173f33">첫해 ROI 음수 → 수수료·결제비·공급 유지 검증 후 확대 심사</text>
<text x="66" y="683" font-size="17" fill="#6b7b70">추가 관리비 반영 시 확장 ROI −14.6% · 인력 기회비용 제외 · 실제 사업 실적 아님</text>
</g></svg>"""
    items.append({"title":TITLE,"src":"data:image/svg+xml;charset=UTF-8,"+quote(svg,safe="")})
elif len(items)!=10 or items[-1].get("title")!=TITLE:
    raise SystemExit("Expected 9 original preview slides or prior ROI slide at position 10")
PREVIEWS.write_text(prefix+json.dumps(items,ensure_ascii=False,separators=(",",":"))+";\n",encoding="utf-8")
print("Updated PPTX and matched web preview:",len(items),"slides")
