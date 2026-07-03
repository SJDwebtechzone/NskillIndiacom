const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'routes');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') && f !== 'restore.js');
let results = [];

for (const f of files) {
  const content = fs.readFileSync(path.join(dir, f), 'utf-8');
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/SELECT.*FROM/i) || lines[i].match(/FROM\s+[a-zA-Z_]+/i)) {
      results.push({ file: f, line: i + 1, content: lines[i].trim() });
    }
  }
}

fs.writeFileSync('selects.json', JSON.stringify(results, null, 2));
console.log(`Found ${results.length} SELECTs`);
