# Generate simple solid-color PNG icons (no external deps beyond stdlib+optional pillow)
from pathlib import Path
import struct
import zlib

OUT = Path(__file__).resolve().parent / "icons"
OUT.mkdir(parents=True, exist_ok=True)


def png_rgba(size: int, rgba=(30, 90, 160, 255)) -> bytes:
    r, g, b, a = rgba
    raw = b""
    for y in range(size):
        raw += b"\x00"
        for x in range(size):
            # rounded-ish: transparent corners
            m = size * 0.12
            if x < m and y < m and (m - x) ** 2 + (m - y) ** 2 > m * m:
                raw += b"\x00\x00\x00\x00"
            elif x > size - m and y < m and (x - (size - m)) ** 2 + (m - y) ** 2 > m * m:
                raw += b"\x00\x00\x00\x00"
            elif x < m and y > size - m and (m - x) ** 2 + (y - (size - m)) ** 2 > m * m:
                raw += b"\x00\x00\x00\x00"
            elif x > size - m and y > size - m and (x - (size - m)) ** 2 + (y - (size - m)) ** 2 > m * m:
                raw += b"\x00\x00\x00\x00"
            else:
                raw += bytes((r, g, b, a))
    compressed = zlib.compress(raw, 9)

    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", compressed) + chunk(b"IEND", b"")


for s in (16, 32, 48, 128):
    path = OUT / f"icon{s}.png"
    path.write_bytes(png_rgba(s))
    print("wrote", path, path.stat().st_size)
