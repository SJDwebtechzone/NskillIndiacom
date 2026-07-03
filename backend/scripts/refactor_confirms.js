const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '../../frontend/app/dashboard');

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else if (filePath.endsWith('.tsx') && !filePath.includes('restore\\page.tsx') && !filePath.includes('restore/page.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = getFiles(frontendDir);
let updatedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Match window.confirm(...) or confirm(...) that has the word delete in it
  // This avoids accidentally changing confirm dialogs that aren't about deletion.
  const confirmRegex = /(?:window\.)?confirm\(\s*(["'`])(.*?delete.*?)\1\s*\)/gi;
  
  const newContent = content.replace(confirmRegex, (match, quote, innerText) => {
    return `window.confirm("Move this record to Restore? This record can be restored within 30 days. After 30 days it will be permanently deleted automatically.")`;
  });

  // Also handle template literals with variables `...delete...${...}...`
  const templateRegex = /(?:window\.)?confirm\(\s*`(.*?delete.*?)`\s*\)/gi;
  const newContent2 = newContent.replace(templateRegex, (match, innerText) => {
    return `window.confirm("Move this record to Restore? This record can be restored within 30 days. After 30 days it will be permanently deleted automatically.")`;
  });

  if (content !== newContent2) {
    fs.writeFileSync(file, newContent2, 'utf8');
    console.log(`Updated confirms in ${path.relative(frontendDir, file)}`);
    updatedCount++;
  }
}

console.log(`Finished updating confirmations. Updated ${updatedCount} files.`);
