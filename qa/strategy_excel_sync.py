#!/usr/bin/env python3
"""FootMate Excel source audit: read only. Print existing cells and formula references."""
import re,sys
from zipfile import ZipFile
from xml.etree import ElementTree as ET
from pathlib import Path
P=Path("src/case-study/downloads/footmate_model.xlsx")
N="{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
R="{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
RP="{http://schemas.openxmlformats.org/package/2006/relationships}"
def as_text(cell, shared):
    v=cell.find(N+"v")
    f=cell.find(N+"f")
    if f is not None:
        return "="+(f.text or "")+(" [cache="+(v.text if v is not None and v.text else "?")+"]")
    if cell.attrib.get("t")=="inlineStr":
        return "".join(x.text or "" for x in cell.findall(".//"+N+"t"))
    if v is None:return ""
    if cell.attrib.get("t")=="s":
        try:return shared[int(v.text)]
        except:return "INVALID_SHARED"
    return v.text or ""
with ZipFile(P) as z:
    sheets=ET.fromstring(z.read("xl/workbook.xml")).find(N+"sheets")
    rels=ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
    byid={r.attrib["Id"]:r.attrib["Target"].lstrip("/") for r in rels}
    shared=[]
    if "xl/sharedStrings.xml" in z.namelist():
        x=ET.fromstring(z.read("xl/sharedStrings.xml"))
        shared=["".join(t.text or "" for t in si.findall(".//"+N+"t")) for si in x.findall(N+"si")]
    styles=ET.fromstring(z.read("xl/styles.xml"))
    fonts=styles.find(N+"fonts")
    print("FOOTMATE SOURCE",P.stat().st_size,"bytes","fonts",["".join(n.attrib.get("val","") for n in font.findall(N+"name")) for font in fonts] if fonts is not None else [])
    for sh in sheets:
        rid=sh.attrib[R+"id"]
        raw=byid[rid]
        path=raw if raw.startswith("xl/") else "xl/"+raw
        root=ET.fromstring(z.read(path))
        values={}
        errors=[]
        formulas=0
        for c in root.findall(".//"+N+"sheetData/"+N+"row/"+N+"c"):
            a=c.attrib["r"]
            values[a]=as_text(c,shared)
            if c.find(N+"f") is not None:formulas+=1
            if c.attrib.get("t")=="e":errors.append(a)
        print("=== SHEET",sh.attrib["name"],path,"formulas",formulas,"cells",len(values),"errors",errors,"===")
        for row in range(1,47):
            cells=[f"{col}{row}={values.get(f'{col}{row}','')}" for col in "ABCDE" if values.get(f"{col}{row}","")]
            if cells: print(" | ".join(cells)[:390])
