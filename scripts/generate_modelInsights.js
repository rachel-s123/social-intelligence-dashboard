const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../reports/model_analysis');
const outputFile = path.join(__dirname, '../src/data/modelInsights.js');

function normalizeSectionName(name) {
  return name.toLowerCase().replace(/[^a-z]+/g, ' ').trim();
}

function parseSections(content) {
  const lines = content.split('\n');
  const sections = {};
  let current = null;
  lines.forEach(line => {
    const header = line.match(/^##\s*(.+)/);
    if (header) {
      current = normalizeSectionName(header[1]);
      sections[current] = [];
    } else if (current) {
      sections[current].push(line);
    }
  });
  return sections;
}

function parsePercentList(lines) {
  return lines
    .filter(l => l.trim().startsWith('-'))
    .map(l => {
      const m = l.match(/-\s*([^:]+):\s*(\d+)%?/);
      if (m) return { name: m[1].trim(), value: parseFloat(m[2]) };
      return null;
    })
    .filter(Boolean);
}

function parseKeyMetrics(lines) {
  const metrics = {};
  lines.forEach(l => {
    const m = l.match(/-\s*([^:]+):\s*(.+)/);
    if (m) metrics[m[1].trim()] = m[2].trim();
  });
  return metrics;
}

function parseQuotes(lines) {
  return lines
    .filter(l => l.trim().startsWith('-'))
    .map(l => {
      const m = l.match(/-\s*"([^"]+)"\s*-\s*(.*)/);
      if (m) return { quote: m[1], source: m[2].trim() };
      const q = l.match(/-\s*Quote:\s*"([^"]+)"\s*(?:Source:\s*(.*))?/i);
      if (q) return { quote: q[1], source: (q[2] || '').trim() };
      return null;
    })
    .filter(Boolean);
}

function parseTimeline(lines) {
  return lines
    .filter(l => l.trim().startsWith('-'))
    .map(l => {
      const m = l.match(/-\s*([^:]+):\s*(.+)/);
      if (m) return { date: m[1].trim(), event: m[2].trim() };
      return null;
    })
    .filter(Boolean);
}

function parseTextList(lines) {
  return lines
    .filter(l => l.trim().startsWith('-'))
    .map(l => l.replace(/^-\s*/, '').trim());
}

function parseModelReport(content) {
  const sections = parseSections(content);

  const themeSection = sections['theme percentages'] || sections['themes'] || sections['conversation themes'] || [];
  const sentimentSection = sections['sentiment percentages'] || sections['sentiment'] || [];
  const platformSection = sections['platform distribution'] || sections['platforms'] || [];
  const metricsSection = sections['key metrics'] || [];
  const quotesSection = sections['quotes'] || [];
  const competitiveSection = sections['competitive mentions'] || sections['competitive landscape'] || [];
  const timelineSection = sections['timeline'] || sections['launch timeline'] || [];
  const recommendationsSection = sections['recommendations'] || sections['strategic recommendations'] || [];

  return {
    themes: parsePercentList(themeSection),
    sentiment: parsePercentList(sentimentSection),
    platforms: parsePercentList(platformSection),
    keyMetrics: parseKeyMetrics(metricsSection),
    quotes: parseQuotes(quotesSection),
    competitiveMentions: parseTextList(competitiveSection),
    timeline: parseTimeline(timelineSection),
    recommendations: parseTextList(recommendationsSection)
  };
}

function main() {
  if (!fs.existsSync(inputDir)) {
    console.error('Input directory does not exist:', inputDir);
    return;
  }

  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.md'));
  const out = {};

  files.forEach(file => {
    const mdContent = fs.readFileSync(path.join(inputDir, file), 'utf8');
    const titleMatch = mdContent.match(/^#\s*Model Analysis:?\s*(.+)$/m);
    const modelName = titleMatch ? titleMatch[1].trim() : path.basename(file, '.md');
    out[modelName] = parseModelReport(mdContent);
  });

  const js = `// This file is auto-generated. Do not edit directly.\n// Run 'npm run generate-model-insights' to update.\n\nexport const modelInsights = ${JSON.stringify(out, null, 2)};\n`;

  fs.writeFileSync(outputFile, js);
  console.log('Generated model insights data file:', outputFile);
}

main();
