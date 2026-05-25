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

  console.log('📡 Fetching ALL pages...');
  const pageList = await blogger.pages.list({ blogId: BLOG_ID });
  const pages = pageList.data.items || [];
  
  const matchPage = pages.find(p => p.url && p.url.includes('aiou-assignments.html'));
  if (matchPage) {
    console.log('🎉 Found Page by URL:');
    console.log(JSON.stringify(matchPage, null, 2));
  } else {
    console.log('❌ Could not find a page with URL containing "aiou-assignments.html" in the pages list.');
    console.log('Checking all posts for "aiou-assignments"...');
    
    // Check posts
    let allPosts = [];
    let pageToken = null;
    do {
      const postsRes = await blogger.posts.list({
        blogId: BLOG_ID,
        maxResults: 50,
        pageToken,
        fields: 'items(id,url,title,content),nextPageToken'
      });
      const items = postsRes.data.items || [];
      allPosts = allPosts.concat(items);
      pageToken = postsRes.data.nextPageToken || null;
    } while (pageToken);
    
    const matchPost = allPosts.find(p => p.url && p.url.includes('aiou-assignments.html'));
    if (matchPost) {
      console.log('🎉 Found Post by URL:');
      console.log(JSON.stringify({ id: matchPost.id, title: matchPost.title, url: matchPost.url }, null, 2));
    } else {
      console.log('❌ No post matches either.');
    }
  }
}

main().catch(console.error);
