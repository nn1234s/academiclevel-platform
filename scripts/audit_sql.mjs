import fs from 'node:fs';

const content = fs.readFileSync('server/api.js', 'utf8');
const lines = content.split('\n');
console.log('Scanning server/api.js for potential SQL string interpolation:');
let count = 0;
lines.forEach((l, i) => {
  if ((l.includes('db.prepare') || l.includes('db.exec')) && (l.includes('${') || l.includes(' + '))) {
    console.log(`${i + 1}: ${l.trim()}`);
    count++;
  }
});
console.log(`Total found: ${count}`);
