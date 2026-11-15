#!/usr/bin/env python3
"""Restore exact v7.41 media from its archive or an explicitly selected host."""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import sys
from urllib.parse import quote, urlparse
from urllib.request import urlopen
import zipfile

ROOT = Path(__file__).resolve().parent.parent


def checked_path(name):
    relative = PurePosixPath(name)
    if relative.is_absolute() or '..' in relative.parts or '\\' in name:
        raise ValueError('Unsafe media path')
    destination = (ROOT / name).resolve()
    if not destination.is_relative_to(ROOT):
        raise ValueError('Media path escapes repository')
    return destination


def matches(data, entry):
    return len(data) == entry['size'] and hashlib.sha256(data).hexdigest() == entry['sha256']


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument('--archive', type=Path)
    source.add_argument('--base-url')
    args = parser.parse_args()
    if args.base_url:
        parsed = urlparse(args.base_url)
        if parsed.scheme != 'https' or not parsed.netloc or parsed.query or parsed.fragment:
            parser.error('--base-url must be an HTTPS URL without a query or fragment')
    manifest = json.loads((ROOT / 'media-manifest.json').read_text())
    archive = zipfile.ZipFile(args.archive) if args.archive else None
    restored = skipped = failed = 0
    try:
        for entry in manifest['files']:
            name = entry['path']
            destination = checked_path(name)
            if destination.is_file() and matches(destination.read_bytes(), entry):
                skipped += 1
                continue
            try:
                if archive:
                    data = archive.read(name)
                else:
                    url = args.base_url.rstrip('/') + '/' + quote(name, safe='/')
                    with urlopen(url, timeout=30) as response:
                        data = response.read(entry['size'] + 1)
                if not matches(data, entry):
                    raise ValueError('size or SHA-256 differs from v7.41')
                destination.parent.mkdir(parents=True, exist_ok=True)
                temp = destination.with_name(destination.name + '.restore-tmp')
                temp.write_bytes(data)
                temp.replace(destination)
                restored += 1
            except Exception as error:
                failed += 1
                print(f'FAILED {name}: {error}', file=sys.stderr)
    finally:
        if archive:
            archive.close()
    print(f'Restored {restored}; already verified {skipped}; failed {failed}.')
    return 1 if failed else 0


if __name__ == '__main__':
    raise SystemExit(main())
