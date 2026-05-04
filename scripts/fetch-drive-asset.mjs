#!/usr/bin/env node
/**
 * Fetch a Google Drive asset from a share link and save locally.
 *
 * Usage:
 *   node scripts/fetch-drive-asset.mjs <drive-url>
 *   node scripts/fetch-drive-asset.mjs --url "https://drive.google.com/..." --out-dir ./staging
 *
 * The script:
 * 1. Extracts the file ID from the Google Drive share link
 * 2. Follows redirects to get the direct download URL
 * 3. Downloads the file to a staging directory
 * 4. Returns the local file path
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Extract file ID from various Google Drive URL formats.
 */
function extractFileId(url) {
  // Format: /file/d/{id}/view
  let match = url.match(/\/file\/d\/([^/]+)/);
  if (match) return match[1];
  
  // Format: ?id={id}
  match = url.match(/[?&]id=([^&]+)/);
  if (match) return match[1];
  
  // Format: /open?id={id}
  match = url.match(/\/open\?id=([^&]+)/);
  if (match) return match[1];
  
  throw new Error('Could not extract file ID from URL');
}

/**
 * Follow redirects and return final download URL.
 */
function resolveRedirect(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    function tryFetch(currentUrl, redirectsLeft) {
      if (redirectsLeft <= 0) {
        resolve(currentUrl);
        return;
      }
      
      const u = new URL(currentUrl);
      client.get({ ...u, method: 'HEAD' }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const nextUrl = res.headers.location.startsWith('http') 
            ? res.headers.location 
            : new URL(res.headers.location, currentUrl).href;
          tryFetch(nextUrl, redirectsLeft - 1);
        } else {
          resolve(currentUrl);
        }
      }).on('error', reject);
    }
    
    tryFetch(url, maxRedirects);
  });
}

/**
 * Download file from URL to local path.
 */
function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const client = u.protocol === 'https:' ? https : http;
    
    client.get(url, (res) => {
      // Handle Google Drive virus scan warning page
      if (res.statusCode === 200 && res.headers['content-type']?.includes('text/html')) {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf-8');
          const confirmMatch = body.match(/confirm=([^&"]+)/);
          if (confirmMatch) {
            const confirmCode = confirmMatch[1];
            const confirmUrl = new URL(url);
            confirmUrl.searchParams.set('confirm', confirmCode);
            downloadFile(confirmUrl.href, outputPath).then(resolve).catch(reject);
            return;
          }
          reject(new Error('Received HTML instead of file (may need auth or confirm param)'));
        });
        return;
      }
      
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }
      
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      
      const fileStream = fs.createWriteStream(outputPath);
      res.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(outputPath);
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Get filename from Content-Disposition header or URL.
 */
function getFilename(url, headers) {
  const disposition = headers['content-disposition'];
  if (disposition) {
    const match = disposition.match(/filename="?([^"]+)"?/);
    if (match) return match[1];
  }
  
  const u = new URL(url);
  const pathname = u.pathname;
  const basename = path.basename(pathname);
  if (basename && basename !== '/') return basename;
  
  return `drive-file-${Date.now()}`;
}

/**
 * Main function: fetch drive asset and save locally.
 */
async function fetchDriveAsset(driveUrl, outDir = null) {
  const fileId = extractFileId(driveUrl);
  
  // Construct direct download URL
  const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  
  // Resolve redirects to get final download URL
  const finalUrl = await resolveRedirect(directUrl);
  
  // Determine output directory
  const stagingDir = outDir || path.join(__dirname, 'staging');
  if (!fs.existsSync(stagingDir)) {
    fs.mkdirSync(stagingDir, { recursive: true });
  }
  
  // First request to get headers and filename
  const filename = `drive-${fileId}`;
  const outputPath = path.join(stagingDir, filename);
  
  // Download the file
  await downloadFile(finalUrl, outputPath);
  
  return {
    fileId,
    localPath: outputPath,
    stagingDir
  };
}

// CLI entrypoint
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const urlFlag = args.find(a => a.startsWith('--url='))?.split('=')[1];
  const outFlag = args.find(a => a.startsWith('--out-dir='))?.split('=')[1];
  const url = urlFlag || args.find(a => a.includes('drive.google.com'));
  const outDir = outFlag || null;
  
  if (!url) {
    console.error('Usage: node fetch-drive-asset.mjs <drive-url>');
    console.error('   or: node fetch-drive-asset.mjs --url=<url> [--out-dir=<dir>]');
    process.exit(1);
  }
  
  try {
    const result = await fetchDriveAsset(url, outDir);
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

export { fetchDriveAsset, extractFileId };
