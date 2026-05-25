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

  const token = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
  oAuth2Client.setCredentials(token);

  const blogger = google.blogger({ version: 'v3', auth: oAuth2Client });

  // Get a few draft posts to inspect their content
  const draftsRes = await blogger.posts.list({
    blogId: BLOG_ID,
    status: ['draft'],
    maxResults: 5
  });
  const drafts = draftsRes.data.items || [];
  for (const draft of drafts) {
    console.log(`=========================================`);
    console.log(`Draft Title: "${draft.title}"`);
    console.log(`Draft ID   : ${draft.id}`);
    console.log(`Content Preview (first 500 chars):`);
    console.log(draft.content ? draft.content.substring(0, 800) : '[No Content]');
    console.log(`=========================================\n`);
  }
}

main().catch(err => console.error(err));
