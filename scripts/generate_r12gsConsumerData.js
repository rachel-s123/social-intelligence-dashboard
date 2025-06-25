// scripts/generate_r12gsConsumerData.js
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../reports/r12gs_consumer_analysis');
const outputFile = path.join(__dirname, '../src/data/r12gsConsumerData.js');

function parseConsumerMarkdown(content) {
  const data = {};
  
  // Parse market overview
  const marketMatch = content.match(/\*\*Market:\*\* ([^\n]+)/);
  if (marketMatch) data.market = marketMatch[1];
  
  // Parse consumer reaction themes
  data.consumerReactionThemes = {};
  const themeSection = content.match(/## Consumer Reaction Themes([\s\S]*?)(?=##|$)/);
  if (themeSection) {
    const themeMatches = themeSection[1].match(/\*\*([^*]+):\*\* \[([\d.]+)\]%/g);
    if (themeMatches) {
      themeMatches.forEach(match => {
        const [, theme, percentage] = match.match(/\*\*([^*]+):\*\* \[([\d.]+)\]%/);
        data.consumerReactionThemes[theme] = parseFloat(percentage);
      });
    }
  }
  
  // Parse sentiment analysis
  data.sentimentAnalysis = {};
  const sentimentSection = content.match(/## Sentiment Analysis([\s\S]*?)(?=##|$)/);
  if (sentimentSection) {
    const sentimentMatches = sentimentSection[1].match(/\*\*([^*]+):\*\* \[([\d.]+)\]%/g);
    if (sentimentMatches) {
      sentimentMatches.forEach(match => {
        const [, sentiment, percentage] = match.match(/\*\*([^*]+):\*\* \[([\d.]+)\]%/);
        data.sentimentAnalysis[sentiment.toLowerCase()] = parseFloat(percentage);
      });
    }
  }
  
  // Parse platform distribution
  data.platformDistribution = {};
  const platformSection = content.match(/## Platform Distribution([\s\S]*?)(?=##|$)/);
  if (platformSection) {
    const platformMatches = platformSection[1].match(/\*\*([^*]+):\*\* \[([\d.]+)\]%/g);
    if (platformMatches) {
      platformMatches.forEach(match => {
        const [, platform, percentage] = match.match(/\*\*([^*]+):\*\* \[([\d.]+)\]%/);
        data.platformDistribution[platform] = parseFloat(percentage);
      });
    }
  }
  
  // Parse consumer timeline
  data.consumerTimeline = [];
  const timelineSection = content.match(/## Consumer Timeline([\s\S]*?)(?=##|$)/);
  if (timelineSection) {
    const weekMatches = timelineSection[1].match(/### Week (\d+) \(([^)]+)\)([\s\S]*?)(?=###|$)/g);
    if (weekMatches) {
      weekMatches.forEach(weekMatch => {
        const [, weekNum, weekRange, weekContent] = weekMatch.match(/### Week (\d+) \(([^)]+)\)([\s\S]*?)(?=###|$)/);
        const eventMatch = weekContent.match(/\*\*Event:\*\* ([^\n]+)/);
        const volumeMatch = weekContent.match(/\*\*Volume:\*\* ([^\n]+)/);
        const sentimentMatch = weekContent.match(/\*\*Sentiment:\*\* ([^\n]+)/);
        const reactionsMatch = weekContent.match(/\*\*Key Reactions:\*\* ([^\n]+)/);
        
        data.consumerTimeline.push({
          week: parseInt(weekNum),
          weekRange: weekRange,
          event: eventMatch ? eventMatch[1] : '[NOT PROVIDED IN REPORT]',
          volume: volumeMatch ? volumeMatch[1] : '[NOT PROVIDED IN REPORT]',
          sentiment: sentimentMatch ? sentimentMatch[1] : '[NOT PROVIDED IN REPORT]',
          keyReactions: reactionsMatch ? reactionsMatch[1] : '[NOT PROVIDED IN REPORT]'
        });
      });
    }
  }
  
  // Parse consumer quotes
  data.consumerQuotes = [];
  const quotesSection = content.match(/## Consumer Quotes by Theme([\s\S]*?)(?=##|$)/);
  if (quotesSection) {
    const quoteMatches = quotesSection[1].match(/\*\*Quote \d+:\*\*([\s\S]*?)(?=\*\*Quote \d+:\*\*|$)/g);
    if (quoteMatches) {
      quoteMatches.forEach(quoteMatch => {
        const idMatch = quoteMatch.match(/- \*\*ID:\*\* ([^\n]+)/);
        const textMatch = quoteMatch.match(/- \*\*Text:\*\* \"([^\"]+)\"/);
        const citationMatch = quoteMatch.match(/- \*\*Citation:\*\* \[([^\]]+)\]/);
        const usernameMatch = quoteMatch.match(/- \*\*Username:\*\* ([^\n]+)/);
        const platformMatch = quoteMatch.match(/- \*\*Platform:\*\* ([^\n]+)/);
        const dateMatch = quoteMatch.match(/- \*\*Date:\*\* ([^\n]+)/);
        const urlMatch = quoteMatch.match(/- \*\*URL:\*\* ([^\n]+)/);
        const themeMatch = quoteMatch.match(/- \*\*Theme:\*\* ([^\n]+)/);
        const sentimentMatch = quoteMatch.match(/- \*\*Sentiment:\*\* ([^\n]+)/);
        const weekMatch = quoteMatch.match(/- \*\*Week:\*\* ([^\n]+)/);
        const purchaseIntentMatch = quoteMatch.match(/- \*\*Purchase_Intent:\*\* ([^\n]+)/);
        const competitorMatch = quoteMatch.match(/- \*\*Competitor_Mentioned:\*\* ([^\n]+)/);
        const engagementMatch = quoteMatch.match(/- \*\*Engagement:\*\* ([^\n]+)/);
        
        if (idMatch && textMatch) {
          data.consumerQuotes.push({
            id: idMatch[1],
            text: textMatch[1],
            citation: citationMatch ? citationMatch[1] : '[NOT PROVIDED IN REPORT]',
            username: usernameMatch ? usernameMatch[1] : '[NOT PROVIDED IN REPORT]',
            platform: platformMatch ? platformMatch[1] : '[NOT PROVIDED IN REPORT]',
            date: dateMatch ? dateMatch[1] : '[NOT PROVIDED IN REPORT]',
            url: urlMatch ? urlMatch[1] : '[NOT PROVIDED IN REPORT]',
            theme: themeMatch ? themeMatch[1] : '[NOT PROVIDED IN REPORT]',
            sentiment: sentimentMatch ? sentimentMatch[1] : '[NOT PROVIDED IN REPORT]',
            week: weekMatch ? weekMatch[1] : '[NOT PROVIDED IN REPORT]',
            purchaseIntent: purchaseIntentMatch ? purchaseIntentMatch[1] : '[NOT PROVIDED IN REPORT]',
            competitorMentioned: competitorMatch ? competitorMatch[1] : '[NOT PROVIDED IN REPORT]',
            engagement: engagementMatch ? engagementMatch[1] : '[NOT PROVIDED IN REPORT]'
          });
        }
      });
    }
  }
  
  // Parse purchase intent analysis
  data.purchaseIntentAnalysis = {};
  const purchaseSection = content.match(/## Purchase Intent Analysis([\s\S]*?)(?=##|$)/);
  if (purchaseSection) {
    const totalMatch = purchaseSection[1].match(/\*\*Total Purchase Intent Mentions:\*\* \[([^\]]+)\]/);
    const positiveMatch = purchaseSection[1].match(/\*\*Positive Purchase Intent:\*\* \[([^\]]+)\]%/);
    const conditionalMatch = purchaseSection[1].match(/\*\*Conditional Purchase Intent:\*\* \[([^\]]+)\]%/);
    const negativeMatch = purchaseSection[1].match(/\*\*Negative Purchase Intent:\*\* \[([^\]]+)\]%/);
    
    data.purchaseIntentAnalysis = {
      totalPurchaseIntentMentions: totalMatch ? totalMatch[1] : '[NOT PROVIDED IN REPORT]',
      positiveIntent: positiveMatch ? parseFloat(positiveMatch[1]) : '[NOT PROVIDED IN REPORT]',
      conditionalIntent: conditionalMatch ? parseFloat(conditionalMatch[1]) : '[NOT PROVIDED IN REPORT]',
      negativeIntent: negativeMatch ? parseFloat(negativeMatch[1]) : '[NOT PROVIDED IN REPORT]'
    };
  }
  
  // Parse competitive mentions
  data.competitiveMentions = {};
  const competitiveSection = content.match(/## Competitive Mentions([\s\S]*?)(?=##|$)/);
  if (competitiveSection) {
    const mentionMatches = competitiveSection[1].match(/\*\*([^*]+):\*\* \[([^\]]+)\] mentions/g);
    if (mentionMatches) {
      mentionMatches.forEach(match => {
        const [, competitor, count] = match.match(/\*\*([^*]+):\*\* \[([^\]]+)\] mentions/);
        data.competitiveMentions[competitor] = count !== 'NUMBER' ? parseInt(count) : '[NOT PROVIDED IN REPORT]';
      });
    }
  }
  
  // Parse consumer concerns
  data.consumerConcerns = [];
  const concernsSection = content.match(/## Consumer Concerns([\s\S]*?)(?=##|$)/);
  if (concernsSection) {
    const concernMatches = concernsSection[1].match(/\*\*Concern \d+:\*\* ([^\n]+)\n- \*\*Frequency:\*\* ([^\n]+)\n- \*\*Example Quote:\*\* \"([^\"]+)\"/g);
    if (concernMatches) {
      concernMatches.forEach(match => {
        const [, concern, frequency, quote] = match.match(/\*\*Concern \d+:\*\* ([^\n]+)\n- \*\*Frequency:\*\* ([^\n]+)\n- \*\*Example Quote:\*\* \"([^\"]+)\"/);
        data.consumerConcerns.push({
          concern: concern,
          frequency: frequency,
          exampleQuote: quote
        });
      });
    }
  }
  
  // Parse key insights
  data.keyInsights = {};
  const insightsSection = content.match(/## Key Insights([\s\S]*?)(?=##|$)/);
  if (insightsSection) {
    const heritageMatch = insightsSection[1].match(/### Heritage Positioning Reception\n([^\n]+)/);
    const priceMatch = insightsSection[1].match(/### Price Sensitivity Analysis\n([^\n]+)/);
    const featureMatch = insightsSection[1].match(/### Feature Expectations vs Reality\n([^\n]+)/);
    const adventureMatch = insightsSection[1].match(/### Adventure Community Acceptance\n([^\n]+)/);
    const purchaseMatch = insightsSection[1].match(/### Purchase Decision Factors\n([^\n]+)/);
    
    data.keyInsights = {
      heritagePositioningReception: heritageMatch ? heritageMatch[1] : '[NOT PROVIDED IN REPORT]',
      priceSensitivityAnalysis: priceMatch ? priceMatch[1] : '[NOT PROVIDED IN REPORT]',
      featureExpectations: featureMatch ? featureMatch[1] : '[NOT PROVIDED IN REPORT]',
      adventureCommunityAcceptance: adventureMatch ? adventureMatch[1] : '[NOT PROVIDED IN REPORT]',
      purchaseDecisionFactors: purchaseMatch ? purchaseMatch[1] : '[NOT PROVIDED IN REPORT]'
    };
  }
  
  return data;
}

function main() {
  if (!fs.existsSync(inputDir)) {
    console.log('Creating input directory:', inputDir);
    fs.mkdirSync(inputDir, { recursive: true });
  }

  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.md'));
  const out = {};

  if (files.length === 0) {
    console.log('No markdown files found in', inputDir);
    console.log('Place your R 12 G/S consumer analysis markdown files there.');
    return;
  }

  files.forEach(file => {
    const mdContent = fs.readFileSync(path.join(inputDir, file), 'utf8');
    const marketMatch = mdContent.match(/\*\*Market:\*\* ([^\n]+)/);
    
    if (marketMatch) {
      const market = marketMatch[1].toLowerCase();
      const parsedData = parseConsumerMarkdown(mdContent);
      out[market] = parsedData;
      console.log(`Processed: ${market}`);
    } else {
      console.warn(`Could not extract market from ${file}`);
    }
  });

  const js = `// This file is auto-generated. Do not edit directly.
// Run 'npm run generate-r12gs-consumer-data' to update.

export const r12gsConsumerData = ${JSON.stringify(out, null, 2)};
`;
  
  fs.writeFileSync(outputFile, js);
  console.log('Generated R 12 G/S consumer data file:', outputFile);
}

main();
