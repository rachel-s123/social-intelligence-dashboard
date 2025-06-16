const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../reports/market_recommendations');
const outputFile = path.join(__dirname, '../src/data/marketRecommendations.js');

function parseMarketRecommendations(markdown) {
  const sections = markdown.split('## ');
  
  // Extract market name from the title
  const titleMatch = sections[0].match(/# Market Recommendations: (.*)/);
  const marketName = titleMatch ? titleMatch[1].trim() : '';

  // Parse each section
  const recommendations = {};
  
  sections.forEach(section => {
    if (!section.trim()) return;

    const [sectionTitle, ...content] = section.split('\n');
    const sectionContent = content.join('\n').trim();

    // Extract bullet points
    const points = sectionContent
      .split('\n')
      .filter(line => line.trim().startsWith('- '))
      .map(line => line.replace('- ', '').trim());

    // Map section titles to our data structure
    switch (sectionTitle.trim()) {
      case 'Strategic Positioning':
        recommendations.strategicPositioning = points;
        break;
      case 'Content & Messaging':
        recommendations.contentMessaging = points;
        break;
      case 'Audience Targeting':
        recommendations.audienceTargeting = points;
        break;
      case 'Opportunities':
        recommendations.opportunities = points;
        break;
    }
  });

  return {
    marketName,
    recommendations
  };
}

function main() {
  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.md'));
  const out = {};
  
  files.forEach(file => {
    const market = path.basename(file, '.md');
    const mdContent = fs.readFileSync(path.join(inputDir, file), 'utf8');
    const { recommendations } = parseMarketRecommendations(mdContent);
    out[market] = recommendations;
  });

  const js = `// This file is auto-generated. Do not edit directly.
// Run 'npm run generate-market-recommendations' to update.

export const marketRecommendations = ${JSON.stringify(out, null, 2)};\n`;

  fs.writeFileSync(outputFile, js);
  console.log('Generated market recommendations data file:', outputFile);
}

main(); 