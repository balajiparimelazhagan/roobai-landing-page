# Waitlist capture — setup (~15 minutes, no server)

The landing page form (`#waitlist-form` in `index.html`) POSTs the email to a
Google Apps Script Web App, which appends a row to the existing sheet:

<https://docs.google.com/spreadsheets/d/1OZVI4-HHuBzulDXnu0i7LSw9mo_sjUrRc3IRNTzrMT8/edit>

The sheet already has two columns — **Email**, **Timestamp** — and the script
appends in that exact shape, so nothing about the sheet changes.

## 1. Create the script

1. Open the sheet → **Extensions → Apps Script**.
2. Delete the sample `Code.gs` contents, paste everything from `Code.gs` in this
   folder, **Save** (disk icon).

## 2. Deploy it as a Web App

1. **Deploy → New deployment**.
2. Gear icon next to "Select type" → **Web app**.
3. Set:
   - **Description:** `roobai waitlist`
   - **Execute as:** **Me**
   - **Who has access:** **Anyone**   ← must be "Anyone", not "Anyone with Google account"
4. **Deploy** → approve the permission prompt (it's your own script writing to your own sheet).
5. Copy the **Web app URL**. It looks like
   `https://script.google.com/macros/s/AKfy...../exec`

Quick test: paste that URL in a browser — you should see
`{"result":"ok","note":"roobai waitlist endpoint is live"}`.

## 3. Point the landing page at it

In `index.html`, near the bottom, find:

```js
var WAITLIST_ENDPOINT = "PASTE_APPS_SCRIPT_WEB_APP_URL";
```

Replace the string with the `/exec` URL from step 2. Save, then re-upload
`index.html` to Hostinger `public_html/`.

## 4. Verify

Submit the form on the live site with a test address, then check the sheet — a
new row (email + timestamp) should appear within a second or two. Duplicates are
ignored. The hidden `company` field is a spam honeypot; real users never see it.

## Updating the script later

If you edit `Code.gs`, redeploy with **Deploy → Manage deployments → (edit,
pencil) → Version: New version → Deploy**. The URL stays the same — no need to
touch `index.html` again.

---

## Alternatives considered

| Option | Why not |
| --- | --- |
| **Google Form** feeding the sheet | Simplest no-code, but a Form writes its own column layout and its own sheet tab; you'd move away from the current sheet, and styling the page's own form to post to a Form's `formResponse` endpoint is hackier than this script. |
| **Formspree / Getform / SheetDB** | Fastest to wire, but free tiers cap submissions (Formspree ~50/mo, SheetDB ~500/mo) and add a third party in the path. |
| **Your app's backend server** | Doable, but means a new public endpoint, CORS config, and a deploy — and it mixes marketing signups into the product database. More moving parts for the same result. |

Apps Script wins here: free, no caps, no server, writes straight to the sheet
you already use.
