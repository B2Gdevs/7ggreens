/**
 * Legacy Gmail Drive Link Scraper
 * 
 * Original Apps Script preserved as canonical Drive-link extractor.
 * This was used to scrape Gmail messages with subject 'Item shared with you'
 * and extract Google Drive links into a Google Sheet.
 * 
 * To port to TypeScript for the integration adapter, see:
 * - scripts/import-from-sheet.mjs (sheet fetcher)
 * - scripts/fetch-drive-asset.mjs (drive asset downloader)
 */

function exportSharedLinks() {
  const query = 'subject:"Item shared with you"';
  const maxThreads = 500;
  const sheet = SpreadsheetApp.getActive().getActiveSheet();
  sheet.clearContents();
  sheet.getRange(1, 1, 1, 4).setValues([['Date', 'From', 'Subject', 'Link']]);
  const threads = GmailApp.search(query, 0, maxThreads);
  let row = 2;
  threads.forEach(thread => {
    const messages = thread.getMessages();
    messages.forEach(msg => {
      const body = msg.getBody();
      const plain = msg.getPlainBody();
      let link = extractDriveLink(body) || extractDriveLink(plain) || extractFirstHttpLink(body) || extractFirstHttpLink(plain);
      if (link) {
        sheet.getRange(row, 1, 1, 4).setValues([[msg.getDate(), msg.getFrom(), msg.getSubject(), link]]);
        row++;
      }
    });
  });
}

function extractDriveLink(text) { 
  if (!text) return null; 
  const re = /https:\/\/drive\.google\.com\/[^\s"'<>()]+/i; 
  const m = text.match(re); 
  return m ? m[0] : null; 
}

function extractFirstHttpLink(text) { 
  if (!text) return null; 
  const re = /https:\/\/[^\s"'<>()]+/i; 
  const m = text.match(re); 
  return m ? m[0] : null; 
}
