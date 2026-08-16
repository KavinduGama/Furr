const fs = require('fs');
const path = require('path');

const targetDir = path.join('apps', 'furr-owner', 'app');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(targetDir);
const compDir = path.join('apps', 'furr-owner', 'src', 'components');
if (fs.existsSync(compDir)) {
  files.push(...walk(compDir));
}

let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace lines that have a word followed by space(s) and then ...shadows
  // e.g. `marginHorizontal: space.lg  ...shadows.md` -> `marginHorizontal: space.lg, ...shadows.md`
  const newContent = content.replace(/([A-Za-z0-9_'\".]+)\s+\.\.\.shadows/g, (match, before) => {
    changed = true;
    return `${before}, ...shadows`;
  });

  if (changed) {
    fs.writeFileSync(file, newContent, 'utf8');
    modifiedCount++;
  }
});

console.log(`Fixed commas in ${modifiedCount} files`);
