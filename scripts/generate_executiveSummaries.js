const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../reports/executive_summaries');
const outputFile = path.join(__dirname, '../src/data/executiveSummaries.js');

function parseExecutiveSummary(markdown) {
  const sections = markdown.split('## ');

  // Extract market name from the title
  const titleMatch = sections[0].match(/# Executive Summary: (.*)/);
  const marketName = titleMatch ? titleMatch[1].trim() : '';

  // Parse each section
  const summary = {};

  sections.forEach(section => {
    if (!section.trim()) return;
    const [sectionTitle, ...content] = section.split('\n');
    const sectionContent = content.join('\n').trim();

    // Extract bullet points
    const points = sectionContent
      .split('\n')
      .filter(line => line.trim().startsWith('- '))
      .map(line => line.replace('- ', '').trim());

    // Strategic Recommendations are special: parse as key-value
    if (sectionTitle.trim() === 'Strategic Recommendations') {
      points.forEach(line => {
        const match = line.match(/\*\*(.*?):\*\* (.*)/);
        if (match) {
          // Remove all non-alphanumeric characters from the key
          const rawKey = match[1].replace(/[^a-zA-Z0-9]/g, '');
          const key = rawKey.charAt(0).toLowerCase() + rawKey.slice(1);
          summary[key] = match[2].trim();
        }
      });
    } else {
      // Map section titles to our data structure
      switch (sectionTitle.trim()) {
        case 'Attribute Resonance':
          summary.attributeResonance = points;
          break;
        case 'Market Insights':
          summary.marketInsights = points;
          break;
        case 'Competitor Analysis':
          summary.competitorAnalysis = points;
          break;
      }
    }
  });

  return {
    marketName,
    summary
  };
}

function main() {
  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.md'));
  const out = {};
  const marketNames = {}; // Store proper case names

  files.forEach(file => {
    const market = path.basename(file, '.md').toLowerCase();
    const mdContent = fs.readFileSync(path.join(inputDir, file), 'utf8');
    const { marketName, summary } = parseExecutiveSummary(mdContent);
    
    // Store data with lowercase key
    out[market] = summary;
    
    // Store proper case name for display
    if (marketName) {
      marketNames[market] = marketName;
    }
  });

  const js = `// This file is auto-generated. Do not edit directly.
// Run 'npm run generate-executive-summaries' to update.

export const executiveSummaries = ${JSON.stringify(out, null, 2)};

// Proper case market names for display
export const marketNames = ${JSON.stringify(marketNames, null, 2)};
`;

  fs.writeFileSync(outputFile, js);
  console.log('Generated executive summaries data file:', outputFile);
}

main(); 