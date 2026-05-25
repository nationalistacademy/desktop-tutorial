const fs = require('fs');
const path = require('path');

const STITICH_DIR = 'c:/Users/LENOVO/Downloads/Stitich';
const POSTS_JSON_FILE = path.join(STITICH_DIR, 'blogger_posts.json');

if (!fs.existsSync(POSTS_JSON_FILE)) {
  console.error('❌ blogger_posts.json not found! Run fetch_all_blogger_posts.js first.');
  process.exit(1);
}

const publishedPosts = JSON.parse(fs.readFileSync(POSTS_JSON_FILE, 'utf8'));

// Get all local HTML files in the folder
const localFiles = fs.readdirSync(STITICH_DIR).filter(file => file.endsWith('.html') && file !== 'theme-classic.html');

console.log(`📂 Found ${localFiles.length} local HTML files.`);
console.log(`📄 Found ${publishedPosts.length} published posts in JSON.\n`);

const matched = {};
const unmatched = [];

// Let's create an advanced matching algorithm
for (const file of localFiles) {
  const filePath = path.join(STITICH_DIR, file);
  const fileContent = fs.readFileSync(filePath, 'utf8');

  // Attempt 1: Look for primary keyword or title hints in the file
  let match = null;

  // Attempt 2: Slug/Name match based on typical AIOU structures
  // E.g. "ad_english_assignments.html" might match "aiou-ad-english-odl-solved-assignments-spring-2026"
  // Let's clean the local filename into keywords
  const fileKeywords = file.replace('.html', '').split('_');

  // Let's find best match based on keywords
  let bestMatch = null;
  let maxScore = 0;

  for (const post of publishedPosts) {
    const slug = post.slug.toLowerCase();
    const title = post.title.toLowerCase();
    
    // Exact match in slug or title
    if (slug.includes(file.replace('.html', '').replace(/_/g, '-'))) {
      bestMatch = post;
      maxScore = 100;
      break;
    }

    // Score based on matching keywords
    let score = 0;
    for (const kw of fileKeywords) {
      if (kw.length <= 2) continue; // Skip short terms like 'ad', 'bs', 'ma'
      if (slug.includes(kw) || title.includes(kw)) {
        score += 10;
      }
    }

    // Special exact handlings
    if (file === 'bed_assignments_post_clean.html' && (slug.includes('bed-15-25-4-solved') || slug.includes('reset-only-within-this-container-no') || title.includes('b.ed solved assignments'))) {
      bestMatch = post;
      maxScore = 150;
      break;
    }
    if (file === 'associate_degree_assignments.html' && slug.includes('associate-degree-odl-solved')) {
      bestMatch = post;
      maxScore = 150;
      break;
    }
    if (file === 'aiou_solved_assignments_hub_clean.html' && slug.includes('solved-assignments-all-codes')) {
      bestMatch = post;
      maxScore = 150;
      break;
    }
    if (file === 'aiou_question_papers_page.html' && slug.includes('guess-papers')) {
      bestMatch = post;
      maxScore = 150;
      break;
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatch = post;
    }
  }

  if (bestMatch && maxScore > 20) {
    matched[file] = {
      postId: bestMatch.postId,
      title: bestMatch.title,
      slug: bestMatch.slug,
      score: maxScore
    };
  } else {
    unmatched.push(file);
  }
}

console.log('✅ Matches Found:');
for (const [file, info] of Object.entries(matched)) {
  console.log(`🔗 ${file} ──> "${info.title}" (ID: ${info.postId})`);
}

if (unmatched.length > 0) {
  console.log('\n⚠️ Unmatched local HTML files:');
  for (const file of unmatched) {
    console.log(`❌ ${file}`);
  }
}

// Generate the fully matched POST_MAP
console.log('\n Generating direct_updater_ready.js with matches...');

const directUpdaterPath = path.join(STITICH_DIR, 'direct_updater.js');
let directUpdaterCode = fs.readFileSync(directUpdaterPath, 'utf8');

// Build the replacement POST_MAP content
let postMapString = 'const POST_MAP = {\n';
for (const file of localFiles) {
  const matchInfo = matched[file];
  const idStr = matchInfo ? matchInfo.postId : '';
  postMapString += `  '${file}': '${idStr}',${matchInfo ? ` // Match: ${matchInfo.title.substring(0, 40)}...` : ' // No match found'}\n`;
}
postMapString += '};';

// Replace inside direct_updater.js
const regex = /const POST_MAP = \{[\s\S]*?\};/;
if (regex.test(directUpdaterCode)) {
  directUpdaterCode = directUpdaterCode.replace(regex, postMapString);
  fs.writeFileSync(directUpdaterPath, directUpdaterCode, 'utf8');
  console.log(`🎉 direct_updater.js updated successfully with matched Post IDs!`);
} else {
  console.error('❌ Could not find POST_MAP definition in direct_updater.js to replace.');
}
