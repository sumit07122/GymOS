const fs = require('fs');
const path = require('path');

function getAllFiles(dir, exts = ['.tsx', '.ts']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
        results = results.concat(getAllFiles(fullPath, exts));
      }
    } else {
      if (exts.includes(path.extname(file))) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

// 1. Gather all Next.js App Router route pages
const appDir = path.join('src', 'app');
const appFiles = getAllFiles(appDir, ['.tsx', '.ts']);
const routes = [];

appFiles.forEach(file => {
  const base = path.basename(file);
  if (base.startsWith('page.')) {
    let rel = path.relative(appDir, path.dirname(file)).replace(/\\/g, '/');
    // strip route groups like (auth), (dashboard), (admin)
    const cleanRoute = '/' + rel.split('/').filter(p => !p.startsWith('(') && !p.endsWith(')') && p !== '.').join('/');
    routes.push({
      file,
      cleanRoute: cleanRoute === '//' ? '/' : cleanRoute,
      rawPath: rel
    });
  }
});

console.log('=== APP ROUTER REGISTERED ROUTES ===');
routes.forEach(r => console.log(r.cleanRoute, '->', r.file));

// 2. Scan all files in src for links (href)
const allSrcFiles = getAllFiles('src');
const links = [];
const hashLinks = [];
const brokenLinks = [];

const hrefRegex = /href=["']([^"']+)["']/g;

allSrcFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = hrefRegex.exec(content)) !== null) {
    const href = match[1];
    if (href.startsWith('#')) {
      hashLinks.push({ file, href });
    } else if (href.startsWith('/')) {
      links.push({ file, href });
    }
  }
});

console.log('\n=== LINK AUDIT SUMMARY ===');
console.log('Total internal links:', links.length);
console.log('Total anchor hash links:', hashLinks.length);

const uniqueHrefs = [...new Set(links.map(l => l.href))];
console.log('\nUnique internal links:');
uniqueHrefs.sort().forEach(h => console.log(' ', h));

// 3. Scan for dead buttons: buttons with type="button" and no onClick, or form submit without onSubmit
console.log('\n=== BUTTON AUDIT ===');
let emptyButtons = [];
allSrcFiles.filter(f => f.endsWith('.tsx')).forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Match <button ... > without onClick
  const buttonMatches = content.match(/<button[^>]*>/g) || [];
  buttonMatches.forEach(btn => {
    if (!btn.includes('onClick') && !btn.includes('type="submit"') && !btn.includes("type='submit'") && !btn.includes('form=') && !btn.includes('disabled')) {
      emptyButtons.push({ file, btn: btn.slice(0, 80) });
    }
  });
});
console.log('Buttons potentially missing handlers:', emptyButtons.length);
emptyButtons.slice(0, 15).forEach(b => console.log(' ', path.basename(b.file), ':', b.btn));

