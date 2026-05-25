const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const BLOG_ID = '8115094349902559510';
const HTML_DIR = 'c:/Users/LENOVO/Downloads/Stitich';
const CREDENTIALS_FILE = path.join(HTML_DIR, 'client_secret.json');
const TOKEN_FILE = path.join(HTML_DIR, 'token.json');

async function main() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  if (!fs.existsSync(TOKEN_FILE)) {
    console.error('token.json not found!');
    process.exit(1);
  }

  const token = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
  oAuth2Client.setCredentials(token);

  const blogger = google.blogger({ version: 'v3', auth: oAuth2Client });

  console.log('--- PAGES ---');
  const pagesRes = await blogger.pages.list({ blogId: BLOG_ID });
  const pages = pagesRes.data.items || [];
  for (const page of pages) {
    console.log(`Page: "${page.title}" | ID: ${page.id} | URL: ${page.url}`);
  }

  console.log('\n--- DRAFT POSTS ---');
  const draftsRes = await blogger.posts.list({
    blogId: BLOG_ID,
    status: ['draft'],
    maxResults: 150
  });
  const drafts = draftsRes.data.items || [];
  console.log(`Found ${drafts.length} draft posts.`);
  for (const draft of drafts) {
    console.log(`Draft: "${draft.title}" | ID: ${draft.id} | URL: ${draft.url}`);
  }

  console.log('\n--- LIVE POSTS ---');
  const livesRes = await blogger.posts.list({
    blogId: BLOG_ID,
    status: ['live'],
    maxResults: 150
  });
  const lives = livesRes.data.items || [];
  console.log(`Found ${lives.length} live posts.`);
  for (const live of lives) {
    console.log(`Live: "${live.title}" | ID: ${live.id} | URL: ${live.url}`);
  }
}

main().catch(err => console.error(err));
