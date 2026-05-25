const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const BLOG_ID          = '8115094349902559510';
const PAGE_ID          = '7737743625819620161'; // ID of the aiou-assignments page
const HTML_DIR         = 'c:/Users/LENOVO/Downloads/Stitich';
const CREDENTIALS_FILE = path.join(HTML_DIR, 'client_secret.json');
const TOKEN_FILE       = path.join(HTML_DIR, 'token.json');

// Rebuild premium HTML content for AIOU Assignments Hub Page
const pageTitle = "📘 AIOU Solved Assignments – Spring 2026 (BS & Associate Degree AD Programs)";

const pageContent = `
<!-- ASSIGNMENTWALY AUTO POST – Solved Assignments Hub – Spring 2026 -->
<!-- Primary Keyword: AIOU Solved Assignments | Secondary: BS solved assignments, Associate Degree solved assignments, AIOU Spring 2026 -->

<p style="text-align: center; margin-top: 15px; margin-bottom: 20px;">
  <a href="https://wa.me/923702388998?text=I%20need%20AIOU%20Solved%20Assignments%20Spring%202026" style="background: linear-gradient(135deg, #25d366, #128c7e); color: white; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(37,211,102,0.3); transition: 0.3s; font-size: 16px;" target="_blank" rel="noopener noreferrer">💬 Order Handwritten Assignments on WhatsApp</a>
</p>

<blockquote style="border-left: 5px solid #1e6f3f; padding-left: 15px; margin: 20px 0; font-style: italic;">
  <strong>👨‍🏫 AIOU Tutor Advisory Note:</strong> Welcome to the official AssignmentWaly Resource Portal. All Solved Assignments for <strong>BS (4-Years / 2.5-Years / 2-Years)</strong> and <strong>Associate Degree (AD)</strong> programs for the <strong>Spring 2026</strong> semester are being uploaded here daily. Select your specific program below to download correct, premium solved assignments in PDF format.
</blockquote>

<h2>🎓 Associate Degree (AD) Solved Assignments – Spring 2026</h2>
<p>If you are enrolled in a 2-Year Associate Degree program (Arts, Commerce, LIS, Gender Studies), find your dedicated course solutions below. All files are high-quality, plagiarism-free, and optimized for maximum marks.</p>

<div style="overflow-x: auto;">
  <table border="1" cellpadding="12" style="border-collapse: collapse; width: 100%; border: 1px solid #ddd; margin: 15px 0;">
    <thead>
      <tr bgcolor="#1e6f3f" style="color: white;">
        <th>Program &amp; Course Name</th>
        <th>Semester Coverage</th>
        <th>Solved Assignment Link</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Associate Degree in Arts (English Compulsory)</strong></td>
        <td>1st to 4th Semester</td>
        <td align="center"><a href="https://assignmentwaly.blogspot.com/p/aiou-ad-english-odl-solved-assignments.html" style="color: #1e6f3f; font-weight: bold;" target="_blank" rel="noopener noreferrer">👉 View AD English Solved Assignments</a></td>
      </tr>
      <tr>
        <td><strong>Associate Degree in Library &amp; Information Sciences (LIS)</strong></td>
        <td>1st to 4th Semester</td>
        <td align="center"><a href="https://assignmentwaly.blogspot.com/p/aiou-ad-lis-odl-solved-assignments.html" style="color: #1e6f3f; font-weight: bold;" target="_blank" rel="noopener noreferrer">👉 View AD LIS Solved Assignments</a></td>
      </tr>
      <tr>
        <td><strong>Associate Degree in Gender &amp; Women Studies (ODL)</strong></td>
        <td>1st to 4th Semester</td>
        <td align="center"><a href="https://assignmentwaly.blogspot.com/p/aiou-ad-gender-women-studies-solved.html" style="color: #1e6f3f; font-weight: bold;" target="_blank" rel="noopener noreferrer">👉 View AD Gender Studies Solved Assignments</a></td>
      </tr>
      <tr>
        <td><strong>Associate Degree in History (ODL)</strong></td>
        <td>1st to 4th Semester</td>
        <td align="center"><a href="https://assignmentwaly.blogspot.com/p/aiou-ad-history-odl-solved-assignments.html" style="color: #1e6f3f; font-weight: bold;" target="_blank" rel="noopener noreferrer">👉 View AD History Solved Assignments</a></td>
      </tr>
    </tbody>
  </table>
</div>

<div style="margin: 25px 0;"></div>

<h2>📚 BS (Bachelor of Science) Solved Assignments – Spring 2026</h2>
<p>Complete solved assignments for 4-Years, 2.5-Years, and 2-Years BS ODL programs. Get 100% correct answers compiled by experienced university tutors to secure A+ grades in your LMS portal.</p>

<div style="overflow-x: auto;">
  <table border="1" cellpadding="12" style="border-collapse: collapse; width: 100%; border: 1px solid #ddd; margin: 15px 0;">
    <thead>
      <tr bgcolor="#1e6f3f" style="color: white;">
        <th>Program &amp; Course Name</th>
        <th>Semester Coverage</th>
        <th>Solved Assignment Link</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>BS English (ODL Program)</strong></td>
        <td>1st to 8th Semester</td>
        <td align="center"><a href="https://assignmentwaly.blogspot.com/p/aiou-bs-english-odl-solved-assignments.html" style="color: #1e6f3f; font-weight: bold;" target="_blank" rel="noopener noreferrer">👉 View BS English Solved Assignments</a></td>
      </tr>
      <tr>
        <td><strong>BS Library &amp; Information Sciences (LIS)</strong></td>
        <td>1st to 8th Semester</td>
        <td align="center"><a href="https://assignmentwaly.blogspot.com/p/aiou-bs-lis-odl-solved-assignments.html" style="color: #1e6f3f; font-weight: bold;" target="_blank" rel="noopener noreferrer">👉 View BS LIS Solved Assignments</a></td>
      </tr>
      <tr>
        <td><strong>BS Mass Communication (ODL)</strong></td>
        <td>1st to 8th Semester</td>
        <td align="center"><a href="https://assignmentwaly.blogspot.com/p/aiou-bs-mass-communication-solved.html" style="color: #1e6f3f; font-weight: bold;" target="_blank" rel="noopener noreferrer">👉 View BS Mass Comm Solved Assignments</a></td>
      </tr>
      <tr>
        <td><strong>BS History (ODL Program)</strong></td>
        <td>1st to 8th Semester</td>
        <td align="center"><a href="https://assignmentwaly.blogspot.com/p/aiou-bs-history-odl-solved-assignments.html" style="color: #1e6f3f; font-weight: bold;" target="_blank" rel="noopener noreferrer">👉 View BS History Solved Assignments</a></td>
      </tr>
    </tbody>
  </table>
</div>

<div style="margin: 30px 0;"></div>

<h3>📝 AIOU Assignment Submission Guidelines for Spring 2026</h3>
<p>To avoid common mistakes and secure full marks on your LMS, follow these expert rules by our AIOU Coordinator:</p>
<ul>
  <li><strong>BS and AD typed assignments:</strong> Plagiarism must be below 19%. Avoid exact copy-pasting from online helping materials. Use our solved answers as a premium guideline and write the final answers in your own words.</li>
  <li><strong>Aaghi LMS Submission format:</strong> Ensure all assignments are in PDF format and the file size does not exceed 5MB.</li>
  <li><strong>Handwritten Assignments Service:</strong> If you do not have enough time or a laptop, you can hire our professional writers to compile neat, plagiarism-free, and premium quality assignments for you at extremely affordable prices.</li>
</ul>

<p style="text-align: center; margin-top: 30px; margin-bottom: 15px;">
  <a href="https://assignmentwaly.blogspot.com/" target="_blank" rel="noopener noreferrer" style="font-weight: bold; color: #1e6f3f; text-decoration: none; font-size: 16px;">🏠 Back to AssignmentWaly Homepage</a>
</p>

<!-- ========== ASSIGNMENTWALY AUTO-OPTIMIZATION QA CHECKLIST ==========
- [x] Raw HTML wrappers (html, head, body) successfully stripped.
- [x] Clashing custom <style> tags and layout override classes removed.
- [x] SEO Heading hierarchy safeguarded: H1 normalized to H2.
- [x] All outbound links secured with target="_blank" and rel="noopener noreferrer".
- [x] Tables fully wrapped in overflow-x responsive scroll containers.
- [x] Core internal linking backlink to home directory appended.
=================================================================== -->
`;

async function main() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8')));
  const blogger = google.blogger({ version: 'v3', auth: oAuth2Client });

  console.log(`📡 Updating Hub Page ID ${PAGE_ID}...`);
  
  const res = await blogger.pages.update({
    blogId: BLOG_ID,
    pageId: PAGE_ID,
    requestBody: {
      id: PAGE_ID,
      title: pageTitle,
      content: pageContent
    }
  });

  console.log(`🎉 Successfully updated page!`);
  console.log(`New Title: ${res.data.title}`);
  console.log(`URL: ${res.data.url}`);
}

main().catch(console.error);
