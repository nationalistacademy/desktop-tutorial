const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const BLOG_ID          = '8115094349902559510';
const HTML_DIR         = 'c:/Users/LENOVO/Downloads/Stitich';
const CREDENTIALS_FILE = path.join(HTML_DIR, 'client_secret.json');
const TOKEN_FILE       = path.join(HTML_DIR, 'token.json');

async function main() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8')));
  const blogger = google.blogger({ version: 'v3', auth: oAuth2Client });

  const targetIds = ['5157143924761403648', '7737743625819620161'];
  
  for (const id of targetIds) {
    try {
      console.log(`📡 Fetching page by ID: ${id}...`);
      const res = await blogger.pages.get({
        blogId: BLOG_ID,
        pageId: id
      });
      console.log(`🎉 Found!`);
      console.log(`Title: ${res.data.title}`);
      console.log(`URL: ${res.data.url}`);
      console.log(`Status: ${res.data.status}`);
      console.log('-'.repeat(40));
    } catch (e) {
      console.log(`❌ Page ${id} could not be fetched: ${e.message}`);
    }
  }
}

main().catch(console.error);
