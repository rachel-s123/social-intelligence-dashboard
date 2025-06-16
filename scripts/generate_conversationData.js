const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../reports/market_analysis');
const outputFile = path.join(__dirname, '../src/data/conversationData.js');

function parseThemeData(content) {
  const themeDataMatch = content.match(/## Theme Data\n([\s\S]*?)(?=##|$)/);
  if (!themeDataMatch) return [];

  const themeLines = themeDataMatch[1].split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => {
      const match = line.match(/- (.*?): (\d+)/);
      if (match) {
        return {
          subject: match[1].trim(),
          value: parseInt(match[2], 10)
        };
      }
      return null;
    })
    .filter(item => item !== null);

  return themeLines;
}

function parseThemeInsights(content) {
  const themeInsightsMatch = content.match(/## Theme Insights\n([\s\S]*?)(?=^#|\Z)/m);
  if (!themeInsightsMatch) return {};

  const themeInsights = {};
  const themeBlocks = themeInsightsMatch[1].split(/\n?- \*\*/).filter(block => block.trim());

  themeBlocks.forEach(block => {
    const lines = block.split('\n').map(line => line.trim());
    const themeName = lines[0].replace(/\*\*|\*/g, '').trim();
    
    // Find quote, explanation, and source
    let quote = '';
    let explanation = '';
    let source = '';

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('- Quote:')) {
        quote = line.replace('- Quote:', '').trim().replace(/^"|"$/g, '');
      } else if (line.startsWith('- Explanation:')) {
        explanation = line.replace('- Explanation:', '').trim();
      } else if (line.startsWith('- Source:')) {
        source = line.replace('- Source:', '').trim();
      }
    }

    if (quote && explanation && source) {
      if (!themeInsights[themeName]) {
        themeInsights[themeName] = [];
      }
      themeInsights[themeName].push({ quote, context: explanation, source });
    }
  });

  return themeInsights;
}

function parseSentimentData(content) {
  const sentimentDataMatch = content.match(/## Sentiment Data\n([\s\S]*?)(?=##|$)/);
  if (!sentimentDataMatch) return [];

  const sentimentLines = sentimentDataMatch[1].split('\n')
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

  return sentimentLines;
}

function parseSentimentInsights(content) {
  console.log('Starting sentiment insights parsing...');
  console.log('Full markdown content preview:', JSON.stringify(content.substring(0, 500)) + '...');

  const insights = {
    Positive: [],
    Neutral: [],
    Negative: []
  };

  // Split content into lines
  const lines = content.split('\n');
  let inSentimentAnalysis = false;
  let inSentimentInsights = false;
  let currentSentiment = null;
  let currentQuote = null;
  let currentExplanation = null;
  let currentSource = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for section headers
    if (line === '# Sentiment Analysis') {
      inSentimentAnalysis = true;
      continue;
    }

    if (inSentimentAnalysis && line === '## Sentiment Insights') {
      inSentimentInsights = true;
      continue;
    }

    if (inSentimentInsights) {
      // Check for sentiment type headers
      if (line.startsWith('### ')) {
        // Save previous quote if exists
        if (currentQuote && currentExplanation && currentSource) {
          insights[currentSentiment].push({
            quote: currentQuote,
            context: currentExplanation,
            source: currentSource
          });
        }

        // Reset for new sentiment
        currentQuote = null;
        currentExplanation = null;
        currentSource = null;

        // Extract sentiment type
        const sentimentMatch = line.match(/### (Positive|Neutral|Negative) Sentiment/);
        if (sentimentMatch) {
          currentSentiment = sentimentMatch[1];
          console.log('Found sentiment type:', currentSentiment);
        }
        continue;
      }

      // Check for quote start
      if (line.startsWith('- Quote ')) {
        // Save previous quote if exists
        if (currentQuote && currentExplanation && currentSource) {
          insights[currentSentiment].push({
            quote: currentQuote,
            context: currentExplanation,
            source: currentSource
          });
        }

        // Reset for new quote
        currentQuote = null;
        currentExplanation = null;
        currentSource = null;

        // Extract quote
        const quoteMatch = line.match(/- Quote \d+:\s*"([^"]*)"/);
        if (quoteMatch) {
          currentQuote = quoteMatch[1];
          console.log('Found quote:', currentQuote);
        }
        continue;
      }

      // Check for explanation
      if (line.startsWith('- Explanation:')) {
        currentExplanation = line.replace('- Explanation:', '').trim();
        console.log('Found explanation:', currentExplanation);
        continue;
      }

      // Check for source
      if (line.startsWith('- Source:')) {
        currentSource = line.replace('- Source:', '').trim();
        console.log('Found source:', currentSource);
        continue;
      }

      // If we hit a new section, break out
      if (line.startsWith('## ') || line.startsWith('# ')) {
        break;
      }
    }
  }

  // Save the last quote if exists
  if (currentQuote && currentExplanation && currentSource) {
    insights[currentSentiment].push({
      quote: currentQuote,
      context: currentExplanation,
      source: currentSource
    });
  }

  console.log('Final insights object:', JSON.stringify(insights, null, 2));
  return insights;
}

function parseMarketReport(markdownContent) {
  const themeData = parseThemeData(markdownContent);
  const themeInsights = parseThemeInsights(markdownContent);
  const sentimentData = parseSentimentData(markdownContent);
  const sentimentInsights = parseSentimentInsights(markdownContent);

  return {
    themeData,
    themeInsights,
    sentimentData,
    sentimentInsights
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
// Run 'npm run generate-conversation-data' to update.

export const conversationData = ${JSON.stringify(out, null, 2)};\n`;

  fs.writeFileSync(outputFile, js);
  console.log('Generated conversation data file:', outputFile);
}

main(); 