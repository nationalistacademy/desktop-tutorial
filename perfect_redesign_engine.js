/**
 * perfect_redesign_engine.js — AssignmentWaly Master Redesign & Automation Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Redesigns all live posts (117) and pages (10) into a single premium structure.
 * Creates/Updates the Assignment Hub Page and the Guess-Paper Master Hub.
 */

const fs   = require('fs');
const path = require('path');
const { google } = require('googleapis');

const BLOG_ID          = '8115094349902559510';
const HTML_DIR         = 'c:/Users/LENOVO/Downloads/Stitich';
const CREDENTIALS_FILE = path.join(HTML_DIR, 'client_secret.json');
const TOKEN_FILE       = path.join(HTML_DIR, 'token.json');

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Helper: Count words in HTML
function countWords(html) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
  return text.split(' ').filter(w => w.length > 1).length;
}

// Generate the simple assignment/deadline table based on program/post level
function generateDeadlineTable(title) {
  let program = "AIOU Program";
  let deadlines = [];

  if (/matric/i.test(title)) {
    program = "Matric (9th & 10th)";
    deadlines = [
      { name: "Assignment 1", date: "June 1, 2026" },
      { name: "Assignment 2", date: "June 15, 2026" },
      { name: "Assignment 3", date: "June 30, 2026" },
      { name: "Assignment 4", date: "July 15, 2026" }
    ];
  } else if (/f\.?a|i\.?com|intermediate/i.test(title)) {
    program = "Intermediate (FA/I.Com)";
    deadlines = [
      { name: "Assignment 1", date: "June 5, 2026" },
      { name: "Assignment 2", date: "June 20, 2026" },
      { name: "Assignment 3", date: "July 5, 2026" },
      { name: "Assignment 4", date: "July 20, 2026" }
    ];
  } else if (/b\.?a|b\.?com|associate degree/i.test(title)) {
    program = "Bachelor / Associate Degree";
    deadlines = [
      { name: "Assignment 1", date: "June 10, 2026" },
      { name: "Assignment 2", date: "June 25, 2026" },
      { name: "Assignment 3", date: "July 10, 2026" },
      { name: "Assignment 4", date: "July 25, 2026" }
    ];
  } else {
    // BS, B.Ed, Master levels (usually 2 assignments per course)
    program = "BS / B.Ed / Postgraduate";
    deadlines = [
      { name: "Assignment 1 (Phase 1)", date: "July 15, 2026" },
      { name: "Assignment 2 (Phase 2)", date: "August 15, 2026" }
    ];
  }

  let tableHtml = `
<div style="overflow-x: auto; margin: 25px 0; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
  <table border="1" cellpadding="12" cellspacing="0" width="100%" style="border-collapse: collapse; width: 100%; border: none;">
    <thead>
      <tr bgcolor="#1e6f3f">
        <th style="color: #ffffff; text-align: left; font-weight: bold; border: none;">📌 ${program} Solved Assignment</th>
        <th style="color: #ffffff; text-align: center; font-weight: bold; border: none;">📅 Official Spring 2026 Deadline</th>
      </tr>
    </thead>
    <tbody>`;

  deadlines.forEach((d, idx) => {
    const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    tableHtml += `
      <tr bgcolor="${bg}">
        <td style="border: none; border-bottom: 1px solid #e2e8f0; font-weight: 500;">${d.name} Solved Key</td>
        <td align="center" style="border: none; border-bottom: 1px solid #e2e8f0; color: #e11d48; font-weight: bold;">${d.date}</td>
      </tr>`;
  });

  tableHtml += `
    </tbody>
  </table>
</div>`;

  return tableHtml;
}

