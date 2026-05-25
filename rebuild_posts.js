const fs = require('fs');
const path = require('path');

// -------------------------------------------------------------------
// post_template.html – simple placeholder for the unified template
// -------------------------------------------------------------------
const TEMPLATE_PATH = path.join(__dirname, 'post_template.html');
if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error('❌ post_template.html not found – abort');
  process.exit(1);
}
const TEMPLATE = fs.readFileSync(TEMPLATE_PATH, 'utf8');

// -------------------------------------------------------------------
// Helper: extract title from existing HTML (fallback to filename)
// -------------------------------------------------------------------
function extractTitle(html, filename) {
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  if (titleMatch) return titleMatch[1].trim();
  // fallback: first H2 or H1
  const h2 = html.match(/<h2[^>]*>([^<]*)<\/h2>/i);
  if (h2) return h2[1].trim();
  const h1 = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
  if (h1) return h1[1].trim();
  // fallback to filename (without extension)
  return path.basename(filename, '.html').replace(/_/g, ' ');
}

// -------------------------------------------------------------------
// Main – iterate over all .html files in the directory (excluding template)
// -------------------------------------------------------------------
const HTML_DIR = 'c:/Users/LENOVO/Downloads/Stitich';
const files = fs.readdirSync(HTML_DIR).filter(f => f.endsWith('.html') && f !== 'post_template.html');
let updatedCount = 0;
files.forEach(file => {
  const fullPath = path.join(HTML_DIR, file);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const title = extractTitle(raw, file);

  // Simple placeholder table – you can later replace with real data
  const simpleTable = `<table border="1" style="border-collapse:collapse; width:100%;"><tr><th>Assignment</th><th>Deadline</th></tr><tr><td>${title}</td><td>Coming Soon</td></tr></table>`;

  // Replace placeholders in the template
  let newContent = TEMPLATE.replace('{{TABLE}}', simpleTable)
                         .replace('{{CONTENT}}', raw)
                         .replace('{{PDF_URL}}', '#'); // placeholder PDF link
  // Ensure an H2 heading exists (use title)
  if (!/\<h2[^>]*\>/i.test(newContent)) {
    newContent = `<h2>${title}</h2>\n` + newContent;
  }

  fs.writeFileSync(fullPath, newContent, 'utf8');
  updatedCount++;
  console.log(`✅ Rebuilt ${file}`);
});

console.log(`\n📄 Rebuild complete – ${updatedCount} files updated.`);
