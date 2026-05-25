/**
 * blogger_updater.js — AssignmentWaly Blogger Post Updater
 * ─────────────────────────────────────────────────────────────────────────────
 * Uses Blogger Data API v3 with OAuth2 to update all posts automatically.
 *
 * SETUP STEPS (one-time):
 * 1. Go to: https://console.cloud.google.com/
 * 2. Create a new project → Enable "Blogger API v3"
 * 3. Create OAuth 2.0 credentials (Desktop App type)
 * 4. Download client_secret.json → put it in this folder
 * 5. Run: npm install googleapis
 * 6. Run: node blogger_updater.js
 * 7. Browser will open → Login as Faiez Hafeez → Allow access
 * 8. Script will automatically update all posts!
 */

const fs   = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
const BLOG_ID         = '8115094349902559510';    // assignmentwaly.blogspot.com
const HTML_DIR        = 'c:/Users/LENOVO/Downloads/Stitich';
const CREDENTIALS_FILE = path.join(__dirname, 'client_secret.json');
const TOKEN_FILE       = path.join(__dirname, 'token.json');
const SCOPES           = ['https://www.googleapis.com/auth/blogger'];

// ─── File → Post URL slug mapping ────────────────────────────────────────────
// Map each local HTML file to the Blogger post URL slug it corresponds to.
// The script will search for the post by its URL slug and update its content.
const FILE_TO_SLUG = {
  'ad_english_assignments.html'             : 'aiou-ad-english-odl-solved-assignments-spring-2026',
  'ad_gender_women_studies.html'            : 'aiou-ad-gender-women-studies-odl-solved',
  'ad_history_assignments.html'             : 'aiou-ad-history-odl-solved',
  'ad_lis_assignments.html'                 : 'aiou-ad-lis-odl-solved-assignments-spring-2026',
  'associate_degree_assignments.html'       : 'aiou-associate-degree-odl-solved-assignments-spring-2026',
  'ba_bcom_assignments.html'                : 'aiou-ba-bcom-solved-assignments-spring-2026',
  'ba_bcom_books.html'                      : 'aiou-ba-bcom-original-books-pdf',
  'bed_assignments_post_clean.html'         : 'aiou-bed-15-25-4-solved-assignments',
  'bs_history_odl_assignments.html'         : 'aiou-bs-history-odl-solved-assignments-spring-2026',
  'bs_lis_assignments.html'                 : 'aiou-bs-lis-odl-solved-assignments-spring-2026',
  'bs_mass_communication_assignments.html'  : 'aiou-bs-mass-communication-odl-solved-assignments',
  'fa_icom_assignments.html'                : 'aiou-fa-icom-solved-assignments-spring-2026',
  'fa_icom_books.html'                      : 'aiou-fa-icom-original-books-pdf',
  'matric_certificate_books.html'           : 'aiou-matric-download-pdf-books-original',
  'ma_arabic_books.html'                    : 'aiou-ma-arabic-original-books-pdf',
  'ma_history_books.html'                   : 'aiou-ma-history-original-books-pdf',
  'ma_islamic_studies_books.html'           : 'aiou-ma-islamic-studies-original-books',
  'ma_urdu_books.html'                      : 'aiou-ma-urdu-original-books-pdf',
  'mlis_books.html'                         : 'aiou-mlis-original-books-pdf-download',
  'aiou_question_papers_page.html'          : 'aiou-guess-papers-question-papers-2026',
  'aiou_solved_assignments_hub_clean.html'  : 'aiou-solved-assignments-all-codes',
  'aiou_address_change_guide.html'          : 'aiou-address-change-guide',
  'aiou_change_of_books_guide.html'         : 'aiou-change-of-books-guide',
  'aiou_data_migration_guide.html'          : 'aiou-data-migration-guide',
  'aiou_exemption_equivalence_guide.html'   : 'aiou-exemption-equivalence-guide',
  'aiou_phone_number_change_guide.html'     : 'aiou-phone-number-change-guide',
  'aiou_program_change_guide.html'          : 'aiou-program-change-guide',
  'aiou_registration_roll_correction_guide.html' : 'aiou-registration-roll-correction-guide',
  'aiou_rumc_appeal_guide.html'             : 'aiou-rumc-appeal-guide',
  'aiou_undelivered_books_guide.html'       : 'aiou-undelivered-books-guide',
  'aiou_wrong_dispatch_books_guide.html'    : 'aiou-wrong-dispatch-books-guide',
  'aiou-assignments.html'                   : 'aiou-assignments',
};

// ─── OAuth2 Setup ─────────────────────────────────────────────────────────────
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
  console.log('\n🌐 Open this URL in your browser and log in as Faiez Hafeez:\n');
  console.log(authUrl);
  console.log('');

  const { exec } = require('child_process');
  exec(`start ${authUrl}`);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const code = await new Promise(resolve => rl.question('📋 Paste the authorization code here: ', resolve));
  rl.close();

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens));
  console.log('✅ Token saved to token.json\n');

  return oAuth2Client;
}

// ─── Get all posts from the blog ──────────────────────────────────────────────
async function getAllPosts(blogger, blogId) {
  console.log('📄 Fetching all posts from blog...');
  const allPosts = [];
  let pageToken = null;

  do {
    const res = await blogger.posts.list({
      blogId,
      maxResults: 50,
      ...(pageToken ? { pageToken } : {}),
      fields: 'items(id,url,title),nextPageToken'
    });
    if (res.data.items) allPosts.push(...res.data.items);
    pageToken = res.data.nextPageToken;
  } while (pageToken);

  console.log(`✅ Found ${allPosts.length} posts.\n`);
  return allPosts;
}
// ─── Create a new post if missing ───────────────────────────────────────────────
async function createPost(blogger, blogId, slug, title, content) {
  // Insert a new post with the given title and content
  const insertRes = await blogger.posts.insert({
    blogId,
    requestBody: { title, content }
  });
  // Blogger generates a URL automatically; we return the post object
  return insertRes.data;
}

// ─── Match post by URL slug ───────────────────────────────────────────────────
function findPost(posts, slug) {
  return posts.find(p => p.url && p.url.toLowerCase().includes(slug.toLowerCase()));
}



// ─── Safe update with retry logic ───────────────────────────────────────
async function safeUpdatePost(blogger, blogId, postId, content, title) {
  const maxRetries = 3;
  let attempt = 0;
  while (true) {
    try {
      await blogger.posts.patch({
        blogId,
        postId,
        requestBody: { content }
      });
      return; // success
    } catch (err) {
      if (err && err.response && err.response.status === 429 && attempt < maxRetries) {
        attempt++;
        const backoff = Math.pow(2, attempt) * 5000; // exponential backoff (5s, 10s, 20s)
        console.warn(`⏳ Rate limit hit. Retrying attempt ${attempt}/${maxRetries} after ${backoff / 1000}s...`);
        await new Promise(r => setTimeout(r, backoff));
        continue;
      }
      // rethrow other errors or after max retries
      throw err;
    }
  }
}

// Update the existing updatePost call to use safeUpdatePost and increase delay
// ─── Update a single post (modified) ─────────────────────────────────────────────
async function updatePost(blogger, blogId, postId, content, title) {
  await safeUpdatePost(blogger, blogId, postId, content, title);
}

// Adjust delay after each update from 500ms to 2000ms (line 190)
await new Promise(r => setTimeout(r, 2000)); // rate limit