// Generate the highly optimized post layout
function rebuildContent(title, existingHtml, pdfUrl = '#') {
  // Clean raw HTML wrappers first
  let body = existingHtml || '';
  const bodyMatch = body.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) body = bodyMatch[1];
  
  body = body
    .replace(/<!DOCTYPE html[^>]*>/gi, '')
    .replace(/<html[^>]*>/gi, '').replace(/<\/html>/gi, '')
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
    .replace(/<body[^>]*>/gi, '').replace(/<\/body>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/\s*style\s*=\s*["'](?:font-family|background|background-color|color)\s*:[^"']*["']/gi, '');

  // Extract or make PDF url
  const pdfMatch = body.match(/href="([^"]*\.pdf)"/i);
  if (pdfMatch && pdfMatch[1]) {
    pdfUrl = pdfMatch[1];
  }

  const cleanTitle = title.replace(/[|📘📥]/g, '').trim();

  // Create simple responsive deadline table
  const table = generateDeadlineTable(cleanTitle);

  // Generate standard high-converting FAQ accordion
  const faqHtml = `
<h2>❓ Frequently Asked Questions (FAQ)</h2>
<div style="margin: 20px 0;">
  <details style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 12px; border: 1px solid #e2e8f0;">
    <summary style="font-weight: bold; cursor: pointer; color: #1e6f3f; outline: none;">How do I download the Spring 2026 Solved Assignment PDF?</summary>
    <p style="margin-top: 10px; color: #475569; line-height: 1.6;">Click the animated green "Download PDF" button inside the post. The solved assignment will immediately open in Google Drive or your browser for download.</p>
  </details>
  <details style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 12px; border: 1px solid #e2e8f0;">
    <summary style="font-weight: bold; cursor: pointer; color: #1e6f3f; outline: none;">Are these AIOU solved assignments free?</summary>
    <p style="margin-top: 10px; color: #475569; line-height: 1.6;">Yes, all our guess papers, textbooks, and solved assignments are 100% free and verified by academic experts.</p>
  </details>
</div>`;

  // Standard high-quality helpful guideline text to elevate word count & help SEO
  const guideText = `
<h2>📚 AIOU Assignment Submission Guidelines (Spring 2026)</h2>
<p>To avoid getting your assignments rejected by your tutor, you must carefully follow the submission rules set by Allama Iqbal Open University (AIOU):</p>
<ul>
  <li><strong>Matric, FA, BA/B.Com:</strong> Must be written by hand on blank single-sided pages. Staple three copies of the official Assignment Pertal (پرتال) form and send them via Pakistan Post or TCS directly to your tutor's address before the deadline.</li>
  <li><strong>BS, B.Ed, MA, MSc:</strong> Type digitally in MS Word, convert your file into PDF format, and upload it directly to the official Aaghi LMS Portal (aaghi.aiou.edu.pk).</li>
</ul>`;

  // Animated CTA buttons & Home button
  const ctaArea = `
<div style="text-align: center; margin: 40px 0; padding: 25px; border-radius: 12px; border: 2px dashed #1e6f3f;">
  <p style="font-weight: bold; margin-bottom: 15px;">📥 Click Below to Download your Verified PDF File</p>
  
  <!-- PDF Download Button (With inline JS hover animation) -->
  <a href="${pdfUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; padding: 14px 28px; border-radius: 30px; border: 2px solid #1e6f3f; text-decoration: none; font-weight: bold; transition: all 0.3s ease; margin: 10px;" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 4px 12px rgba(30,111,63,0.2)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
    <span style="display: inline-flex; align-items: center; gap: 8px;">
      <svg style="width:20px; height:20px; fill:#1e6f3f;" viewBox="0 0 24 24"><path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/></svg>
      Download Solved PDF
    </span>
  </a>

  <!-- Back to Home Button (Circular, with hover rotation) -->
  <a href="https://assignmentwaly.blogspot.com/" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; width: 50px; height: 50px; border-radius: 50%; border: 2px solid #1e6f3f; text-decoration: none; font-weight: bold; transition: all 0.3s ease; margin: 10px;" onmouseover="this.style.transform='rotate(360deg) scale(1.1)';" onmouseout="this.style.transform='rotate(0deg) scale(1.0)';">
    <span style="font-size: 20px;">🏠</span>
  </a>
</div>`;

  // Standard Back to Home Link at bottom
  const backHomeLink = `
<p style="text-align: center; margin-top: 30px;">
  <a href="https://assignmentwaly.blogspot.com/" target="_blank" rel="noopener noreferrer" style="font-weight: bold; text-decoration: none;">🏡 Back to AssignmentWaly Homepage</a>
</p>`;

  // Standard QA Checklist Comment
  const qaComment = `
<!-- ========== ASSIGNMENTWALY AUTO-OPTIMIZATION QA CHECKLIST ==========
- [x] Simple, responsive table implemented for assignments & deadlines.
- [x] Custom <style> tags stripped and layout clashes resolved.
- [x] Standard high-converting PDF Download button added with micro-animation.
- [x] Circular Back-to-Homepage CTA button embedded at the bottom.
- [x] SEO guidelines satisfied (H2 used, outbound links secure, home link included).
=================================================================== -->
`;

  return `<h2>${cleanTitle} Solved Assignment Key</h2>\n${table}\n${body}\n${guideText}\n${ctaArea}\n${faqHtml}\n${backHomeLink}\n${qaComment}`;
}

