/**
 * deep_audit_v2.js — AssignmentWaly Comprehensive Blog Audit Engine
 * ─────────────────────────────────────────────────────────────────────
 * Runs a multi-layered audit on ALL Blogger pages and posts:
 *
 *  1. SEO Audit      — H2 present, keyword in heading, title length
 *  2. Content Audit  — Word count (AdSense wants 500+, ideally 1500+)
 *  3. Style Audit    — <style> tags, inline overrides, DOCTYPE wrappers
 *  4. Link Audit     — Homepage backlink present, links have target+rel
 *  5. Table Audit    — Tables wrapped in overflow-x container
 *  6. Internal Links — At least 2 internal assignmentwaly links per post
 *
 * At the end, generates a full JSON report + console summary.
 */

const fs   = require('fs');
const path = require('path');
const { google } = require('googleapis');

const BLOG_ID         = '8115094349902559510';
const HTML_DIR        = 'c:/Users/LENOVO/Downloads/Stitich';
const CREDENTIALS_FILE = path.join(HTML_DIR, 'client_secret.json');
const TOKEN_FILE       = path.join(HTML_DIR, 'token.json');
const REPORT_FILE      = path.join(HTML_DIR, 'audit_report.json');
const REPORT_MD        = path.join(HTML_DIR, 'audit_report.md');

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── Helpers ────────────────────────────────────────────────────────────────

function countWords(html) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.split(' ').filter(w => w.length > 1).length;
}

