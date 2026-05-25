/**
 * direct_updater.js — Fast Direct Post ID Updater
 * Agar aapke paas post IDs hain (Blogger edit URLs se milte hain),
 * yeh script directly un posts ko update karta hai bina search ke.
 * 
 * POST IDs nikalne ka tareeqa:
 * Blogger Dashboard → Post Edit URL:
 * https://www.blogger.com/blog/post/edit/8115094349902559510/299968663568172435
 *                                                             ^^^^^^^^^^^^^^^^^^^^
 *                                                             Yeh Post ID hai
 */

const fs    = require('fs');
const path  = require('path');
const readline = require('readline');
const { google } = require('googleapis');

const BLOG_ID          = '8115094349902559510';
const HTML_DIR         = 'c:/Users/LENOVO/Downloads/Stitich';
const CREDENTIALS_FILE = path.join(__dirname, 'client_secret.json');
const TOKEN_FILE       = path.join(__dirname, 'token.json');
const SCOPES           = ['https://www.googleapis.com/auth/blogger'];

// ─────────────────────────────────────────────────────────────────────────────
// 📋 POST MAP — HTML file → Blogger Post ID
// Blogger Post edit URL se Post ID copy karein:
// https://blogger.com/blog/post/edit/BLOG_ID/POST_ID
//
// Aap har post ka edit URL open karein aur last number (Post ID) yahan paste karein.
// Format: 'html_filename.html': 'POST_ID_NUMBER'
// ─────────────────────────────────────────────────────────────────────────────
const POST_MAP = {
  'ad_english_assignments.html': '', // No match found
  'ad_gender_women_studies.html': '5617550765112529812', // Match: AIOU MSc Gender and Women Studies Solved...
  'ad_history_assignments.html': '', // No match found
  'ad_lis_assignments.html': '', // No match found
  'aiou_address_change_guide.html': '9162421331766644768', // Match: AIOU Application for Correction/Change o...
  'aiou_change_of_books_guide.html': '8743694870076613110', // Match: AIOU Application for Change of Books – D...
  'aiou_data_migration_guide.html': '4952791189575903057', // Match: AIOU Application for Data Migration – Do...
  'aiou_exemption_equivalence_guide.html': '4651210046461526427', // Match: AIOU Application for Exemption & Equival...
  'aiou_phone_number_change_guide.html': '980287008946721964', // Match: AIOU Application for Correction/Change o...
  'aiou_program_change_guide.html': '8114235142824203604', // Match: AIOU Application for Correction/Change o...
  'aiou_question_papers_page.html': '4012272203996665102', // Match: AIOU Complete Guide 2026: Question Paper...
  'aiou_registration_roll_correction_guide.html': '6854579833551583947', // Match: AIOU Application for Correction/Change o...
  'aiou_rumc_appeal_guide.html': '7249267798187156615', // Match: AIOU Application for Appeal against RUMC...
  'aiou_solved_assignments_hub_clean.html': '299968663568172435', // Match: AIOU B.Ed Solved Assignments Spring 2026...
  'aiou_undelivered_books_guide.html': '3275109230476840492', // Match: AIOU Application for Undelivered Books –...
  'aiou_wrong_dispatch_books_guide.html': '1305719027368951406', // Match: AIOU Application for Wrong Dispatch of B...
  'associate_degree_assignments.html': '', // No match found
  'ba_bcom_assignments.html': '', // No match found
  'ba_bcom_books.html': '', // No match found
  'bed_assignments_post_clean.html': '299968663568172435', // Match: AIOU B.Ed Solved Assignments Spring 2026...
  'bs_history_odl_assignments.html': '', // No match found
  'bs_lis_assignments.html': '', // No match found
  'bs_mass_communication_assignments.html': '8918633002859897356', // Match: AIOU MSc Mass Communication Solved Assig...
  'fa_icom_assignments.html': '', // No match found
  'fa_icom_books.html': '', // No match found
  'matric_certificate_books.html': '', // No match found
  'ma_arabic_books.html': '', // No match found
  'ma_history_books.html': '', // No match found
  'ma_islamic_studies_books.html': '', // No match found
  'ma_urdu_books.html': '', // No match found
  'mlis_books.html': '', // No match found
};

// ─── OAuth ───────────────────────────────────────────────────────────────────
async function authorize() {
  const creds  = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
  const { client_secret, client_id, redirect_uris } = creds.installed || creds.web;
  const oAuth2 = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  if (fs.existsSync(TOKEN_FILE)) {
    oAuth2.setCredentials(JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8')));
    return oAuth2;
  }

  const authUrl = oAuth2.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
  console.log('\n🔐 Browser mein yeh URL open karein aur Faiez Hafeez account se login karein:\n');
  console.log(authUrl + '\n');
  require('child_process').exec(`start "" "${authUrl}"`);

  const rl   = readline.createInterface({ input: process.stdin, output: process.stdout });
  const code = await new Promise(r => rl.question('📋 Authorization code yahan paste karein: ', r));
  rl.close();

  const { tokens } = await oAuth2.getToken(code.trim());
  oAuth2.setCredentials(tokens);
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens));
  console.log('\n✅ Login successful! Token saved.\n');
  return oAuth2;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 AssignmentWaly — Direct Post Updater');
  console.log('Blog ID: ' + BLOG_ID);
  console.log('─'.repeat(55));

  if (!fs.existsSync(CREDENTIALS_FILE)) {
    console.log('\n❌ client_secret.json nahi mila!');
    console.log('📋 Steps:');
    console.log('  1. console.cloud.google.com par jain');
    console.log('  2. Project banayein → Blogger API v3 enable karein');
    console.log('  3. OAuth 2.0 Desktop credentials banayein aur download karein');
    console.log('  4. File ka naam client_secret.json karein');
    console.log('  5. C:\\Users\\LENOVO\\Downloads\\Stitich\\ mein copy karein\n');
    process.exit(1);
  }

  // Filter only entries with Post IDs filled in
  const entries = Object.entries(POST_MAP).filter(([f, id]) => id && id.trim() !== '');

  if (entries.length === 0) {
    console.log('\n⚠️  Koi Post ID fill nahi ki!');
    console.log('POST_MAP mein Post IDs paste karein aur dobara run karein.\n');
    process.exit(0);
  }

  console.log(`\n📝 ${entries.length} posts update honge...\n`);

  const auth    = await authorize();
  const blogger = google.blogger({ version: 'v3', auth });

  let ok = 0, fail = 0;

  for (const [htmlFile, postId] of entries) {
    const fp = path.join(HTML_DIR, htmlFile);
    if (!fs.existsSync(fp)) {
      console.log(`⚠️  File nahi mili: ${htmlFile}`);
      fail++;
      continue;
    }

    const content = fs.readFileSync(fp, 'utf8');

    try {
      await blogger.posts.patch({
        blogId  : BLOG_ID,
        postId  : postId,
        requestBody: { content }
      });
      console.log(`✅  Updated: ${htmlFile}`);
      ok++;
      await new Promise(r => setTimeout(r, 400)); // avoid rate limit
    } catch (e) {
      console.error(`❌  Failed : ${htmlFile} — ${e.message}`);
      fail++;
    }
  }

  console.log('\n' + '─'.repeat(55));
  console.log(`✅ Updated: ${ok}  |  ❌ Failed: ${fail}`);
  console.log('\n🎉 Complete! Blogger dashboard check karein.\n');
}

main().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
