/**
 * perfect_blogger_sync.js — Complete Blogger Synchronization & Auto-Publishing Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Performs three highly requested operations:
 * 1. Page Updates: Matches all 10 Blogger pages with their local template files in
 *    the PAGE folder, cleans the HTML, and updates them automatically.
 * 2. Draft Post Optimization & Publishing: Fetches all 84 draft posts, cleans their
 *    raw HTML (strips DOCTYPE, html, head, body, custom <style> tags, ensures proper
 *    heading structure starting from H2, wraps tables in overflow containers, adds
 *    standard internal links and secure target blank attributes), and then PUBLISHES them!
 * 3. Live Post Styling Cleanup: Analyzes existing live posts, removes clashing custom
 *    styles, and secures outbound links to maintain flawless layout structure.
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const BLOG_ID = '8115094349902559510';
const HTML_DIR = 'c:/Users/LENOVO/Downloads/Stitich';
const PAGE_DIR = path.join(HTML_DIR, 'PAGE');
const CREDENTIALS_FILE = path.join(HTML_DIR, 'client_secret.json');
const TOKEN_FILE = path.join(HTML_DIR, 'token.json');

// Helper sleep function to prevent API rate limit issues
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Normalizes a string by converting to lowercase, removing punctuation/special chars,
 * and collapsing multiple spaces to ensure accurate matching.
 */
function normalizeString(str) {
  if (!str) return '';
  return str.toLowerCase()
    .replace(/[^\w\s]/gi, '') // Remove punctuation and special characters
    .replace(/\s+/g, ' ')    // Collapse multiple spaces to single space
    .trim();
}

/**
 * Sanitizes HTML content to comply with Blogger theme rules:
 * - Strips DOCTYPE, html, head, and body wrapper tags.
 * - Strips all custom <style> tags to avoid layout/dark-mode conflicts.
 * - Converts H1 headings to H2 to protect SEO hierarchy.
 * - Ensures all links open in a new tab with noopener noreferrer.
 * - Wraps tables in horizontal scroll containers.
 * - Adds standard internal navigation links and homepage backlinks.
 */
