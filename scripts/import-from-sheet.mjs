#!/usr/bin/env node
/**
 * Import media entries from a pre-scraped Google Sheet.
 *
 * Usage:
 *   node scripts/import-from-sheet.mjs <sheet-url>
 *   node scripts/import-from-sheet.mjs --url "https://docs.google.com/spreadsheets/..."
 *
 * The sheet must have columns: Date, From, Subject, Link
 * where Link is a drive.google.com URL.
 *
 * Output: JSON array of {date, from, subject, drive_link} entries.
 */

import https from 'https';
import http from 'http';
import { URL } from 'url';

/**
 * Extract spreadsheet ID and gid from a Google Sheets URL.
 */
function parseSheetUrl(url) {
  const u = new URL(url);
  // Format: /d/{id}/edit?gid={gid}
  const match = u.pathname.match(/\/d\/([^/]+)/);
  if (!match) throw new Error('Invalid Google Sheets URL');
  const spreadsheetId = match[1];
  const gid = u.searchParams.get('gid') || '0';
  return { spreadsheetId, gid };
}

/**
 * Fetch CSV from Google Sheets gviz endpoint.
 */
function fetchCsv(sheetUrl) {
  return new Promise((resolve, reject) => {
    const { spreadsheetId, gid } = parseSheetUrl(sheetUrl);
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
    
    const url = new URL(csvUrl);
    const client = url.protocol === 'https:' ? https : http;
    
    client.get(csvUrl, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }
      
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Parse CSV text into array of objects.
 * Handles quoted fields and commas inside quotes.
 */
function parseCsv(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = parseCsvLine(lines[0]);
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      row[h.toLowerCase().replace(/\s+/g, '_')] = values[idx] || '';
    });
    rows.push(row);
  }
  
  return rows;
}

/**
 * Parse a single CSV line handling quoted fields.
 */
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Main import function.
 */
async function importFromSheet(sheetUrl) {
  const csvText = await fetchCsv(sheetUrl);
  const rows = parseCsv(csvText);
  
  const entries = rows
    .filter(row => row.link || row.drive_link)
    .map(row => ({
      date: row.date || '',
      from: row.from || '',
      subject: row.subject || '',
      drive_link: row.link || row.drive_link || ''
    }))
    .filter(e => e.drive_link.includes('drive.google.com'));
  
  return entries;
}

// CLI entrypoint
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const urlFlag = args.find(a => a.startsWith('--url='))?.split('=')[1];
  const url = urlFlag || args.find(a => a.includes('docs.google.com'));
  
  if (!url) {
    console.error('Usage: node import-from-sheet.mjs <sheet-url>');
    console.error('   or: node import-from-sheet.mjs --url=<sheet-url>');
    process.exit(1);
  }
  
  try {
    const entries = await importFromSheet(url);
    console.log(JSON.stringify(entries, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

export { importFromSheet, parseSheetUrl };
