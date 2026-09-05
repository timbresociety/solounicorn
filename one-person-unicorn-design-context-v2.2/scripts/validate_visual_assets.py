#!/usr/bin/env python3
"""Lightweight validator for OPU bitmap UI assets.

Uses Pillow when installed; otherwise performs PNG header checks.
"""
from __future__ import annotations
import struct
import sys
from pathlib import Path


def png_header(path: Path):
    data = path.read_bytes()[:33]
    if data[:8] != b"\x89PNG\r\n\x1a\n" or data[12:16] != b"IHDR":
        return None
    width, height, bit_depth, color_type = struct.unpack(">IIBB", data[16:26])
    return width, height, bit_depth, color_type


def main(paths):
    try:
        from PIL import Image  # type: ignore
    except Exception:
        Image = None

    failed = False
    for raw in paths:
        p = Path(raw)
        if not p.exists():
            print(f"MISSING {p}")
            failed = True
            continue
        if Image:
            im = Image.open(p)
            has_alpha = "A" in im.mode or "transparency" in im.info
            print(f"{p}: {im.size[0]}x{im.size[1]} mode={im.mode} alpha={has_alpha}")
            if p.suffix.lower() == ".png" and not has_alpha:
                print("  WARNING: UI icon PNG has no alpha channel/transparency metadata")
        else:
            h = png_header(p)
            if h:
                w, hgt, depth, ctype = h
                has_alpha_type = ctype in (4, 6)
                print(f"{p}: {w}x{hgt} PNG color_type={ctype} alpha-capable={has_alpha_type}")
            else:
                print(f"{p}: non-PNG or unreadable header; install Pillow for richer validation")
    return 1 if failed else 0


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: validate_visual_assets.py <asset> [asset...]")
        raise SystemExit(2)
    raise SystemExit(main(sys.argv[1:]))
