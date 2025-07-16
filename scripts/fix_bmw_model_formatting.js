const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../reports/r12gs_consumer_analysis');

// Regex: Match BMW model codes like R12 G/S, R1250GS, F900GS, etc. (but not if already spaced)
const modelRegex = /\b([A-Z])(?=\d{2,4}[A-Za-z/ ]*)/g;

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.md')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content.replace(modelRegex, (match, p1, offset, str) => {
      // Only add a space if not already present
      if (str[offset + 1] !== ' ') {
        return p1 + ' ';
      }
      return match;
    });
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated BMW model formatting in: ${file}`);
    }
  }
}); 