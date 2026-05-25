const fs   = require('fs');
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

  console.log('📡 Fetching all pages from Blogger API...');
  const res = await blogger.pages.list({ blogId: BLOG_ID });
  const pages = res.data.items || [];
  
  console.log(`\nFound ${pages.length} Pages:\n`);
  pages.forEach((page, i) => {
    console.log(`[${i + 1}] ID: ${page.id}`);
    console.log(`    Title: ${page.title}`);
    console.log(`    URL: ${page.url}`);
    console.log(`    Created: ${page.published}`);
    console.log('-'.repeat(40));
  });
}

main().catch(console.error);
