// add_semester_deadline.js — Adds Semester Deadline section to assignment posts

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');

const BLOG_ID = '8115094349902559510'; // assignmentwaly.blogspot.com
const HTML_DIR = 'c:/Users/LENOVO/Downloads/Stitich';
const CREDENTIALS_FILE = path.join(__dirname, 'client_secret.json');
const TOKEN_FILE = path.join(__dirname, 'token.json');
const SCOPES = ['https://www.googleapis.com/auth/blogger'];

const FILE_TO_SLUG = { /* same mapping as in blogger_updater.js */
  'ad_english_assignments.html': 'aiou-ad-english-odl-solved-assignments-spring-2026',
  'ad_gender_women_studies.html': 'aiou-ad-gender-women-studies-odl-solved',
  'ad_history_assignments.html': 'aiou-ad-history-odl-solved',
  'ad_lis_assignments.html': 'aiou-ad-lis-odl-solved-assignments-spring-2026',
  'associate_degree_assignments.html': 'aiou-associate-degree-odl-solved-assignments-spring-2026',
  'ba_bcom_assignments.html': 'aiou-ba-bcom-solved-assignments-spring-2026',
  'ba_bcom_books.html': 'aiou-ba-bcom-original-books-pdf',
  'bed_assignments_post_clean.html': 'aiou-bed-15-25-4-solved-assignments',
  'bs_history_odl_assignments.html': 'aiou-bs-history-odl-solved-assignments-spring-2026',
  'bs_lis_assignments.html': 'aiou-bs-lis-odl-solved-assignments-spring-2026',
  'bs_mass_communication_assignments.html': 'aiou-bs-mass-communication-odl-solved-assignments',
  'fa_icom_assignments.html': 'aiou-fa-icom-solved-assignments-spring-2026',
  'fa_icom_books.html': 'aiou-fa-icom-original-books-pdf',
  // ... (other entries omitted for brevity)
};

async function authorize() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  if (fs.existsSync(TOKEN_FILE)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }
  const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
  console.log('\nOpen this URL in your browser and log in as Faiez Hafeez:\n' + authUrl);
  const { exec } = require('child_process');
  exec(`start ${authUrl}`);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const code = await new Promise(resolve => rl.question('Paste the authorization code here: ', resolve));
  rl.close();
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens));
  console.log('Token saved');
  return oAuth2Client;
}

async function getAllPosts(blogger, blogId) {
  const all = [];
  let pageToken = null;
  do {
    const res = await blogger.posts.list({ blogId, maxResults: 50, ...(pageToken && { pageToken }) });
    if (res.data.items) all.push(...res.data.items);
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  return all;
}

function findPost(posts, slug) {
  return posts.find(p => p.url && p.url.toLowerCase().includes(slug.toLowerCase()));
}

function addDeadline(content) {
  const deadlineHtml = `\n<div style="margin-top:20px;">\n<h2>Semester Deadline – Spring 2026</h2>\n<p>Submission deadline for Spring 2026 assignments is <strong>31 May 2026</strong>. Please ensure you submit before this date.</p>\n</div>`;
  if (content.includes('Semester Deadline – Spring 2026')) return content; // already added
  return content + deadlineHtml;
}

async function safeUpdatePost(blogger, blogId, postId, content) {
  const maxRetries = 3; let attempt = 0;
  while (true) {
    try { await blogger.posts.patch({ blogId, postId, requestBody: { content } }); return; }
    catch (err) {
      if (err && err.response && err.response.status === 429 && attempt < maxRetries) {
        attempt++; const backoff = Math.pow(2, attempt) * 5000; await new Promise(r => setTimeout(r, backoff));
        continue;
      }
      throw err;
    }
  }
}

(async () => {
  const auth = await authorize();
  const blogger = google.blogger({ version: 'v3', auth });
  const posts = await getAllPosts(blogger, BLOG_ID);
  for (const [file, slug] of Object.entries(FILE_TO_SLUG)) {
    const post = findPost(posts, slug);
    if (!post) { console.warn(`No post found for slug ${slug}`); continue; }
    const filePath = path.join(HTML_DIR, file);
    if (!fs.existsSync(filePath)) { console.warn(`Local file missing: ${filePath}`); continue; }
    let html = fs.readFileSync(filePath, 'utf8');
    const newHtml = addDeadline(html);
    if (newHtml === html) { console.log(`Deadline already present in ${file}`); continue; }
    // update local file for future runs
    fs.writeFileSync(filePath, newHtml);
    await safeUpdatePost(blogger, BLOG_ID, post.id, newHtml);
    console.log(`Updated post ${post.title} with deadline`);
    await new Promise(r => setTimeout(r, 2000)); // rate limit pause
  }
})();
