const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../reports/market_analysis');
const outputFile = path.join(__dirname, '../src/data/competitorData.js');

function parseShareOfVoice(content) {
  const shareOfVoiceMatch = content.match(/## Share of Voice\n([\s\S]*?)(?=##|$)/);
  if (!shareOfVoiceMatch) return [];

  const shareOfVoiceLines = shareOfVoiceMatch[1].split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => {
      const match = line.match(/- (.*?): (\d+)/);
      if (match) {
        return {
          name: match[1].trim(),
          value: parseInt(match[2], 10)
        };
      }
      return null;
    })
    .filter(item => item !== null);

  return shareOfVoiceLines;
}

function parseCompetitorDetails(content) {
  const competitorSection = content.split('# Competitor Analysis')[1];
  if (!competitorSection) return { strengths: {}, weaknesses: {} };

  const strengths = {};
  const weaknesses = {};

  const competitorBlocks = competitorSection.split('###').filter(block => block.trim());

  competitorBlocks.forEach(block => {
    const lines = block.split('\n');
    const competitor = lines[0].trim();
    
    const strengthsMatch = block.match(/\*\*Strengths\*\*\n([\s\S]*?)(?=\*\*|$)/);
    const weaknessesMatch = block.match(/\*\*Weaknesses\*\*\n([\s\S]*?)(?=\*\*|$)/);

    if (strengthsMatch) {
      strengths[competitor] = strengthsMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace('-', '').trim());
    }

    if (weaknessesMatch) {
      weaknesses[competitor] = weaknessesMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace('-', '').trim());
    }
  });

  return { strengths, weaknesses };
}

function parseMarketOpportunities(content) {
  const opportunitiesMatch = content.match(/## Market Opportunities\n([\s\S]*?)(?=#|$)/);
  if (!opportunitiesMatch) return [];

  const opportunities = [];
  const opportunityBlocks = opportunitiesMatch[1].split('\n- **').filter(block => block.trim());

  opportunityBlocks.forEach(block => {
    const lines = block.split('\n');
    const title = lines[0].replace(/\*\*/g, '').trim();
    const description = lines.find(line => line.includes('Opportunity Description:'))?.split('Opportunity Description:')[1].trim();

    if (title && description) {
      opportunities.push({
        title,
        description
      });
    }
  });

  return opportunities;
}

function parseMarketReport(markdownContent) {
  const shareOfVoice = parseShareOfVoice(markdownContent);
  const { strengths, weaknesses } = parseCompetitorDetails(markdownContent);
  const gapsToExploit = parseMarketOpportunities(markdownContent);

  return {
    shareOfVoice,
    competitorStrengths: strengths,
    competitorWeaknesses: weaknesses,
    gapsToExploit
  };
}

function main() {
  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.md'));
  const out = {};

  files.forEach(file => {
    const market = path.basename(file, '.md').toLowerCase();
    const mdContent = fs.readFileSync(path.join(inputDir, file), 'utf8');
    const data = parseMarketReport(mdContent);
    out[market] = data;
  });

  const js = `// This file is auto-generated. Do not edit directly.
// Run 'npm run generate-competitor-data' to update.

export const competitorData = ${JSON.stringify(out, null, 2)};

export const competitorColors = {
  'BMW Motorrad': '#0066B1',
  'Zero Motorcycles': '#FF6B6B',
  'Energica': '#4CAF50',
  'LiveWire': '#9C27B0',
  'Others': '#757575'
};

export function getCompetitorData(market) {
  const marketKey = market.toLowerCase();
  return competitorData[marketKey] || {
    shareOfVoice: [],
    competitorStrengths: {},
    competitorWeaknesses: {},
    gapsToExploit: []
  };
}

export function getCompetitorColors(market) {
  return competitorColors;
}\n`;

  fs.writeFileSync(outputFile, js);
  console.log('Generated competitor data file:', outputFile);
}

main(); 