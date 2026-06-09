# Japan Postal Address Data

`japan_postal_areas.jsonl.gz` is a runtime-local address index generated from Japan Post's official UTF-8 nationwide postal code CSV.

Source page:

```text
https://www.post.japanpost.jp/service/search/zipcode/download/utf-zip.html
```

Regenerate after downloading the official nationwide zip:

```bash
.venv/bin/python tools/build_japan_postal_data.py /path/to/utf_ken_all.zip webapp/data/japan_postal_areas.jsonl.gz
```

Runtime does not call Japan Post or any external address API.
