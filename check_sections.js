const fs = require('fs');
const content = fs.readFileSync('assignmentwaly.xml', 'utf-8');

const openCount = (content.match(/<!--/g) || []).length;
const closeCount = (content.match(/-->/g) || []).length;

console.log(`Open count (<!--): ${openCount}`);
console.log(`Close count (-->): ${closeCount}`);
