const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../reports/model_analysis');
const outputFile = path.join(__dirname, '../src/data/modelInsights.js');

function getSectionBlocks(content) {
  // Use dotAll mode and match up to the next ### header or end of file
  const sectionRegex = /###\s*(\d+)\.\s*([A-Z0-9 \-]+)[^\n]*\n([\s\S]*?)(?=###|\n*$)/gs;
  let match;
  const sections = {};
  while ((match = sectionRegex.exec(content)) !== null) {
    const num = match[1];
    const title = match[2].trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const body = match[3].trim();
    sections[num] = { title, body };
  }
  return sections;
}

function parseThemeDistribution(body) {
  console.log('Theme Distribution Raw Body:', body);
  const copy = (body.match(/\*.*\*\n/) || [''])[0].replace(/\*/g, '').trim();
  const data = [];
  (body.match(/^-\s*([^:]+):\s*([\d.]+)%/gm) || []).forEach(line => {
    const m = line.match(/^-\s*([^:]+):\s*([\d.]+)%/);
    if (m) data.push({ name: m[1].trim(), value: parseFloat(m[2]) });
  });
  console.log('Theme Distribution Parsed:', { copy, data });
  return { copy, data };
}

function parseSentimentDistribution(body) {
  console.log('Sentiment Distribution Raw Body:', body);
  const copy = (body.match(/\*.*\*\n/) || [''])[0].replace(/\*/g, '').trim();
  const data = [];
  (body.match(/^-\s*([^:]+):\s*([\d.]+)%/gm) || []).forEach(line => {
    const m = line.match(/^-\s*([^:]+):\s*([\d.]+)%/);
    if (m) data.push({ name: m[1].trim(), value: parseFloat(m[2]) });
  });
  console.log('Sentiment Distribution Parsed:', { copy, data });
  return { copy, data };
}

function parsePlatformDistribution(body) {
  console.log('Platform Distribution Raw Body:', body);
  const copy = (body.match(/\*.*\*\n/) || [''])[0].replace(/\*/g, '').trim();
  const data = [];
  (body.match(/^-\s*([^:]+):\s*([\d.]+)%/gm) || []).forEach(line => {
    const m = line.match(/^-\s*([^:]+):\s*([\d.]+)%/);
    if (m) data.push({ name: m[1].trim(), value: parseFloat(m[2]) });
  });
  console.log('Platform Distribution Parsed:', { copy, data });
  return { copy, data };
}

function parseKeyMetrics(body) {
  console.log('Key Metrics Raw Body:', body);
  const metrics = {};
  (body.match(/^[-*]\s*([^:]+):\s*([^\n]+)/gm) || []).forEach(line => {
    const m = line.match(/^[-*]\s*([^:]+):\s*([^\n]+)/);
    if (m) metrics[m[1].trim().replace(/ /g, '_').toLowerCase()] = m[2].trim();
  });
  if (metrics['most_engaged_posts/threads']) {
    metrics.topPosts = metrics['most_engaged_posts/threads'].split(',').map(s => s.trim());
    delete metrics['most_engaged_posts/threads'];
  }
  console.log('Key Metrics Parsed:', metrics);
  return metrics;
}

function parseConsumerInsights(body) {
  console.log('Consumer Insights Raw Body:', body);
  const themeBlocks = body.split(/\*\*Theme: ([^*]+)\*\*/g).slice(1);
  const quotesByTheme = [];
  for (let i = 0; i < themeBlocks.length; i += 2) {
    const theme = themeBlocks[i].trim();
    const quotesBlock = themeBlocks[i + 1];
    const quotes = [];
    const quoteRegex = /Quote: "([^"]+)"\s*\nUsername: ([^\n]+)\s*\nPlatform: ([^\n]+)\s*\nDate: ([^\n]+)\s*\nURL: ([^\n]+)\s*\nSentiment: ([^\n]+)\s*\nInsight: ([^\n]+)/g;
    let m;
    while ((m = quoteRegex.exec(quotesBlock)) !== null) {
      quotes.push({
        quote: m[1],
        username: m[2],
        platform: m[3],
        date: m[4],
        url: m[5],
        sentiment: m[6],
        insight: m[7]
      });
    }
    quotesByTheme.push({ theme, quotes });
  }
  console.log('Consumer Insights Parsed:', quotesByTheme);
  return { quotesByTheme };
}