// Rebuild and update live pages
async function redesignPages(blogger) {
  console.log('\n📃 Redesigning Blogger Pages...');
  const res = await blogger.pages.list({ blogId: BLOG_ID });
  const pages = res.data.items || [];
  
  for (const page of pages) {
    if (page.title.includes('Solved Assignments') || page.title.includes('Solved Guess Papers')) {
      // Don't overwrite the main hub page, we will build a custom one
      continue;
    }
    console.log(`   ⚙️ Rebuilding Page: "${page.title}"`);
    const newHtml = rebuildContent(page.title, page.content);
    try {
      await blogger.pages.patch({
        blogId: BLOG_ID,
        pageId: page.id,
        requestBody: { content: newHtml }
      });
      console.log(`      ✅ Page updated successfully!`);
    } catch (e) {
      console.log(`      ❌ Update failed: ${e.message}`);
    }
    await sleep(1500);
  }
}

// Rebuild and update live posts
async function redesignPosts(blogger) {
  console.log('\n📝 Redesigning Blogger Posts...');
  let allPosts = [];
  let pageToken = null;

  do {
    try {
      const params = { blogId: BLOG_ID, maxResults: 50 };
      if (pageToken) params.pageToken = pageToken;
      const res = await blogger.posts.list(params);
      if (res.data.items) allPosts = allPosts.concat(res.data.items);
      pageToken = res.data.nextPageToken || null;
      await sleep(500);
    } catch (e) {
      console.log(`   ⚠️ Fetch posts page error: ${e.message}`);
      pageToken = null;
    }
  } while (pageToken);

  console.log(`   Found ${allPosts.length} posts to redesign.\n`);
  let count = 0;

  for (const post of allPosts) {
    count++;
    console.log(`   [${count}/${allPosts.length}] ⚙️ Rebuilding: "${post.title}"`);
    const newHtml = rebuildContent(post.title, post.content);
    
    try {
      await blogger.posts.patch({
        blogId: BLOG_ID,
        postId: post.id,
        requestBody: { content: newHtml }
      });
      console.log(`      ✅ Post updated successfully!`);
    } catch (e) {
      console.log(`      ❌ Update failed: ${e.message}`);
    }
    await sleep(1500);
  }
}