function auditItem(type, id, title, content) {
  const issues   = [];
  const warnings = [];
  const passes   = [];

  // ── 1. Style Audit ──────────────────────────────────────────────────────
  if (/<style[\s>]/i.test(content)) {
    issues.push('❌ Contains <style> tag (clashes with Blogger theme)');
  } else {
    passes.push('✅ No <style> tags');
  }
  if (/<!DOCTYPE html/i.test(content)) {
    issues.push('❌ Contains <!DOCTYPE html> wrapper');
  }
  if (/<html[\s>]/i.test(content)) {
    issues.push('❌ Contains <html> wrapper');
  }
  if (/<head[\s>]/i.test(content)) {
    issues.push('❌ Contains <head> wrapper');
  }

  // ── 2. SEO / Heading Audit ───────────────────────────────────────────────
  if (/<h1[\s>]/i.test(content)) {
    issues.push('❌ Contains <h1> heading (should be <h2>)');
  } else {
    passes.push('✅ No <h1> tags');
  }
  if (!/<h2[\s>]/i.test(content)) {
    issues.push('❌ Missing <h2> heading (required for SEO)');
  } else {
    passes.push('✅ Has <h2> heading');
  }

  // ── 3. Title length ──────────────────────────────────────────────────────
  if (title.length > 70) {
    warnings.push(`⚠️ Title too long (${title.length} chars, ideal < 70 for SEO)`);
  } else if (title.length < 20) {
    warnings.push(`⚠️ Title too short (${title.length} chars)`);
  } else {
    passes.push(`✅ Title length OK (${title.length} chars)`);
  }

  // ── 4. Content / Word Count ──────────────────────────────────────────────
  const wordCount = countWords(content);
  if (wordCount < 300) {
    issues.push(`❌ Very thin content (${wordCount} words — AdSense may reject)`);
  } else if (wordCount < 800) {
    warnings.push(`⚠️ Low word count (${wordCount} words — aim for 800+)`);
  } else if (wordCount < 1500) {
    warnings.push(`⚠️ Moderate content (${wordCount} words — ideal is 1500+)`);
  } else {
    passes.push(`✅ Strong content (${wordCount} words)`);
  }

  // ── 5. Homepage Backlink ─────────────────────────────────────────────────
  if (!/assignmentwaly\.blogspot\.com/i.test(content)) {
    issues.push('❌ Missing homepage backlink (assignmentwaly.blogspot.com)');
  } else {
    passes.push('✅ Homepage backlink present');
  }

  // ── 6. Internal Links ────────────────────────────────────────────────────
  const internalLinkMatches = content.match(/href="https?:\/\/assignmentwaly\.blogspot\.com[^"]*"/gi) || [];
  if (internalLinkMatches.length < 2) {
    warnings.push(`⚠️ Only ${internalLinkMatches.length} internal link(s) — recommend 3+`);
  } else {
    passes.push(`✅ ${internalLinkMatches.length} internal links`);
  }

  // ── 7. Table Audit ───────────────────────────────────────────────────────
  const tableCount = (content.match(/<table[\s>]/gi) || []).length;
  if (tableCount > 0) {
    const wrappedCount = (content.match(/overflow-x:\s*auto/gi) || []).length;
    if (wrappedCount < tableCount) {
      issues.push(`❌ ${tableCount - wrappedCount}/${tableCount} table(s) not in overflow-x wrapper`);
    } else {
      passes.push(`✅ All ${tableCount} table(s) wrapped in overflow-x container`);
    }
  }

  // ── 8. Link Security ─────────────────────────────────────────────────────
  const allLinks = content.match(/<a\s[^>]+>/gi) || [];
  const insecureLinks = allLinks.filter(a =>
    !/target\s*=\s*["']_blank["']/i.test(a) ||
    !/rel\s*=\s*["']noopener\s+noreferrer["']/i.test(a)
  );
  if (insecureLinks.length > 0) {
    warnings.push(`⚠️ ${insecureLinks.length} link(s) missing target="_blank" or rel="noopener noreferrer"`);
  } else if (allLinks.length > 0) {
    passes.push(`✅ All ${allLinks.length} link(s) are secure`);
  }

  // ── 9. QA Checklist Present ──────────────────────────────────────────────
  if (!content.includes('ASSIGNMENTWALY AUTO-OPTIMIZATION QA CHECKLIST')) {
    warnings.push('⚠️ Missing QA checklist comment');
  } else {
    passes.push('✅ QA checklist comment present');
  }

  const score = Math.round((passes.length / (passes.length + issues.length + warnings.length * 0.5)) * 100);

  return {
    type,
    id,
    title,
    wordCount: countWords(content),
    score,
    issues,
    warnings,
    passes,
    needsWork: issues.length > 0 || warnings.length > 0
  };
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🔍 ASSIGNMENTWALY DEEP AUDIT ENGINE v2\n' + '═'.repeat(60));

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8')));
  const blogger = google.blogger({ version: 'v3', auth: oAuth2Client });

  const report = { pages: [], posts: [], summary: {} };

  // ── Audit Pages ───────────────────────────────────────────────────────────
  console.log('\n📃 Auditing Pages...');
  const pagesRes = await blogger.pages.list({ blogId: BLOG_ID });
  const pages    = pagesRes.data.items || [];
  console.log(`   Found ${pages.length} pages.`);

  for (const page of pages) {
    const result = auditItem('page', page.id, page.title || '(untitled)', page.content || '');
    report.pages.push(result);
    const icon = result.issues.length > 0 ? '🔴' : result.warnings.length > 0 ? '🟡' : '🟢';
    console.log(`   ${icon} [${result.score}%] "${result.title}" — ${result.issues.length} issues, ${result.warnings.length} warnings`);
    await sleep(300);
  }

  // ── Audit Posts ───────────────────────────────────────────────────────────
  console.log('\n📝 Auditing Live Posts...');
  let pageToken = null;
  let allPosts  = [];

  do {
    const postsRes = await blogger.posts.list({
      blogId: BLOG_ID,
      status: ['live'],
      maxResults: 50,
      pageToken
    });
    allPosts = allPosts.concat(postsRes.data.items || []);
    pageToken = postsRes.data.nextPageToken || null;
    await sleep(500);
  } while (pageToken);

  console.log(`   Found ${allPosts.length} live posts.`);

  for (const post of allPosts) {
    const result = auditItem('post', post.id, post.title || '(untitled)', post.content || '');
    report.posts.push(result);
    const icon = result.issues.length > 0 ? '🔴' : result.warnings.length > 0 ? '🟡' : '🟢';
    console.log(`   ${icon} [${result.score}%] "${result.title}" — ${result.wordCount}w, ${result.issues.length} issues, ${result.warnings.length} warnings`);
    await sleep(200);
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  const allItems       = [...report.pages, ...report.posts];
  const totalIssues    = allItems.reduce((a, i) => a + i.issues.length, 0);
  const totalWarnings  = allItems.reduce((a, i) => a + i.warnings.length, 0);
  const criticalItems  = allItems.filter(i => i.issues.length > 0);
  const warningItems   = allItems.filter(i => i.issues.length === 0 && i.warnings.length > 0);
  const healthyItems   = allItems.filter(i => i.issues.length === 0 && i.warnings.length === 0);
  const avgScore       = Math.round(allItems.reduce((a, i) => a + i.score, 0) / allItems.length);
  const avgWords       = Math.round(allItems.reduce((a, i) => a + i.wordCount, 0) / allItems.length);
  const thinContent    = allItems.filter(i => i.wordCount < 500);
  const needMoreWords  = allItems.filter(i => i.wordCount >= 500 && i.wordCount < 1500);

  report.summary = {
    totalItems: allItems.length,
    avgHealthScore: avgScore,
    avgWordCount: avgWords,
    criticalIssues: criticalItems.length,
    warnings: warningItems.length,
    healthy: healthyItems.length,
    totalIssueCount: totalIssues,
    totalWarningCount: totalWarnings,
    thinContent: thinContent.length,
    needMoreContent: needMoreWords.length
  };

  // ── Write Report Files ───────────────────────────────────────────────────
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));

  // Generate Markdown Report
  let md = `# AssignmentWaly Deep Audit Report\n`;
  md += `**Generated:** ${new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}\n\n`;
  md += `## Summary\n\n`;
  md += `| Metric | Value |\n|---|---|\n`;
  md += `| Total Items Audited | ${report.summary.totalItems} |\n`;
  md += `| Average Health Score | ${report.summary.avgHealthScore}% |\n`;
  md += `| Average Word Count | ${report.summary.avgWordCount} words |\n`;
  md += `| 🔴 Critical Issues | ${report.summary.criticalIssues} items |\n`;
  md += `| 🟡 Warnings Only | ${report.summary.warnings} items |\n`;
  md += `| 🟢 Healthy Items | ${report.summary.healthy} items |\n`;
  md += `| Thin Content (<500w) | ${report.summary.thinContent} items |\n`;
  md += `| Needs More Content (<1500w) | ${report.summary.needMoreContent} items |\n\n`;

  md += `## 🔴 Critical Issues (Needs Immediate Fix)\n\n`;
  if (criticalItems.length === 0) {
    md += `*No critical issues found! ✅*\n\n`;
  } else {
    for (const item of criticalItems) {
      md += `### ${item.type.toUpperCase()}: ${item.title}\n`;
      md += `- **Score:** ${item.score}% | **Words:** ${item.wordCount}\n`;
      for (const issue of item.issues) md += `- ${issue}\n`;
      for (const warn  of item.warnings) md += `- ${warn}\n`;
      md += `\n`;
    }
  }

  md += `## 🟡 Warnings (Should Improve)\n\n`;
  if (warningItems.length === 0) {
    md += `*No warning-level items! ✅*\n\n`;
  } else {
    for (const item of warningItems) {
      md += `### ${item.type.toUpperCase()}: ${item.title}\n`;
      md += `- **Score:** ${item.score}% | **Words:** ${item.wordCount}\n`;
      for (const warn of item.warnings) md += `- ${warn}\n`;
      md += `\n`;
    }
  }

  md += `## 🟢 Healthy Items\n\n`;
  for (const item of healthyItems) {
    md += `- ✅ [${item.score}%] **${item.title}** (${item.wordCount} words)\n`;
  }

  fs.writeFileSync(REPORT_MD, md);

  // ── Console Summary ──────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(60));
  console.log('📊 AUDIT COMPLETE — SUMMARY');
  console.log('═'.repeat(60));
  console.log(`   Total Items Audited  : ${report.summary.totalItems}`);
  console.log(`   Avg Health Score     : ${report.summary.avgHealthScore}%`);
  console.log(`   Avg Word Count       : ${report.summary.avgWordCount} words`);
  console.log(`   🔴 Critical Items    : ${report.summary.criticalIssues}`);
  console.log(`   🟡 Warning Items     : ${report.summary.warnings}`);
  console.log(`   🟢 Healthy Items     : ${report.summary.healthy}`);
  console.log(`   📄 Thin Content      : ${report.summary.thinContent} posts (<500 words)`);
  console.log(`   📝 Needs More Words  : ${report.summary.needMoreContent} posts (<1500 words)`);
  console.log('═'.repeat(60));
  console.log(`\n📁 Full report saved to:\n   ${REPORT_FILE}\n   ${REPORT_MD}\n`);
}

main().catch(err => {
  console.error('\n💥 Audit Engine Error:', err.message);
});
