const fs = require('fs');
const https = require('https');
const path = require('path');

const BLOG_ID = '8115094349902559510';
const FEED_URL = `https://www.blogger.com/feeds/${BLOG_ID}/posts/default?alt=json&max-results=500`;
const OUTPUT_FILE = path.join(__dirname, 'blogger_posts_list.md');

console.log('📡 Fetching posts from Blogger feed...');

https.get(FEED_URL, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const parsedData = JSON.parse(data);
      const entries = parsedData.feed.entry || [];
      console.log(`✅ Found ${entries.length} posts in Blogger.`);

      let markdown = `# Blogger Posts List — ${new Date().toLocaleDateString()}\n\n`;
      markdown += `Total Posts Found: **${entries.length}**\n\n`;
      markdown += `| # | Post Title | Post ID | URL / Slug |\n`;
      markdown += `|---|------------|---------|------------|\n`;

      const postsList = entries.map((entry, index) => {
        const title = entry.title.$t || 'No Title';
        const idUri = entry.id.$t;
        const postId = idUri.split('.post-')[1] || idUri;
        
        let alternateUrl = '';
        const alternateLink = entry.link.find(l => l.rel === 'alternate');
        if (alternateLink) {
          alternateUrl = alternateLink.href;
        }

        const slug = alternateUrl ? alternateUrl.split('/').pop() : '';

        markdown += `| ${index + 1} | **${title}** | \`${postId}\` | [${slug}](${alternateUrl}) |\n`;

        return {
          index: index + 1,
          title,
          postId,
          url: alternateUrl,
          slug
        };
      });

      fs.writeFileSync(OUTPUT_FILE, markdown, 'utf8');
      console.log(`🎉 Markdown file generated successfully: ${OUTPUT_FILE}`);
      
      // Also write JSON for easy reading/mapping by other scripts
      fs.writeFileSync(path.join(__dirname, 'blogger_posts.json'), JSON.stringify(postsList, null, 2), 'utf8');
      console.log(`🎉 JSON file generated successfully: blogger_posts.json`);

    } catch (e) {
      console.error('❌ Error parsing Blogger JSON:', e.message);
    }
  });
}).on('error', (err) => {
  console.error('❌ HTTP request failed:', err.message);
});