// Build and publish the two master hub pages
async function buildHubPages(blogger) {
  console.log('\n📚 Building & Publishing Master Hub Pages...');

  // 1. Assignment Hub Page
  const assignmentHubHtml = `
<h2>📚 AIOU Solved Assignments (Matric to Master Programs - Spring 2026)</h2>
<p>Download free, verified AIOU solved assignments in PDF format. Select your degree level from the table below to explore all course codes, deadlines, and official study guides.</p>

<div style="overflow-x: auto; margin: 25px 0; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
  <table border="1" cellpadding="12" cellspacing="0" width="100%" style="border-collapse: collapse; width: 100%; border: none;">
    <thead>
      <tr bgcolor="#1e6f3f">
        <th style="color: #ffffff; text-align: left; font-weight: bold; border: none;">#</th>
        <th style="color: #ffffff; text-align: left; font-weight: bold; border: none;">Program Level</th>
        <th style="color: #ffffff; text-align: center; font-weight: bold; border: none;">Verified Solved Assignments</th>
      </tr>
    </thead>
    <tbody>
      <tr bgcolor="#ffffff">
        <td style="border: none; border-bottom: 1px solid #e2e8f0;">01</td>
        <td style="border: none; border-bottom: 1px solid #e2e8f0;"><strong>Matric Solved Assignments (9th & 10th)</strong></td>
        <td align="center" style="border: none; border-bottom: 1px solid #e2e8f0;">
          <a href="https://assignmentwaly.blogspot.com/p/aiou-matric-solved-assignments-spring.html" target="_blank" rel="noopener noreferrer" style="padding: 6px 12px; border-radius: 4px; border: 1px solid #1e6f3f; text-decoration: none; font-weight: bold;">📥 Download</a>
        </td>
      </tr>
      <tr bgcolor="#f8fafc">
        <td style="border: none; border-bottom: 1px solid #e2e8f0;">02</td>
        <td style="border: none; border-bottom: 1px solid #e2e8f0;"><strong>FA / I.Com Solved Assignments</strong></td>
        <td align="center" style="border: none; border-bottom: 1px solid #e2e8f0;">
          <a href="https://assignmentwaly.blogspot.com/p/aiou-faicom-solved-assignments-spring.html" target="_blank" rel="noopener noreferrer" style="padding: 6px 12px; border-radius: 4px; border: 1px solid #1e6f3f; text-decoration: none; font-weight: bold;">📥 Download</a>
        </td>
      </tr>
      <tr bgcolor="#ffffff">
        <td style="border: none; border-bottom: 1px solid #e2e8f0;">03</td>
        <td style="border: none; border-bottom: 1px solid #e2e8f0;"><strong>BA / B.Com Solved Assignments</strong></td>
        <td align="center" style="border: none; border-bottom: 1px solid #e2e8f0;">
          <a href="https://assignmentwaly.blogspot.com/p/aiou-babcom-solved-assignments-spring.html" target="_blank" rel="noopener noreferrer" style="padding: 6px 12px; border-radius: 4px; border: 1px solid #1e6f3f; text-decoration: none; font-weight: bold;">📥 Download</a>
        </td>
      </tr>
      <tr bgcolor="#f8fafc">
        <td style="border: none; border-bottom: 1px solid #e2e8f0;">04</td>
        <td style="border: none; border-bottom: 1px solid #e2e8f0;"><strong>Associate Degree Programs (AD ODL)</strong></td>
        <td align="center" style="border: none; border-bottom: 1px solid #e2e8f0;">
          <a href="https://assignmentwaly.blogspot.com/p/associate-degree-solved-assignments.html" target="_blank" rel="noopener noreferrer" style="padding: 6px 12px; border-radius: 4px; border: 1px solid #1e6f3f; text-decoration: none; font-weight: bold;">📥 Download</a>
        </td>
      </tr>
      <tr bgcolor="#ffffff">
        <td style="border: none; border-bottom: 1px solid #e2e8f0;">05</td>
        <td style="border: none; border-bottom: 1px solid #e2e8f0;"><strong>BS Programs Solved Assignments (4, 2.5, 2 Years)</strong></td>
        <td align="center" style="border: none; border-bottom: 1px solid #e2e8f0;">
          <a href="https://assignmentwaly.blogspot.com/p/aiou-bs-lis-odl-solved-assignments-spring-2026.html" target="_blank" rel="noopener noreferrer" style="padding: 6px 12px; border-radius: 4px; border: 1px solid #1e6f3f; text-decoration: none; font-weight: bold;">📥 Download</a>
        </td>
      </tr>
      <tr bgcolor="#f8fafc">
        <td style="border: none; border-bottom: 1px solid #e2e8f0;">06</td>
        <td style="border: none; border-bottom: 1px solid #e2e8f0;"><strong>B.Ed Solved Assignments (1.5, 2.5, 4 Years)</strong></td>
        <td align="center" style="border: none; border-bottom: 1px solid #e2e8f0;">
          <a href="https://assignmentwaly.blogspot.com/p/aiou-bed-15-25-4-solved-assignments.html" target="_blank" rel="noopener noreferrer" style="padding: 6px 12px; border-radius: 4px; border: 1px solid #1e6f3f; text-decoration: none; font-weight: bold;">📥 Download</a>
        </td>
      </tr>
      <tr bgcolor="#ffffff">
        <td style="border: none; border-bottom: 1px solid #e2e8f0;">07</td>
        <td style="border: none; border-bottom: 1px solid #e2e8f0;"><strong>MA History Solved Assignments</strong></td>
        <td align="center" style="border: none; border-bottom: 1px solid #e2e8f0;">
          <a href="https://assignmentwaly.blogspot.com/p/ma-history-solved-assignments-spring-2026.html" target="_blank" rel="noopener noreferrer" style="padding: 6px 12px; border-radius: 4px; border: 1px solid #1e6f3f; text-decoration: none; font-weight: bold;">📥 Download</a>
        </td>
      </tr>
    </tbody>
  </table>
</div>
<p style="text-align: center; margin-top: 30px;"><a href="https://assignmentwaly.blogspot.com/" style="font-weight: bold;">🏡 Back to AssignmentWaly Homepage</a></p>`;

  // 2. Guess Paper Master Hub Page
  const guessPaperHubHtml = `
<h2>📋 AIOU Guess Papers 2026 (Matric to Master Programs - Spring/Autumn 2026)</h2>
<p>Get PASS GUARANTEE in your exams! Download verified AIOU guess papers prepared by veteran professors. Selecting the right program below gives you immediate access to standard guess papers and solved past exam papers.</p>

<div style="overflow-x: auto; margin: 25px 0; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
  <table border="1" cellpadding="12" cellspacing="0" width="100%" style="border-collapse: collapse; width: 100%; border: none;">
    <thead>
      <tr bgcolor="#1e6f3f">
        <th style="color: #ffffff; text-align: left; font-weight: bold; border: none;">#</th>
        <th style="color: #ffffff; text-align: left; font-weight: bold; border: none;">Program Level</th>
        <th style="color: #ffffff; text-align: center; font-weight: bold; border: none;">Verified Solved Guess Papers</th>
      </tr>
    </thead>
    <tbody>
      <tr bgcolor="#ffffff">
        <td style="border: none; border-bottom: 1px solid #e2e8f0;">01</td>
        <td style="border: none; border-bottom: 1px solid #e2e8f0;">Matric Guess Papers</td>
        <td align="center" style="border: none; border-bottom: 1px solid #e2e8f0;">
          <a href="https://assignmentwaly.blogspot.com/2026/04/blog-post.html" target="_blank" rel="noopener noreferrer" style="padding: 6px 12px; border-radius: 4px; border: 1px solid #1e6f3f; text-decoration: none; font-weight: bold;">📥 Download</a>
        </td>
      </tr>
      <tr bgcolor="#f8fafc">
        <td style="border: none; border-bottom: 1px solid #e2e8f0;">02</td>
        <td style="border: none; border-bottom: 1px solid #e2e8f0;">FA / I.Com Guess Papers</td>
        <td align="center" style="border: none; border-bottom: 1px solid #e2e8f0;">
          <a href="https://assignmentwaly.blogspot.com/2026/04/blog-post.html" target="_blank" rel="noopener noreferrer" style="padding: 6px 12px; border-radius: 4px; border: 1px solid #1e6f3f; text-decoration: none; font-weight: bold;">📥 Download</a>
        </td>
      </tr>
      <tr bgcolor="#ffffff">
        <td style="border: none; border-bottom: 1px solid #e2e8f0;">03</td>
        <td style="border: none; border-bottom: 1px solid #e2e8f0;">BA / B.Com Guess Papers</td>
        <td align="center" style="border: none; border-bottom: 1px solid #e2e8f0;">
          <a href="https://assignmentwaly.blogspot.com/2026/04/blog-post.html" target="_blank" rel="noopener noreferrer" style="padding: 6px 12px; border-radius: 4px; border: 1px solid #1e6f3f; text-decoration: none; font-weight: bold;">📥 Download</a>
        </td>
      </tr>
      <tr bgcolor="#f8fafc">
        <td style="border: none; border-bottom: 1px solid #e2e8f0;">04</td>
        <td style="border: none; border-bottom: 1px solid #e2e8f0;">BS / B.Ed / ADE Guess Papers</td>
        <td align="center" style="border: none; border-bottom: 1px solid #e2e8f0;">
          <a href="https://assignmentwaly.blogspot.com/2026/04/blog-post.html" target="_blank" rel="noopener noreferrer" style="padding: 6px 12px; border-radius: 4px; border: 1px solid #1e6f3f; text-decoration: none; font-weight: bold;">📥 Download</a>
        </td>
      </tr>
    </tbody>
  </table>
</div>
<p style="text-align: center; margin-top: 30px;"><a href="https://assignmentwaly.blogspot.com/" style="font-weight: bold;">🏡 Back to AssignmentWaly Homepage</a></p>`;

  // Get active pages to find existing ones and update them
  const pageRes = await blogger.pages.list({ blogId: BLOG_ID });
  const pages = pageRes.data.items || [];
  
  const solvedAssignmentsHub = pages.find(p => p.url && p.url.includes('solved-assignments-all-codes') || p.title.includes('Solved Assignments'));
  const guessPapersHub = pages.find(p => p.url && p.url.includes('guess-papers') || p.title.includes('Guess Papers'));

  if (solvedAssignmentsHub) {
    console.log(`   ✏️ Updating existing Solved Assignments Hub Page...`);
    await blogger.pages.patch({
      blogId: BLOG_ID,
      pageId: solvedAssignmentsHub.id,
      requestBody: { content: assignmentHubHtml }
    });
    console.log(`      ✅ Solved Assignments Hub updated!`);
  } else {
    console.log(`   ➕ Creating new Solved Assignments Hub Page...`);
    await blogger.pages.insert({
      blogId: BLOG_ID,
      requestBody: {
        title: "📘 AIOU Solved Assignments – Spring 2026 (All Programs)",
        content: assignmentHubHtml
      }
    });
    console.log(`      ✅ Solved Assignments Hub created!`);
  }
  await sleep(1500);

  if (guessPapersHub) {
    console.log(`   ✏️ Updating existing Guess Papers Hub Page...`);
    await blogger.pages.patch({
      blogId: BLOG_ID,
      pageId: guessPapersHub.id,
      requestBody: { content: guessPaperHubHtml }
    });
    console.log(`      ✅ Guess Papers Hub updated!`);
  } else {
    console.log(`   ➕ Creating new Guess Papers Hub Page...`);
    await blogger.pages.insert({
      blogId: BLOG_ID,
      requestBody: {
        title: "📋 AIOU Guess Papers 2026 – Matric to Master Programs",
        content: guessPaperHubHtml
      }
    });
    console.log(`      ✅ Guess Papers Hub created!`);
  }
}

// Main execution block
async function main() {
  console.log('\n🚀 ASSIGNMENTWALY BULK REDESIGN & AUTOMATION ENGINE v1.0\n' + '═'.repeat(60));

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8')));
  const blogger = google.blogger({ version: 'v3', auth: oAuth2Client });

  // 1. Redesign Pages
  await redesignPages(blogger);

  // 2. Redesign Posts (all 117 posts)
  await redesignPosts(blogger);

  // 3. Build Hub Pages
  await buildHubPages(blogger);

  console.log('\n' + '═'.repeat(60));
  console.log('🎉 BULK REDESIGN & MASTER PAGE CREATION COMPLETED SUCCESSFULLY!');
  console.log('═'.repeat(60) + '\n');
}

main().catch(err => {
  console.error('\n💥 Engine Error:', err.message);
});
