"""Cuts the self-hosted variable fonts down to the axis ranges the site's CSS actually uses.

The source fonts in fonts-src/ are already subset to the characters the site needs. This script limits
their variable axes (and pins Newsreader's optical-size axis), which removes most of the font data:
about 360 KiB down to about 120 KiB across the three files. Output goes to public/fonts/ under new file
names, because /fonts/* is cached as immutable.

Run it after changing font weights or widths in src/assets/site.css, then update the @font-face rules
and the preload links in src/pages.mjs to match:
    python3 -m venv .venv && .venv/bin/pip install fonttools brotli
    .venv/bin/python scripts/slim-fonts.py
"""
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent

# (source, output, axis limits). A range keeps the axis variable; a number pins it.
FONTS = [
    # Headings and UI: weights 400 to 800 and widths 100% to 125% appear in site.css.
    ("archivo.woff2", "archivo-v2.woff2", {"wght": (400, 800), "wdth": (100, 125)}),
    # Body text: regular and bold. Optical size pinned to body-text size (about 18px).
    ("newsreader.woff2", "newsreader-v2.woff2", {"wght": (400, 700), "opsz": 18}),
    # Irish place names and captions: only ever italic 400, at 12px to 30px.
    ("newsreader-italic.woff2", "newsreader-italic-v2.woff2", {"wght": 400, "opsz": 20}),
]

for src, out, limits in FONTS:
    font = instancer.instantiateVariableFont(TTFont(ROOT / "fonts-src" / src), limits)
    font.flavor = "woff2"
    dest = ROOT / "public" / "fonts" / out
    font.save(dest)
    print(f"{src}: {(ROOT / 'fonts-src' / src).stat().st_size:,} -> {dest.stat().st_size:,} bytes ({out})")