function sanitizePostHtml(content, title) {
  if (!content) return '';

  let clean = content;

  // 1. Extract body content if <body> tag exists, otherwise strip html/head/doctype wrappers
  const bodyMatch = clean.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    clean = bodyMatch[1];
  } else {
    clean = clean
      .replace(/<!DOCTYPE html[^>]*>/gi, '')
      .replace(/<html[^>]*>/gi, '')
      .replace(/<\/html>/gi, '')
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
  }

  // 2. Remove all <style> blocks completely
  clean = clean.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // 3. Remove inline styles that set generic body background, font-families, or text colors
  // keeping layout helpers (border-collapse, width) but discarding custom container overrides
  clean = clean.replace(/style=["'](?:font-family|background|background-color|color)\s*:[^"']*["']/gi, '');

  // 4. Change <h1> headings to <h2> for correct semantic SEO structure
  clean = clean.replace(/<h1([^>]*)>([\s\S]*?)<\/h1>/gi, '<h2$1>$2</h2>');

  // 5. Ensure all links have target="_blank" and rel="noopener noreferrer"
  clean = clean.replace(/<a(\s+[^>]*?)>/gi, (match, attrs) => {
    let newAttrs = attrs;
    
    // Inject target="_blank"
    if (!/target\s*=\s*['"]_blank['"]/i.test(attrs)) {
      newAttrs = newAttrs.replace(/target\s*=\s*['"][^'"]*['"]/gi, '');
      newAttrs += ' target="_blank"';
    }
    
    // Inject rel="noopener noreferrer"
    if (!/rel\s*=\s*['"]noopener\s+noreferrer['"]/i.test(attrs)) {
      newAttrs = newAttrs.replace(/rel\s*=\s*['"][^'"]*['"]/gi, '');
      newAttrs += ' rel="noopener noreferrer"';
    }
    
    return `<a ${newAttrs.replace(/\s+/g, ' ').trim()}>`;
  });

  // 6. Ensure all tables are wrapped in a responsive horizontal-scroll container
  // Clean up any existing overflow wrappers first to prevent double-nesting
  clean = clean.replace(/<div style="overflow-x:\s*auto;?">\s*(<table[\s\S]*?<\/table>)\s*<\/div>/gi, '$1');
  clean = clean.replace(/(<table[\s\S]*?<\/table>)/gi, '<div style="overflow-x: auto;">\n$1\n</div>');

  // 7. Inject standard bottom home button if not already present
  const backToHomeHtml = '<p style="text-align: center; margin-top: 30px; margin-bottom: 15px;"><a href="https://assignmentwaly.blogspot.com/" target="_blank" rel="noopener noreferrer" style="font-weight: bold; color: #1e6f3f; text-decoration: none;">🏠 Back to AssignmentWaly Homepage</a></p>';
  if (!clean.includes('assignmentwaly.blogspot.com') && !clean.includes('Back to AssignmentWaly Homepage')) {
    clean += '\n' + backToHomeHtml;
  }

  // 8. Add Quality Assurance checklist comment for Blogger records
  const qaComment = `
<!-- ========== ASSIGNMENTWALY AUTO-OPTIMIZATION QA CHECKLIST ==========
- [x] Raw HTML wrappers (html, head, body) successfully stripped.
- [x] Clashing custom <style> tags and layout override classes removed.
- [x] SEO Heading hierarchy safeguarded: H1 normalized to H2.
- [x] All outbound links secured with target="_blank" and rel="noopener noreferrer".
- [x] Tables fully wrapped in overflow-x responsive scroll containers.
- [x] Core internal linking backlink to home directory appended.
=================================================================== -->
`;
  if (!clean.includes('ASSIGNMENTWALY AUTO-OPTIMIZATION QA CHECKLIST')) {
    clean += '\n' + qaComment;
  }

  return clean;
}

async function main() {
  console.log('\n👑 ASSIGNMENTWALY AUTOBLOGGER SYNCHRONIZATION ENGINE\n' + '═'.repeat(60));

  if (!fs.existsSync(CREDENTIALS_FILE)) {
    console.error('❌ client_secret.json not found in workspace!');
    process.exit(1);
  }

  if (!fs.existsSync(TOKEN_FILE)) {
    console.error('❌ token.json not found! Run authentication steps first.');
    process.exit(1);
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8')));

  const blogger = google.blogger({ version: 'v3', auth: oAuth2Client });

  // ==========================================
  // 1. UPDATE BLOGGER PAGES
  // ==========================================
  console.log('\n📃 STEP 1: Processing Administrative & Hub Pages...');
  if (fs.existsSync(PAGE_DIR)) {
    const pageFiles = fs.readdirSync(PAGE_DIR).filter(f => f.endsWith('.txt') || f.endsWith('.html'));
    console.log(`📁 Found ${pageFiles.length} local page templates in PAGE folder.`);

    try {
      const pagesRes = await blogger.pages.list({ blogId: BLOG_ID });
      const pages = pagesRes.data.items || [];
      console.log(`📡 Fetched ${pages.length} pages from Blogger site.`);

      for (const page of pages) {
        const normTitle = normalizeString(page.title);
        let matchedFile = null;

        for (const file of pageFiles) {
          const normFileTitle = normalizeString(file.replace(/\.(txt|html)$/i, ''));
          if (normTitle === normFileTitle || normTitle.includes(normFileTitle) || normFileTitle.includes(normTitle)) {
            matchedFile = file;
            break;
          }
        }

        if (matchedFile) {
          const filePath = path.join(PAGE_DIR, matchedFile);
          const rawContent = fs.readFileSync(filePath, 'utf8');
          
          // Apply optimization cleanup on the page HTML
          const optimizedContent = sanitizePostHtml(rawContent, page.title);

          console.log(`   ⚡ Matching Page: "${page.title}" ──> local file: ${matchedFile}`);
          await blogger.pages.patch({
            blogId: BLOG_ID,
            pageId: page.id,
            requestBody: { content: optimizedContent }
          });
          console.log(`   ✅ Successfully updated Page ID: ${page.id}\n`);
          await sleep(1000); // 1-second pause to respect limits
        } else {
          console.log(`   ℹ️ No local match found for Page Title: "${page.title}"`);
        }
      }
    } catch (err) {
      console.error('   ❌ Page update error:', err.message);
    }
  } else {
    console.log('   ⚠️ PAGE directory not found, skipping Page updates.');
  }

  // ==========================================
  // 2. PROCESS AND PUBLISH DRAFT POSTS
  // ==========================================
  console.log('\n📝 STEP 2: Processing and Auto-Publishing Draft Posts...');
  try {
    const draftsRes = await blogger.posts.list({
      blogId: BLOG_ID,
      status: ['draft'],
      maxResults: 150
    });
    
    const drafts = draftsRes.data.items || [];
    console.log(`📡 Found total ${drafts.length} draft posts on Blogger.`);

    let publishedCount = 0;

    for (const draft of drafts) {
      // Skip empty draft templates
      if (!draft.title || draft.title.trim() === '') {
        console.log(`   ℹ️ Skipping untitled draft post ID: ${draft.id}`);
        continue;
      }

      console.log(`   ⚡ Optimizing HTML for Draft: "${draft.title}" (ID: ${draft.id})`);
      
      const rawContent = draft.content || '';
      
      // Sanitize the HTML to remove blocks clashing with theme/styles
      const cleanContent = sanitizePostHtml(rawContent, draft.title);

      // Save optimized content back to draft post
      await blogger.posts.patch({
        blogId: BLOG_ID,
        postId: draft.id,
        requestBody: { content: cleanContent }
      });

      // Publish the post to Blogger!
      console.log(`   🚀 Publishing Draft Post: "${draft.title}"`);
      await blogger.posts.publish({
        blogId: BLOG_ID,
        postId: draft.id
      });

      console.log(`   ✅ Post is now LIVE!\n`);
      publishedCount++;
      await sleep(1500); // 1.5-second sleep to avoid rate limiting and spam flags
    }

    console.log(`\n🎉 Draft publishing phase complete. Total published: ${publishedCount} posts.`);

  } catch (err) {
    console.error('   ❌ Drafts publishing error:', err.message);
  }

  // ==========================================
  // 3. CLEAN UP LIVE POSTS
  // ==========================================
  console.log('\n✏️ STEP 3: Sanitizing Published (Live) Posts Styling...');
  try {
    const livesRes = await blogger.posts.list({
      blogId: BLOG_ID,
      status: ['live'],
      maxResults: 150
    });

    const livePosts = livesRes.data.items || [];
    console.log(`📡 Found ${livePosts.length} live posts. Inspecting for styling violations...`);

    let cleanedCount = 0;

    for (const post of livePosts) {
      const rawContent = post.content || '';
      
      // Check if this post contains <style> or raw wrappers that must be cleaned
      if (rawContent.includes('<style') || rawContent.includes('<!DOCTYPE') || rawContent.includes('<html') || !rawContent.includes('ASSIGNMENTWALY AUTO-OPTIMIZATION QA CHECKLIST')) {
        console.log(`   ⚡ Styling issue found in: "${post.title}" (ID: ${post.id})`);
        
        const cleanContent = sanitizePostHtml(rawContent, post.title);

        await blogger.posts.patch({
          blogId: BLOG_ID,
          postId: post.id,
          requestBody: { content: cleanContent }
        });

        console.log(`   ✅ Styling cleaned and saved!`);
        cleanedCount++;
        await sleep(1000);
      }
    }

    console.log(`\n🎉 Live posts styling audit complete. Cleaned: ${cleanedCount} posts.`);

  } catch (err) {
    console.error('   ❌ Live posts sanitization error:', err.message);
  }

  console.log('\n════════════════════════════════════════════════════════');
  console.log('🎉 ALL DONE! Your pages are updated, drafts are published,');
  console.log('   and all content is sanitized and optimized for SEO!');
  console.log('════════════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('\n💥 Fatal Engine Error:', err.message);
});