function parseCompetitiveMentions(body) {
  console.log('Competitive Mentions Raw Body:', body);
  const competitorBlocks = body.split(/\*\*Competitor: ([^*]+)\*\*/g).slice(1);
  const competitiveMentions = [];
  for (let i = 0; i < competitorBlocks.length; i += 2) {
    const competitor = competitorBlocks[i].trim();
    const quotesBlock = competitorBlocks[i + 1];
    const quotes = [];
    const quoteRegex = /Quote: "([^"]+)"\s*\nUsername: ([^\n]+)\s*\nPlatform: ([^\n]+)\s*\nDate: ([^\n]+)\s*\nURL: ([^\n]+)\s*\nSentiment: ([^\n]+)\s*\nInsight: ([^\n]+)/g;
    let m;
    while ((m = quoteRegex.exec(quotesBlock)) !== null) {
      quotes.push({
        quote: m[1],
        username: m[2],
        platform: m[3],
        date: m[4],
        url: m[5],
        sentiment: m[6],
        insight: m[7]
      });
    }
    competitiveMentions.push({ competitor, quotes });
  }
  console.log('Competitive Mentions Parsed:', competitiveMentions);
  return competitiveMentions;
}

function parseTopInsights(body) {
  // Top 10 Consumer Insights
  const insights = (body.match(/\d+\. ([^\n]+)/g) || []).map(l => l.replace(/\d+\. /, '').trim());
  return insights;
}

function parsePurchaseIntentIndicators(body) {
  // Find section by header
  const match = body.match(/\*\*Purchase Intent Indicators:\*\*([\s\S]*?)(\*\*|$)/);
  if (!match) return [];
  const section = match[1];
  return (section.match(/- ([^:]+): ([\d.]+|[^\n]+)/g) || []).map(l => {
    const m = l.match(/- ([^:]+): ([\d.]+|[^\n]+)/);
    return { indicator: m[1], value: m[2] };
  });
}

function parseBarrierAnalysis(body) {
  const match = body.match(/\*\*Barrier Analysis:\*\*([\s\S]*?)(\*\*|$)/);
  if (!match) return [];
  const section = match[1];
  return (section.match(/- ([^:]+): ([\d.]+|[^\n]+)/g) || []).map(l => {
    const m = l.match(/- ([^:]+): ([\d.]+|[^\n]+)/);
    return { barrier: m[1], value: m[2] };
  });
}

function parseOpportunityIdentification(body) {
  const match = body.match(/\*\*Opportunity Identification:\*\*([\s\S]*?)(\*\*|$)/);
  if (!match) return [];
  const section = match[1];
  return (section.match(/- ([^:]+): ([^\n]+)/g) || []).map(l => {
    const m = l.match(/- ([^:]+): ([^\n]+)/);
    return { opportunity: m[1], description: m[2] };
  });
}

function parseSourceDocumentation(body) {
  // Parse each source block
  const sources = [];
  const sourceRegex = /Source \d+: ([^\n]+)\nPlatform: ([^\n]+)\nDate: ([^\n]+)\nEngagement: ([^\n]+)\nTopic: ([^\n]+)/g;
  let m;
  while ((m = sourceRegex.exec(body)) !== null) {
    sources.push({
      url: m[1],
      platform: m[2],
      date: m[3],
      engagement: m[4],
      topic: m[5]
    });
  }
  return sources;
}

function parseTimeline(body) {
  // Timeline Overview
  const overview = (body.match(/- ([^:]+): ([^\n]+)/g) || []).map(l => {
    const m = l.match(/- ([^:]+): ([^\n]+)/);
    return { period: m[1], description: m[2] };
  });
  // Volume Metrics
  const volumeMetrics = {};
  const peak = body.match(/- Peak discussion period: ([^\n]+)/);
  if (peak) volumeMetrics.peakPeriod = peak[1];
  const spike = body.match(/- Volume spike triggers: ([^\n]+)/);
  if (spike) volumeMetrics.spikeTriggers = spike[1];
  const decay = body.match(/- Conversation decay pattern: ([^\n]+)/);
  if (decay) volumeMetrics.decayPattern = decay[1];
  // Sentiment Evolution
  const sentimentEvolution = {};
  const pre = body.match(/- Pre-launch sentiment: ([^\n]+)/);
  if (pre) sentimentEvolution.preLaunch = pre[1];
  const launch = body.match(/- Launch week sentiment: ([^\n]+)/);
  if (launch) sentimentEvolution.launchWeek = launch[1];
  const post = body.match(/- Post-launch sentiment: ([^\n]+)/);
  if (post) sentimentEvolution.postLaunch = post[1];
  return { overview, volumeMetrics, sentimentEvolution };
}

