#!/usr/bin/env python3
"""Synchronize only slide 10 with the final Case Study investment conclusion.

Use existing PPT shape locations, sizes, Pretendard font attributes and colors;
render the updated PPTX and replace only image #10 in the website preview.
"""
from pathlib import Path
import base64
import io
import json
import subprocess
import tempfile

import pymupdf
from PIL import Image
from pptx import Presentation

ROOT=Path(__file__).resolve().parents[1]
PPTX=ROOT/'src/case-study/downloads/footmate_report.pptx'
PREVIEW=ROOT/'src/case-study/report-previews.js'
p=Presentation(str(PPTX))
assert len(p.slides)==10
slide=p.slides[9]
before9=[x.slide_id for x in p.slides[:9]]
new_title='최종 판단 · 단계적 투자'
new_headline='운영자 제휴형 우선 · 수수료·결제비 복합 협상'
new_lines=[
  '건당 공헌이익·플랫폼 예약 비중·재참가 확인',
  '취소·고객지원비 포함 손익 및 예상 ROI 재산정',
  '공급 계약·수익성 기준 충족 후 단계적 투자 확대',
]

def replace_para(paragraph, text):
    runs=paragraph.runs
    if not runs:
        r=paragraph.add_run()
        r.text=text
        r.font.name='Pretendard'
    else:
        runs[0].text=text
        runs[0].font.name='Pretendard'
        for r in runs[1:]:r.text=''

def replace_shape(shape, value):
    frame=shape.text_frame
    paras=frame.paragraphs
    lines=value.split('\n')
    if len(lines)>1 and len(paras)==len(lines):
        for para, text in zip(paras,lines):replace_para(para,text)
    else:
        replace_para(paras[0],value)
        for para in paras[1:]:
            for run in para.runs:run.text=''

for idx,shape in enumerate(slide.shapes):
    if shape.has_text_frame:
        print('SHAPE',idx,'paragraphs',len(shape.text_frame.paragraphs),'text',repr(shape.text[:280]))

title_count=head_count=body_count=0
for shape in slide.shapes:
    if not shape.has_text_frame: continue
    t=shape.text.strip()
    if t=='의사결정 메모':
        replace_shape(shape,new_title);title_count+=1
    elif '제휴형을 우선 검토' in t:
        replace_shape(shape,new_headline);head_count+=1
    elif '건당 공헌이익' in t and ('취소' in t or '수익성 개선' in t):
        replace_shape(shape,'\n'.join(new_lines));body_count=3
    elif '건당 공헌이익' in t:
        replace_shape(shape,new_lines[0]);body_count+=1
    elif '취소와 고객지원' in t or ('고객지원' in t and '월 손익' in t):
        replace_shape(shape,new_lines[1]);body_count+=1
    elif '수익성 개선 조건' in t:
        replace_shape(shape,new_lines[2]);body_count+=1

if (title_count,head_count,body_count)!=(1,1,3):
    raise RuntimeError(f'Unrecognized slide-10 textbox layout: title={title_count}, headline={head_count}, lines={body_count}')
p.save(str(PPTX))
verify=Presentation(str(PPTX))
assert len(verify.slides)==10
assert [x.slide_id for x in verify.slides[:9]]==before9
s10='\n'.join(s.text for s in verify.slides[9].shapes if s.has_text_frame)
for expected in [new_title,new_headline,*new_lines]:
    assert expected in s10,expected

# Regenerate web image from the actual PPTX, with no changes to slides 1–9.
with tempfile.TemporaryDirectory(prefix='footmate-conclusion-') as tmp:
    directory=Path(tmp)
    cmd=['libreoffice','-env:UserInstallation=file:///tmp/footmate-conclusion-lo','--headless','--convert-to','pdf:impress_pdf_Export','--outdir',str(directory),str(PPTX)]
    done=subprocess.run(cmd,text=True,capture_output=True,timeout=180)
    pdf=directory/(PPTX.stem+'.pdf')
    if done.returncode or not pdf.is_file():
        raise RuntimeError(f'PPT preview conversion failed: {done.stdout} {done.stderr}')
    doc=pymupdf.open(str(pdf))
    assert len(doc)==10
    image=Image.open(io.BytesIO(doc[9].get_pixmap(matrix=pymupdf.Matrix(4/3,4/3),alpha=False).tobytes('png'))).convert('RGB')
    if image.size!=(1280,720):
        image=image.resize((1280,720),Image.Resampling.LANCZOS)
    buf=io.BytesIO()
    image.save(buf,format='PNG',optimize=True)

raw=PREVIEW.read_text(encoding='utf-8').strip()
prefix='window.REPORT_SLIDES='
assert raw.startswith(prefix)
slides=json.loads(raw[len(prefix):].rstrip(';'))
assert len(slides)==10
assert slides[8]['title']=='12개월 예상 ROI'
assert slides[9]['title']=='의사결정 메모'
first9=[(e['title'],e['src']) for e in slides[:9]]
slides[9]={'title':new_title,'src':'data:image/png;base64,'+base64.b64encode(buf.getvalue()).decode('ascii')}
assert [(e['title'],e['src']) for e in slides[:9]]==first9
PREVIEW.write_text(prefix+json.dumps(slides,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print('PASS slide-10 decision copy and regenerated preview, slides 1–9 unchanged')
