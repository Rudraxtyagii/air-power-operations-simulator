const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '..', 'frontend', 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

console.log('Auditing pages:');
files.forEach(file => {
  const content = fs.readFileSync(path.join(pagesDir, file), 'utf8');
  const returnMatch = content.match(/return\s*\(\s*<div\s+className=["']([^"']+)["']/);
  console.log(`\n=== ${file} ===`);
  if (returnMatch) {
    console.log('Root container classes:', returnMatch[1]);
  } else {
    console.log('No direct return <div match');
  }

  // Look for fixed widths that might cause overflow (e.g. w-[...px] or w-[1...])
  const fixedWidths = content.match(/w-\[\d+px\]/g);
  if (fixedWidths) {
    console.log('Fixed widths found:', [...new Set(fixedWidths)]);
  }

  // Look for overflow issues
  const overflowIssues = content.match(/overflow-x-scroll|w-screen|min-w-\[\d+px\]/g);
  if (overflowIssues) {
    console.log('Potential overflow triggers:', [...new Set(overflowIssues)]);
  }
});
