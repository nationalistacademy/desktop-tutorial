const fs = require('fs');
const path = require('path');

const targetFile = path.join('c:/Users/LENOVO/Downloads/Stitich', 'assignmentwaly.xml');

if (!fs.existsSync(targetFile)) {
  console.error(`❌ File not found at: ${targetFile}`);
  process.exit(1);
}

const content = fs.readFileSync(targetFile, 'utf-8');

const openCount = (content.match(/<!--/g) || []).length;
const closeCount = (content.match(/-->/g) || []).length;

console.log(`Open count (<!--): ${openCount}`);
console.log(`Close count (-->): ${closeCount}`);