function parseSegmentation(body) {
  // Parse each segment
  const segments = [];
  const segmentRegex = /\*\*Segment (\d+): ([^*]+)\*\*\n- Size: ([^\n]+)\n- Key characteristics: ([^\n]+)\n- Sentiment: ([^\n]+)\n- Main concerns: ([^\n]+)\n- Representative quote: "([^"]+)"/g;
  let m;
  while ((m = segmentRegex.exec(body)) !== null) {
    segments.push({
      segment: m[2].trim(),
      size: m[3].trim(),
      characteristics: m[4].trim(),
      sentiment: m[5].trim(),
      concerns: m[6].trim(),
      quote: m[7].trim()
    });
  }
  return segments;
}

function parseMostEngagedPosts(body) {
  // Parse each post
  const posts = [];
  const postRegex = /\*\*Post (\d+):\*\*\nPlatform: ([^\n]+)\nTitle\/Description: ([^\n]+)\nEngagement: ([^\n]+)\nURL: ([^\n]+)\nKey Themes: ([^\n]+)/g;
  let m;
  while ((m = postRegex.exec(body)) !== null) {
    posts.push({
      platform: m[2],
      title: m[3],
      engagement: m[4],
      url: m[5],
      keyThemes: m[6]
    });
  }
  return posts;
}

function parseRecommendations(body) {
  // Parse each recommendations block
  const recs = {};
  const blocks = body.split(/\*\*(Strategy Positioning|Content and Messaging|Targeting|Key Opportunities)\*\*/g).slice(1);
  for (let i = 0; i < blocks.length; i += 2) {
    const key = blocks[i].trim().replace(/ /g, '').toLowerCase();
    const items = (blocks[i + 1].match(/\d+\. (.+)/g) || []).map(l => l.replace(/\d+\. /, '').trim());
    recs[key] = items;
  }
  return recs;
}

function parseModelMarkdown(content) {
  const sections = getSectionBlocks(content);
  return {
    themeDistribution: parseThemeDistribution(sections[1]?.body || ''),
    sentimentDistribution: parseSentimentDistribution(sections[2]?.body || ''),
    platformDistribution: parsePlatformDistribution(sections[3]?.body || ''),
    keyMetrics: parseKeyMetrics(sections[4]?.body || ''),
    consumerInsights: parseConsumerInsights(sections[5]?.body || ''),
    competitiveMentions: parseCompetitiveMentions(sections[6]?.body || ''),
    topInsights: parseTopInsights(sections[7]?.body || ''),
    purchaseIntentIndicators: parsePurchaseIntentIndicators(sections[7]?.body || ''),
    barrierAnalysis: parseBarrierAnalysis(sections[7]?.body || ''),
    opportunityIdentification: parseOpportunityIdentification(sections[7]?.body || ''),
    sourceDocumentation: parseSourceDocumentation(sections[8]?.body || ''),
    timeline: parseTimeline(sections[9]?.body || ''),
    segmentation: parseSegmentation(sections[10]?.body || ''),
    mostEngagedPosts: parseMostEngagedPosts(sections[11]?.body || ''),
    recommendations: parseRecommendations(sections[12]?.body || '')
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
    // Parse the title to extract market and model information
    let titleMatch = mdContent.match(/^#\s*\[([^\]]+)\]\s*\[([^\]]+)\]\s*\[([^\]]+)\]\s*-\s*Social Listening Report/m);
    if (!titleMatch) {
      titleMatch = mdContent.match(/^#\s*([^B]+)\s*BMW\s*([^-]+)\s*-\s*Social Listening Report/m);
    }
    if (titleMatch) {
      let market, model, segment;
      if (titleMatch[3]) {
        market = titleMatch[1].trim();
        model = titleMatch[2].trim();
        segment = titleMatch[3].trim();
      } else {
        market = titleMatch[1].trim();
        model = titleMatch[2].trim();
        segment = 'Adventure';
      }
      const parsedData = parseModelMarkdown(mdContent);
      const marketModelKey = `${market}-${model}`;
      out[marketModelKey] = parsedData;
      console.log(`Processed: ${market} - ${model} (${segment})`);
    } else {
      const oldTitleMatch = mdContent.match(/^#\s*Model Analysis:?\s*(.+)$/m);
      const modelName = oldTitleMatch ? oldTitleMatch[1].trim() : path.basename(file, '.md');
      out[modelName] = parseModelMarkdown(mdContent);
      console.log(`Processed (old format): ${modelName}`);
    }
  });

  const js = `// This file is auto-generated. Do not edit directly.\n// Run 'npm run generate-model-insights' to update.\n\nexport const modelInsights = ${JSON.stringify(out, null, 2)};\n`;
  fs.writeFileSync(outputFile, js);
  console.log('Generated model insights data file:', outputFile);
}

main();
