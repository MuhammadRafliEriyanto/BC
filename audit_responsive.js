const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src/components').concat(walk('src/app'));
const responsiveRegex = /(?:^|\s|["'`])(sm|md|lg|xl|2xl|max-sm|max-md|max-lg|max-xl):/;

const notResponsive = [];
const responsive = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (responsiveRegex.test(content)) {
    responsive.push(file);
  } else {
    // Only check if it actually has JSX elements, some might just be exports or contexts
    if (content.includes('<') && content.includes('className=')) {
        notResponsive.push(file);
    }
  }
});

fs.writeFileSync('audit_responsive.json', JSON.stringify({ notResponsive, responsive }, null, 2));
console.log('Total not responsive:', notResponsive.length);
console.log('Total responsive:', responsive.length);
