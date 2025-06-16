const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../reports/wri');
const outputFile = path.join(__dirname, '../src/data/attributeResonance.js');

function normalizeAttrName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function parseAttributeInsights(mdContent) {
  const lines = mdContent.split('\n');
  const insights = {};
  let inSection = false;
  let currentAttr = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('### Attribute Insights')) {
      inSection = true;
      continue;
    }
    if (inSection) {
      if (line.startsWith('###') || line.startsWith('## ')) break;
      if (line.endsWith(':') && !line.startsWith('- ')) {
        currentAttr = normalizeAttrName(line.slice(0, -1));
        insights[currentAttr] = {};
        continue;
      }
      if (currentAttr) {
        const insightMatch = line.match(/^- Insight: (.+)/);
        const recMatch = line.match(/^- Recommendation: (.+)/);
        if (insightMatch) insights[currentAttr].insight = insightMatch[1].trim();
        if (recMatch) insights[currentAttr].recommendation = recMatch[1].trim();
      }
    }
  }
  return insights;
}

function parseAttributeScores(mdContent) {
  const lines = mdContent.split('\n');
  const scores = {};
  let inSection = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('### Attribute Scores')) {
      inSection = true;
      continue;
    }
    if (inSection) {
      if (line === '' || line.startsWith('###') || line.startsWith('## ')) break;
      const match = line.match(/^\[?([\w\s&\-\/]+)\]?:\s*([\d.]+)/);
      if (match) {
        const attr = normalizeAttrName(match[1]);
        const score = parseFloat(match[2]);
        scores[attr] = score;
      }
    }
  }
  return scores;
}

function main() {
  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.md'));
  const out = {};
  files.forEach(file => {
    const market = path.basename(file, '.md');
    const mdContent = fs.readFileSync(path.join(inputDir, file), 'utf8');
    const attributeInsights = parseAttributeInsights(mdContent);
    const attributeScores = parseAttributeScores(mdContent);
    // Print all normalized attribute names for debugging
    console.log(`\n[${market}] Attribute names in scores:`);
    Object.keys(attributeScores).forEach(attr => console.log('  ', attr));
    console.log(`[${market}] Attribute names in insights:`);
    Object.keys(attributeInsights).forEach(attr => console.log('  ', attr));
    out[market] = {
      attributeAnalysis: {}
    };
    Object.keys(attributeScores).forEach(attr => {
      // Log mapping for debugging
      console.log(`[${market}] Mapping attribute:`, attr, '->', attributeInsights[attr] ? 'FOUND' : 'NOT FOUND');
      if (!attributeInsights[attr] || !attributeInsights[attr].insight || !attributeInsights[attr].recommendation) {
        console.warn(`Warning: Missing insight or recommendation for attribute '${attr}' in market '${market}'`);
      }
      out[market].attributeAnalysis[attr.replace(/\b\w/g, c => c.toUpperCase())] = {
        score: attributeScores[attr],
        insight: attributeInsights[attr]?.insight || '',
        recommendation: attributeInsights[attr]?.recommendation || ''
      };
    });
  });
  const js = `export const attributeResonance = ${JSON.stringify(out, null, 2)};\n`;
  fs.writeFileSync(outputFile, js);
  console.log('Wrote', outputFile);
}

if (require.main === module) {
  main();
}
