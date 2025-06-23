const fs = require('fs');
const path = require('path');

// Directories
const marketMdDir = path.join(__dirname, '../reports/wri');
const outputDir = path.join(__dirname, '../src/data');

// Helper: Parse attribute scores and insights from a market markdown file
function parseMarketMarkdown(mdPath) {
  const content = fs.readFileSync(mdPath, 'utf8');
  const lines = content.split('\n');
  const marketMatch = content.match(/^# WRI Report: (.+)$/m);
  let market = marketMatch ? marketMatch[1].trim() : path.basename(mdPath, '.md');
  
  // Normalize market name to use hyphens instead of spaces for consistency
  market = market.toLowerCase().replace(/\s+/g, '-');
  
  // Parse scores and insights
  const scores = {};
  const attributeInsights = {};
  let inScores = false;
  let inInsights = false;
  let inRecommendations = false;
  let inPriorities = false;
  let currentAttribute = null;
  const recommendations = [];
  const priorities = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Parse scores
    if (trimmedLine.startsWith('### Attribute Scores')) {
      inScores = true;
      inInsights = false;
      inRecommendations = false;
      inPriorities = false;
      continue;
    }
    
    // Parse attribute insights
    if (trimmedLine.startsWith('### Attribute Insights')) {
      inScores = false;
      inInsights = true;
      inRecommendations = false;
      inPriorities = false;
      continue;
    }
    
    // Parse strategic recommendations
    if (trimmedLine.startsWith('### Strategic Recommendations')) {
      inScores = false;
      inInsights = false;
      inRecommendations = true;
      inPriorities = false;
      continue;
    }
    
    // Parse priorities
    if (trimmedLine.startsWith('Priorities:')) {
      inScores = false;
      inInsights = false;
      inRecommendations = false;
      inPriorities = true;
      continue;
    }
    
    if (inScores) {
      if (!trimmedLine || trimmedLine.startsWith('#') || trimmedLine.startsWith('---') || trimmedLine.startsWith('##')) {
        inScores = false;
      } else {
        const match = trimmedLine.match(/^([\w .&\-()]+):\s*([\d.]+)$/);
        if (match) {
          scores[match[1].trim()] = parseFloat(match[2]);
        }
      }
    }
    
    if (inInsights) {
      if (!trimmedLine || trimmedLine.startsWith('#') || trimmedLine.startsWith('---') || trimmedLine.startsWith('##')) {
        inInsights = false;
      } else {
        // Check for new attribute
        if (trimmedLine.endsWith(':')) {
          currentAttribute = trimmedLine.slice(0, -1).trim();
          attributeInsights[currentAttribute] = {
            insight: '',
            recommendation: ''
          };
        }
        // Parse insight and recommendation
        else if (currentAttribute) {
          if (trimmedLine.startsWith('- Insight:')) {
            attributeInsights[currentAttribute].insight = trimmedLine.replace('- Insight:', '').trim();
          } else if (trimmedLine.startsWith('- Recommendation:')) {
            attributeInsights[currentAttribute].recommendation = trimmedLine.replace('- Recommendation:', '').trim();
          }
        }
      }
    }
    
    if (inRecommendations) {
      if (!trimmedLine || trimmedLine.startsWith('#') || trimmedLine.startsWith('---') || trimmedLine.startsWith('##')) {
        inRecommendations = false;
      } else if (trimmedLine.startsWith('-')) {
        recommendations.push({
          details: trimmedLine.substring(1).trim()
        });
      }
    }
    
    // Parse priorities
    if (inPriorities) {
      if (!trimmedLine || trimmedLine.startsWith('#') || trimmedLine.startsWith('---') || trimmedLine.startsWith('##')) {
        inPriorities = false;
      } else if (trimmedLine.startsWith('-')) {
        // Only add if it's not a template text or insight/recommendation
        const priority = trimmedLine.substring(1).trim();
        if (!priority.startsWith('**') && 
            !priority.startsWith('Insight:') && 
            !priority.startsWith('Recommendation:') &&
            priority !== '--') {
          priorities.push(priority);
        }
      }
    }
  }
  
  return { 
    market, 
    scores, 
    attributeInsights,
    recommendations,
    priorities
  };
}

// Main function to process all markets
function processMarkets() {
  const files = fs.readdirSync(marketMdDir).filter(f => f.endsWith('.md'));
  const marketData = {
    markets: [],
    attributes: new Set(),
    scores: {},
    deviations: {},
    insights: {}
  };
  
  // First pass: collect all data
  const marketScores = {};
  files.forEach(file => {
    const { 
      market, 
      scores, 
      attributeInsights,
      recommendations,
      priorities 
    } = parseMarketMarkdown(path.join(marketMdDir, file));
    
    // Ensure market name is normalized (should already be done in parseMarketMarkdown)
    const normalizedMarket = market.toLowerCase().replace(/\s+/g, '-');
    
    marketData.markets.push(normalizedMarket);
    marketScores[normalizedMarket] = scores;
    
    // Store insights and recommendations
    marketData.insights[normalizedMarket] = {
      attributeInsights,
      recommendations,
      priorities
    };
    
    // Collect all attributes
    Object.keys(scores).forEach(attr => marketData.attributes.add(attr));
  });
  
  // Convert attributes Set to Array
  marketData.attributes = Array.from(marketData.attributes).sort();
  
  // Calculate mean scores and deviations
  const meanScores = {};
  marketData.attributes.forEach(attr => {
    const scores = Object.values(marketScores).map(market => market[attr]).filter(score => score !== undefined);
    meanScores[attr] = scores.reduce((a, b) => a + b, 0) / scores.length;
  });
  
  // Build scores and deviations objects
  marketData.attributes.forEach(attr => {
    marketData.scores[attr] = {};
    marketData.deviations[attr] = {};
    
    marketData.markets.forEach(market => {
      const score = marketScores[market]?.[attr] || 0;
      marketData.scores[attr][market] = score;
      marketData.deviations[attr][market] = score - meanScores[attr];
    });
  });
  
  return marketData;
}

// Generate output files
function generateOutputFiles(data) {
  // Generate wriData.js
  const wriDataContent = `// Generated WRI data
export const marketData = ${JSON.stringify(data, null, 2)};
`;
  fs.writeFileSync(path.join(outputDir, 'wriData.js'), wriDataContent);
  
  // Generate wriInsights.js
  const insightsContent = `// Generated WRI insights
export const marketInsights = ${JSON.stringify(data.insights, null, 2)};
`;
  fs.writeFileSync(path.join(outputDir, 'wriInsights.js'), insightsContent);
  
  console.log('Generated WRI data files in', outputDir);
}

// Main execution
function main() {
  console.log('Processing WRI data...');
  const data = processMarkets();
  generateOutputFiles(data);
}

main();
