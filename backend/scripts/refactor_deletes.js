const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '../routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

let updatedCount = 0;

for (const file of files) {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex to match "DELETE FROM table_name WHERE condition"
  // Example: DELETE FROM jobs WHERE id = $1
  const deleteRegex = /DELETE\s+FROM\s+([a-zA-Z0-9_]+)\s+WHERE\s+(.*?)(["'`])/g;
  
  // We need to handle variations:
  // "DELETE FROM table WHERE id = $1"
  // `DELETE FROM table WHERE id = $1`
  // 'DELETE FROM table WHERE id = $1'

  const newContent = content.replace(deleteRegex, (match, tableName, condition, quote) => {
    // If it's the contact_info table which is truncated, skip it
    if (tableName === 'contact_info' && !condition) return match; 
    
    // We replace it with UPDATE table SET is_deleted = true, deleted_at = NOW() WHERE condition
    return `UPDATE ${tableName} SET is_deleted = true, deleted_at = NOW() WHERE ${condition}${quote}`;
  });

  // Handle DELETE FROM table without WHERE (like DELETE FROM contact_info)
  // Actually, there's `DELETE FROM contact_info` on line 71 of contact_info.js.
  // We can just leave that as is, because it's probably a truncate before insert.
  
  // Let's also handle "DELETE FROM table" without WHERE if there are any that need soft delete.
  // We'll just stick to the regex that requires WHERE.
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${file}`);
    updatedCount++;
  }
}

console.log(`Finished. Updated ${updatedCount} files.`);
