# Media Intake from Google Sheets

How to import media assets from the operator's pre-scraped Google Sheet into local staging.

## Prerequisites

- Google Sheet URL with columns: `Date`, `From`, `Subject`, `Link`
- Sheet must be accessible (shared or public read) so the gviz CSV endpoint works
- Node.js 18+ (for ES module support in the scripts)

## Scripts Overview

Three scripts handle the intake pipeline:

| Script | Purpose |
|--------|---------|
| `scripts/legacy-gmail-scrape.gs` | Original Apps Script (historical reference) |
| `scripts/import-from-sheet.mjs` | Fetch sheet as CSV → parse → output JSON |
| `scripts/fetch-drive-asset.mjs` | Download a Drive asset from a share link |

## Step-by-Step

### 1. Import entries from the sheet

```bash
node scripts/import-from-sheet.mjs "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit?gid=0"
```

Or with the `--url` flag:

```bash
node scripts/import-from-sheet.mjs --url "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit?gid=0"
```

Output is JSON array:

```json
[
  {
    "date": "2026-05-01",
    "from": "sender@example.com",
    "subject": "Item shared with you: IMG_1234.jpg",
    "drive_link": "https://drive.google.com/file/d/ABC123/view"
  }
]
```

### 2. Download a single asset

```bash
node scripts/fetch-drive-asset.mjs --url "https://drive.google.com/file/d/ABC123/view" --out-dir ./staging
```

Or just the URL (defaults to `scripts/staging/`):

```bash
node scripts/fetch-drive-asset.mjs "https://drive.google.com/file/d/ABC123/view"
```

Output:

```json
{
  "fileId": "ABC123",
  "localPath": "/path/to/scripts/staging/drive-ABC123",
  "stagingDir": "/path/to/scripts/staging"
}
```

### 3. Batch download (manual loop)

Pipe the import output to download each asset:

```bash
node scripts/import-from-sheet.mjs "$SHEET_URL" | \
  jq -r '.[].drive_link' | \
  xargs -I {} node scripts/fetch-drive-asset.mjs --url "{}" --out-dir ./staging
```

Or in PowerShell:

```powershell
node scripts/import-from-sheet.mjs "$env:SHEET_URL" | ConvertFrom-Json | ForEach-Object { node scripts/fetch-drive-asset.mjs --url $_.drive_link --out-dir ./staging }
```

## Notes

- The sheet is fetched via the [Google Visualization API CSV endpoint](https://developers.google.com/chart/interactive/docs/querylanguage) — no auth needed if the sheet is shared "Anyone with the link can view".
- Drive share links redirect; the script follows redirects and handles the Google Drive virus-scan confirmation page automatically.
- Files land in `scripts/staging/` by default. Override with `--out-dir`.
- Tagging, labeling, and Supabase Storage upload are out of scope for this intake bridge — see Phase 120.

## Historical Reference

The original Gmail scraper (Apps Script) is preserved at `scripts/legacy-gmail-scrape.gs`. It was used to build the sheet by searching Gmail for `subject:"Item shared with you"` and extracting Drive links from message bodies.
