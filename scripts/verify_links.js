const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, '..', 'src', 'app');

function getDefinedRoutes(dir, baseRoute = '') {
  let routes = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name.startsWith('(') && entry.name.endsWith(')')) {
        // Route group, doesn't add to path
        routes = routes.concat(getDefinedRoutes(path.join(dir, entry.name), baseRoute));
      } else {
        const nextRoute = baseRoute === '' ? `/${entry.name}` : `${baseRoute}/${entry.name}`;
        routes = routes.concat(getDefinedRoutes(path.join(dir, entry.name), nextRoute));
      }
    } else if (entry.name === 'page.tsx' || entry.name === 'page.js') {
      routes.push(baseRoute === '' ? '/' : baseRoute);
    }
  }
  return routes;
}

function scanLinksInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const links = [];
  // Match href="..." and href={`...`}
  const staticMatches = content.matchAll(/href=["'](\/[^"'#?]*)["']/g);
  for (const m of staticMatches) {
    links.push({ file: filePath, href: m[1] });
  }
  return links;
}

function getAllFiles(dir, extensions = ['.tsx', '.ts']) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, extensions));
    } else if (extensions.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function routeMatches(href, definedRoutes) {
  if (href === '/') return true;
  for (const route of definedRoutes) {
    // Exact match
    if (route === href) return true;
    
    // Convert [param] to regex wildcard
    const regexStr = '^' + route.replace(/\[\.\.\.[^\]]+\]/g, '.*').replace(/\[[^\]]+\]/g, '[^/]+') + '$';
    const regex = new RegExp(regexStr);
    if (regex.test(href)) return true;
  }
  return false;
}

function main() {
  const definedRoutes = getDefinedRoutes(APP_DIR);
  console.log(`Discovered ${definedRoutes.length} defined routes in Next.js app:`);
  console.log(definedRoutes.sort().join('\n'));

  const srcDir = path.join(__dirname, '..', 'src');
  const allFiles = getAllFiles(srcDir);
  console.log(`\nScanning ${allFiles.length} source files for internal links...`);

  const allLinks = [];
  for (const f of allFiles) {
    allLinks.push(...scanLinksInFile(f));
  }

  console.log(`Found ${allLinks.length} static internal links.`);

  let brokenCount = 0;
  const checked = new Set();

  for (const link of allLinks) {
    if (checked.has(link.href)) continue;
    checked.add(link.href);

    const ok = routeMatches(link.href, definedRoutes);
    if (!ok) {
      console.error(`BROKEN LINK: ${link.href} in ${path.relative(process.cwd(), link.file)}`);
      brokenCount++;
    }
  }

  if (brokenCount === 0) {
    console.log(`\nALL ${checked.size} UNIQUE INTERNAL LINKS VALIDATED SUCCESSFULLY! 0 BROKEN LINKS.`);
  } else {
    console.error(`\nFound ${brokenCount} broken link destinations!`);
    process.exit(1);
  }
}

main();

