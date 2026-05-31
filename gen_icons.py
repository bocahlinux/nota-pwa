import struct, zlib, os

def create_png(w, h, r, g, b):
    raw = b''
    for y in range(h):
        raw += b'\x00'
        for x in range(w):
            raw += bytes([r, g, b, 255])
    def chunk(t, d):
        c = t + d
        return struct.pack('>I', len(d)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0))
    idat = chunk(b'IDAT', zlib.compress(raw))
    return sig + ihdr + idat + chunk(b'IEND', b'')

base = os.path.join(os.path.dirname(__file__), 'frontend', 'public', 'icons')
os.makedirs(base, exist_ok=True)

with open(os.path.join(base, 'icon-192.png'), 'wb') as f:
    f.write(create_png(192, 192, 30, 41, 59))

with open(os.path.join(base, 'icon-512.png'), 'wb') as f:
    f.write(create_png(512, 512, 30, 41, 59))

print('Icons created successfully')
