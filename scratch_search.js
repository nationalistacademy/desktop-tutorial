const fs = require('fs');
const path = require('path');

const backupPath = 'c:/Users/LENOVO/Downloads/Stitich/assignmentwaly_backup.xml';
if (fs.existsSync(backupPath)) {
  const content = fs.readFileSync(backupPath, 'utf8');
  console.log('Backup file size:', content.length);
  
  // Let's find occurrences of "aiou-assignments"
  let index = 0;
  while (true) {
    index = content.indexOf('aiou-assignments', index);
    if (index === -1) break;
    const start = Math.max(0, index - 200);
    const end = Math.min(content.length, index + 300);
    console.log(`\n--- Match at index ${index} ---`);
    console.log(content.substring(start, end));
    index += 20;
  }
} else {
  console.log('Backup file does not exist.');
}
