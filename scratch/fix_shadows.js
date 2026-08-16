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

// Let's also include src/components
const compDir = path.join('apps', 'furr-owner', 'src', 'components');
if (fs.existsSync(compDir)) {
  files.push(...walk(compDir));
}

let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  const shadowRegex = /(?:shadowColor|shadowOpacity|shadowRadius|shadowOffset|elevation)\s*:\s*(?:{[^}]*}|[^,}\n]+)(?:\s*,\s*)?/g;
  
  if (content.match(shadowRegex)) {
    // Check if `shadows` is imported from @furr/ui
    if (!content.includes('shadows') && content.includes('@furr/ui')) {
      content = content.replace(/import\s+{([^}]*)}\s+from\s+'@furr\/ui'/, (match, imports) => {
        if (!imports.includes('shadows')) {
          return `import { ${imports.trim()}, shadows } from '@furr/ui'`;
        }
        return match;
      });
    }

    // Now replace the block of shadow properties
    const lines = content.split('\n');
    let changed = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('shadowColor')) {
        lines[i] = lines[i].replace(/shadowColor:\s*[^,]+,\s*/g, '');
        lines[i] = lines[i].replace(/shadowOpacity:\s*[^,]+,\s*/g, '');
        lines[i] = lines[i].replace(/shadowRadius:\s*[^,]+,\s*/g, '');
        lines[i] = lines[i].replace(/shadowOffset:\s*{[^}]+},\s*/g, '');
        lines[i] = lines[i].replace(/elevation:\s*\d+,?\s*/g, '');
        
        lines[i] = lines[i].replace(/}\s*,?$/, ' ...shadows.md },');
        lines[i] = lines[i].replace(/} \]/, ' ...shadows.md } ]');
        lines[i] = lines[i].replace(/} \),/, ' ...shadows.md } ),');
        changed = true;
      }
    }
    
    if (changed) {
      content = lines.join('\n');
      fs.writeFileSync(file, content, 'utf8');
      modifiedCount++;
    }
  }
});

console.log(`Modified ${modifiedCount} files`);
