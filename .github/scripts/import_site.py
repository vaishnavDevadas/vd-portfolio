"""Import the published portfolio byte-for-byte into this repository."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from hashlib import sha256
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen
import time

BASE = 'https://vaishnav-devadas-portfolio.vaishnav-ykol.chatgpt.site/'
ROOT = Path('site')
items = []
for line in Path('site-manifest.tsv').read_text().splitlines():
    digest, path = line.split('\t', 1)
    if Path(path).is_absolute() or '..' in Path(path).parts:
        raise ValueError(f'Invalid portfolio path: {path}')
    items.append((digest, path))


def fetch(item):
    digest, path = item
    target = ROOT / path
    if target.exists() and sha256(target.read_bytes()).hexdigest() == digest:
        return path
    url = BASE + quote(path, safe='/')
    for attempt in range(4):
        try:
            with urlopen(Request(url, headers={'User-Agent': 'VD-portfolio-migration/1.0'}), timeout=90) as response:
                data = response.read()
            if sha256(data).hexdigest() != digest:
                raise ValueError(f'Checksum mismatch for {path}')
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
            return path
        except Exception:
            if attempt == 3:
                raise
            time.sleep(2 ** attempt)


with ThreadPoolExecutor(max_workers=6) as pool:
    for future in as_completed([pool.submit(fetch, item) for item in items]):
        print('Verified', future.result(), flush=True)
(ROOT / '.nojekyll').touch()
assert (ROOT / 'index.html').exists()
assert len(items) == 166
print('All 166 portfolio files verified.')
