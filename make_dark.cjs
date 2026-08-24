const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, 'src', 'pages'),
  path.join(__dirname, 'src', 'components')
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let originalContent = content;
      
      // Backgrounds
      content = content.replace(/bg-white/g, 'bg-slate-900/60 backdrop-blur-md');
      content = content.replace(/bg-gray-50/g, 'bg-slate-800/40 backdrop-blur-md');
      content = content.replace(/bg-slate-50/g, 'bg-slate-800/40 backdrop-blur-md');
      
      // Text Colors
      content = content.replace(/text-gray-900/g, 'text-white');
      content = content.replace(/text-gray-800/g, 'text-gray-100');
      content = content.replace(/text-gray-700/g, 'text-gray-200');
      content = content.replace(/text-gray-600/g, 'text-gray-300');
      content = content.replace(/text-gray-500/g, 'text-gray-400');
      
      // Borders
      content = content.replace(/border-gray-100/g, 'border-white/10');
      content = content.replace(/border-gray-200/g, 'border-white/20');
      
      // Specific edge cases where bg-white text-gray is together
      // This is generally covered by the regex above

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

targetDirs.forEach(dir => processDirectory(dir));
console.log('Dark blue conversion complete!');
