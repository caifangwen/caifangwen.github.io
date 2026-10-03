"""Cache site favicons and the university's official logo for the portfolio."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import re
import json
from urllib.parse import urlparse
from urllib.request import Request, urlopen

root = Path(__file__).resolve().parents[1]
destination = root / 'public' / 'images' / 'portfolio'
destination.mkdir(parents=True, exist_ok=True)
links = (root / 'src' / 'data' / 'tool-links.ts').read_text(encoding='utf-8')
domains = sorted(set(urlparse(url).hostname for url in re.findall(r"'((?:https://)[^']+)'", links)))


def fetch(item):
    url, domain = item
    cached = list(destination.glob(f'{domain}.*'))
    if cached:
        return domain, f'/images/portfolio/{cached[0].name}'
    request = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urlopen(request, timeout=20) as response:
            image = response.read()
    except Exception:
        with urlopen(f'https://icons.duckduckgo.com/ip3/{domain}.ico', timeout=20) as response:
            image = response.read()
    if image.startswith(b'\x89PNG\r\n\x1a\n'):
        extension = 'png'
    elif image.startswith(b'\xff\xd8\xff'):
        extension = 'jpg'
    elif image.startswith(b'\x00\x00\x01\x00'):
        extension = 'ico'
    else:
        raise ValueError(f'Not an image: {url}')
    filename = f'{domain}.{extension}'
    (destination / filename).write_bytes(image)
    return domain, f'/images/portfolio/{filename}'


jobs = [(f'https://www.google.com/s2/favicons?domain={domain}&sz=64', domain) for domain in domains]
jobs.append(('https://www.zjgsu.edu.cn/images/logo.png', 'zjgsu-logo'))
with ThreadPoolExecutor(max_workers=6) as pool:
    pending = {pool.submit(fetch, item): item[1] for item in jobs}
    icons = {}
    failures = []
    for future in as_completed(pending):
        try:
            domain, image_path = future.result()
            icons[domain] = image_path
        except Exception as error:
            failures.append((pending[future], str(error)))
    if failures:
        raise RuntimeError(f'Failed image downloads: {failures}')
(root / 'src' / 'data' / 'site-icons.json').write_text(json.dumps(icons, indent=2) + '\n', encoding='utf-8')
print(f'Downloaded {len(icons)} images.')
