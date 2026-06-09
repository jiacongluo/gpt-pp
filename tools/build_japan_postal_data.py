#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import gzip
import json
import zipfile
from pathlib import Path


def normalize_postal_code(value: str) -> str:
    digits = "".join(ch for ch in str(value or "") if ch.isdigit())
    if len(digits) != 7:
        return ""
    return f"{digits[:3]}-{digits[3:]}"


def iter_postal_rows(zip_path: Path):
    with zipfile.ZipFile(zip_path) as archive:
        csv_names = [name for name in archive.namelist() if name.lower().endswith(".csv")]
        if not csv_names:
            raise SystemExit(f"No CSV found in {zip_path}")
        with archive.open(csv_names[0]) as fh:
            lines = (line.decode("utf-8-sig") for line in fh)
            for row in csv.reader(lines):
                if len(row) < 9:
                    continue
                postal_code = normalize_postal_code(row[2])
                town = row[8].strip()
                if not postal_code or town == "以下に掲載がない場合":
                    continue
                yield {
                    "postal_code": postal_code,
                    "prefecture": row[6].strip(),
                    "city": row[7].strip(),
                    "town": town,
                    "prefecture_kana": row[3].strip(),
                    "city_kana": row[4].strip(),
                    "town_kana": row[5].strip(),
                }


def main() -> int:
    parser = argparse.ArgumentParser(description="Build local Japanese postal address JSONL gzip data.")
    parser.add_argument("zip_path", type=Path, help="Official Japan Post UTF-8 KEN_ALL zip")
    parser.add_argument("output", type=Path, help="Output .jsonl.gz path")
    args = parser.parse_args()

    args.output.parent.mkdir(parents=True, exist_ok=True)
    count = 0
    prefectures: set[str] = set()
    with gzip.open(args.output, "wt", encoding="utf-8") as out:
        for row in iter_postal_rows(args.zip_path):
            out.write(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n")
            prefectures.add(row["prefecture"])
            count += 1
    print(f"wrote {count} rows across {len(prefectures)} prefectures to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
