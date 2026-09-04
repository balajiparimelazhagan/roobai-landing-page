/**
 * Roobai waitlist endpoint — Google Apps Script.
 *
 * Appends { email, timestamp } to the existing Google Sheet:
 *   https://docs.google.com/spreadsheets/d/1OZVI4-HHuBzulDXnu0i7LSw9mo_sjUrRc3IRNTzrMT8/edit
 * matching its two columns (Email, Timestamp). Skips duplicates.
 *
 * Setup steps are in SETUP.md next to this file.
 */

var SHEET_ID = '1OZVI4-HHuBzulDXnu0i7LSw9mo_sjUrRc3IRNTzrMT8';
var SHEET_NAME = '';          // leave '' to use the first tab; else put the tab name
var EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch (_) { data = e.parameter || {}; }
    } else {
      data = (e && e.parameter) || {};
    }

    var email = String(data.email || '').trim().toLowerCase();
    var honeypot = String(data.company || '').trim();

    if (honeypot) return json({ result: 'ok' });                 // bot — drop silently
    if (!EMAIL_RE.test(email)) return json({ result: 'error', message: 'invalid email' });

    var lock = LockService.getScriptLock();
    lock.waitLock(5000);
    try {
      var ss = SpreadsheetApp.openById(SHEET_ID);
      var sheet = (SHEET_NAME && ss.getSheetByName(SHEET_NAME)) || ss.getSheets()[0];

      var last = sheet.getLastRow();
      var known = last > 0
        ? sheet.getRange(1, 1, last, 1).getValues().map(function (r) {
            return String(r[0] || '').trim().toLowerCase();
          })
        : [];

      if (known.indexOf(email) === -1) {
        sheet.appendRow([email, new Date()]);
      }
    } finally {
      lock.releaseLock();
    }
    return json({ result: 'ok' });
  } catch (err) {
    return json({ result: 'error', message: String(err) });
  }
}

function doGet() {
  return json({ result: 'ok', note: 'roobai waitlist endpoint is live' });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
