"""Extract 3 source .docx files into markdown for the 7greens project.

Output: sites/7greens/.planning/research/copy/<slug>.md
"""
import os
import re
import sys
from pathlib import Path

import docx

DOWNLOADS = Path(r"C:\Users\benja\Downloads")
OUT = Path(__file__).resolve().parent.parent / ".planning" / "research" / "copy"

SOURCES = [
    ("Keeping It Fresh - Field to Family.docx", "field-to-family.md"),
    ("Web Photos.docx", "web-photos.md"),
    ("UPAEC WEB PAGE INFO.docx", "upaec-web-page-info.md"),
]


def style_to_md(name: str, text: str) -> str:
    if not text.strip():
        return ""
    lname = (name or "").lower()
    if lname.startswith("heading 1") or lname == "title":
        return f"# {text}"
    if lname.startswith("heading 2"):
        return f"## {text}"
    if lname.startswith("heading 3"):
        return f"### {text}"
    if lname.startswith("heading 4"):
        return f"#### {text}"
    if "list" in lname:
        return f"- {text}"
    return text


def runs_to_md(para) -> str:
    parts = []
    for r in para.runs:
        t = r.text or ""
        if not t:
            continue
        if r.bold and r.italic:
            parts.append(f"***{t}***")
        elif r.bold:
            parts.append(f"**{t}**")
        elif r.italic:
            parts.append(f"*{t}*")
        else:
            parts.append(t)
    return "".join(parts)


def extract(src: Path, out: Path, assets_dir: Path) -> None:
    if not src.exists():
        print(f"SKIP missing {src}", file=sys.stderr)
        return
    d = docx.Document(str(src))
    lines = [f"<!-- source: {src.name} -->", f"# {src.stem}", ""]
    for para in d.paragraphs:
        text = runs_to_md(para)
        styled = style_to_md(getattr(para.style, "name", ""), text)
        if styled:
            lines.append(styled)
        else:
            lines.append("")
    slug = out.stem
    image_index = []
    i = 0
    for rel in d.part.rels.values():
        if "image" not in rel.reltype:
            continue
        i += 1
        ext = os.path.splitext(rel.target_ref)[1] or ".bin"
        image_name = f"{slug}-{i:02d}{ext}"
        image_path = assets_dir / image_name
        image_path.parent.mkdir(parents=True, exist_ok=True)
        image_path.write_bytes(rel.target_part.blob)
        image_index.append(image_name)
    if image_index:
        lines.append("")
        lines.append("## Embedded images")
        for name in image_index:
            lines.append(f"- `assets/{name}`")
    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"WROTE {out.relative_to(out.parents[3])} ({len(lines)} lines, {len(image_index)} images extracted)")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    assets = OUT / "assets"
    assets.mkdir(parents=True, exist_ok=True)
    for src_name, out_name in SOURCES:
        extract(DOWNLOADS / src_name, OUT / out_name, assets)


if __name__ == "__main__":
    main()
