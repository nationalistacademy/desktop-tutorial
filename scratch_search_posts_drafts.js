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

  console.log('📡 Fetching ALL pages (including drafts)...');
  const pageList = await blogger.pages.list({ blogId: BLOG_ID, status: ['LIVE', 'DRAFT'] });
  const pages = pageList.data.items || [];
  
  pages.forEach(p => {
    console.log(`Page: ${p.title} | URL: ${p.url} | ID: ${p.id} | Status: ${p.status}`);
  });

  console.log('\n📡 Fetching ALL posts (including drafts) to look for "aiou-assignments"...');
  let pageToken = null;
  let found = false;
  do {
    const params = {
      blogId: BLOG_ID,
      maxResults: 50,
      status: ['LIVE', 'DRAFT', 'SCHEDULED'],
      fields: 'items(id,url,title,status),nextPageToken'
    };
    if (pageToken) params.pageToken = pageToken;
    
    const postsRes = await blogger.posts.list(params);
    const items = postsRes.data.items || [];
    for (const post of items) {
      if (post.url && post.url.includes('aiou-assignments')) {
        console.log(`🎉 Found Post: ${post.title} | URL: ${post.url} | ID: ${post.id} | Status: ${post.status}`);
        found = true;
      }
    }
    pageToken = postsRes.data.nextPageToken || null;
  } while (pageToken);

  if (!found) {
    console.log('❌ No post contains the URL slug "aiou-assignments".');
  }
}

main().catch(console.error);
