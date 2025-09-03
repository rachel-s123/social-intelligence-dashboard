// Data Processing Pipeline for Social Media API Data
// Transforms raw API responses into the format expected by the dashboard

const fs = require('fs');
const path = require('path');

// Import OpenAI for sentiment analysis and theming
let OpenAI;
try {
  OpenAI = require("openai").default;
} catch (e) {
  console.warn("OpenAI not available, sentiment analysis will be limited");
}

/**
 * Process raw social media data into dashboard format
 */
async function processSocialData(rawData, market = 'global') {
  console.log(`🔄 Processing ${rawData.length} raw data items for market: ${market}`);

  // Step 1: Filter and clean data
  const cleanedData = filterAndCleanData(rawData);

  // Step 2: Analyze sentiment and themes
  const analyzedData = await analyzeContent(cleanedData);

  // Step 3: Structure data in dashboard format
  const structuredData = structureForDashboard(analyzedData, market);

  // Step 4: Save processed data
  saveProcessedData(structuredData, market);

  return structuredData;
}

/**
 * Filter and clean raw social media data
 */
function filterAndCleanData(rawData) {
  console.log("🧹 Filtering and cleaning data...");

  return rawData.filter(item => {
    // Filter out empty or very short content
    if (!item.text || item.text.length < 20) return false;

    // Filter out spam or irrelevant content
    const spamIndicators = ['http://', 'https://', 'www.', '.com', '.net', '.org'];
    const hasSpam = spamIndicators.some(indicator =>
      item.text.toLowerCase().includes(indicator) && item.text.length < 100
    );

    if (hasSpam) return false;

    // Filter by date (last 90 days)
    const itemDate = new Date(item.date);
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    if (itemDate < ninetyDaysAgo) return false;

    return true;
  }).map(item => ({
    ...item,
    text: cleanText(item.text),
    date: item.date,
    week: getWeekNumber(new Date(item.date))
  }));
}

/**
 * Clean text content
 */
function cleanText(text) {
  return text
    // Remove URLs
    .replace(/https?:\/\/[^\s]+/g, '')
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove special characters but keep basic punctuation
    .replace(/[^\w\s.,!?-]/g, '')
    // Trim whitespace
    .trim();
}

/**
 * Get ISO week number from date
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Analyze content for sentiment and themes using AI
 */
async function analyzeContent(data) {
  console.log("🤖 Analyzing content with AI...");

  if (!OpenAI || !process.env.OPENAI_API_KEY) {
    console.warn("⚠️ OpenAI not available, using basic analysis");
    return basicAnalysis(data);
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const analyzedData = [];

  // Process in batches to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    const analysisPromises = batch.map(async (item) => {
      try {
        const analysis = await analyzeSingleItem(openai, item);
        return {
          ...item,
          sentiment: analysis.sentiment,
          theme: analysis.theme,
          purchaseIntent: analysis.purchaseIntent,
          competitorMentioned: analysis.competitorMentioned
        };
      } catch (error) {
        console.error(`Error analyzing item ${item.id}:`, error.message);
        return {
          ...item,
          sentiment: 'NEUTRAL',
          theme: 'General Discussion',
          purchaseIntent: 'UNKNOWN',
          competitorMentioned: 'NONE'
        };
      }
    });

    const analyzedBatch = await Promise.all(analysisPromises);
    analyzedData.push(...analyzedBatch);

    // Small delay between batches
    if (i + batchSize < data.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return analyzedData;
}

/**
 * Analyze a single content item
 */
async function analyzeSingleItem(openai, item) {
  const prompt = `Analyze this social media post about BMW R 12 G/S motorcycle:

"${item.text}"

Please respond with ONLY a JSON object in this exact format:
{
  "sentiment": "POSITIVE|NEGATIVE|NEUTRAL",
  "theme": "one of: Heritage/Retro Styling Reactions|Price/Value Concerns|Comparison to Modern GS Models|Engine/Performance Expectations|Feature Set Discussion|Purchase Intent Statements|Skepticism/Criticism|Other Themes",
  "purchaseIntent": "YES|NO|CONDITIONAL|UNKNOWN",
  "competitorMentioned": "competitor name or NONE"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a motorcycle market research analyst. Analyze social media content about BMW motorcycles and provide structured insights."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 200,
    temperature: 0.1
  });

  const content = response.choices[0].message.content;

  try {
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No JSON found in response');
  } catch (error) {
    console.error('Failed to parse AI response:', content);
    throw error;
  }
}

/**
 * Basic analysis fallback when AI is not available
 */
function basicAnalysis(data) {
  return data.map(item => {
    // Simple keyword-based analysis
    const text = item.text.toLowerCase();

    // Sentiment analysis
    let sentiment = 'NEUTRAL';
    if (text.includes('love') || text.includes('great') || text.includes('awesome') || text.includes('amazing')) {
      sentiment = 'POSITIVE';
    } else if (text.includes('hate') || text.includes('terrible') || text.includes('disappointed') || text.includes('expensive')) {
      sentiment = 'NEGATIVE';
    }

    // Theme analysis
    let theme = 'General Discussion';
    if (text.includes('price') || text.includes('cost') || text.includes('expensive') || text.includes('value')) {
      theme = 'Price/Value Concerns';
    } else if (text.includes('retro') || text.includes('classic') || text.includes('heritage') || text.includes('look')) {
      theme = 'Heritage/Retro Styling Reactions';
    } else if (text.includes('buy') || text.includes('purchase') || text.includes('want')) {
      theme = 'Purchase Intent Statements';
    }

    // Purchase intent
    let purchaseIntent = 'UNKNOWN';
    if (text.includes('bought') || text.includes('ordered') || text.includes('purchased')) {
      purchaseIntent = 'YES';
    } else if (text.includes('want to buy') || text.includes('considering') || text.includes('thinking about')) {
      purchaseIntent = 'CONDITIONAL';
    }

    return {
      ...item,
      sentiment,
      theme,
      purchaseIntent,
      competitorMentioned: 'NONE'
    };
  });
}

/**
 * Structure data for dashboard consumption
 */
function structureForDashboard(analyzedData, market) {
  console.log("📊 Structuring data for dashboard...");

  // Group data by themes
  const themeCounts = {};
  analyzedData.forEach(item => {
    themeCounts[item.theme] = (themeCounts[item.theme] || 0) + 1;
  });

  // Calculate sentiment distribution
  const sentimentCounts = { POSITIVE: 0, NEGATIVE: 0, NEUTRAL: 0 };
  analyzedData.forEach(item => {
    sentimentCounts[item.sentiment] = (sentimentCounts[item.sentiment] || 0) + 1;
  });

  // Calculate percentages
  const totalItems = analyzedData.length;
  const sentimentAnalysis = {
    positive: Math.round((sentimentCounts.POSITIVE / totalItems) * 100),
    neutral: Math.round((sentimentCounts.NEUTRAL / totalItems) * 100),
    negative: Math.round((sentimentCounts.NEGATIVE / totalItems) * 100)
  };

  // Platform distribution
  const platformCounts = {};
  analyzedData.forEach(item => {
    platformCounts[item.platform] = (platformCounts[item.platform] || 0) + 1;
  });

  const platformDistribution = {};
  Object.entries(platformCounts).forEach(([platform, count]) => {
    platformDistribution[platform] = Math.round((count / totalItems) * 100);
  });

  // Consumer timeline (group by weeks)
  const weeklyData = {};
  analyzedData.forEach(item => {
    const weekKey = `Week ${item.week}`;
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {
        week: item.week,
        weekRange: getWeekRange(item.week),
        volume: 0,
        sentiment: 'Mixed',
        keyReactions: [],
        posts: []
      };
    }
    weeklyData[weekKey].volume++;
    weeklyData[weekKey].posts.push(item);
  });

  // Convert to timeline format
  const consumerTimeline = Object.values(weeklyData)
    .sort((a, b) => a.week - b.week)
    .map(week => ({
      ...week,
      event: `Social media discussion about BMW R 12 G/S`,
      sentiment: calculateWeeklySentiment(week.posts),
      keyReactions: generateKeyReactions(week.posts),
      volume: week.volume
    }));

  // Purchase intent stats
  const purchaseIntentStats = { YES: 0, NO: 0, CONDITIONAL: 0, UNKNOWN: 0 };
  analyzedData.forEach(item => {
    purchaseIntentStats[item.purchaseIntent] = (purchaseIntentStats[item.purchaseIntent] || 0) + 1;
  });

  // Competitor mentions
  const competitorCounts = {};
  analyzedData.forEach(item => {
    if (item.competitorMentioned !== 'NONE') {
      competitorCounts[item.competitorMentioned] = (competitorCounts[item.competitorMentioned] || 0) + 1;
    }
  });

  // Consumer quotes (sample of most engaging)
  const consumerQuotes = analyzedData
    .sort((a, b) => (b.engagement || 0) - (a.engagement || 0))
    .slice(0, 50) // Take top 50 most engaging
    .map((item, index) => ({
      id: item.id || `quote_${index}`,
      text: item.text,
      citation: index + 1,
      username: item.author || 'Anonymous',
      platform: item.platform,
      date: item.date,
      url: item.url || '',
      theme: item.theme,
      sentiment: item.sentiment,
      week: item.week.toString(),
      purchaseIntent: item.purchaseIntent,
      competitorMentioned: item.competitorMentioned,
      engagement: item.engagement ? `${item.engagement} engagements` : 'N/A'
    }));

  // Key insights (simplified version)
  const keyInsights = {
    "Social Media Buzz": `Collected ${totalItems} social media mentions across ${Object.keys(platformDistribution).length} platforms`,
    "Sentiment Overview": `${sentimentAnalysis.positive}% positive, ${sentimentAnalysis.neutral}% neutral, ${sentimentAnalysis.negative}% negative sentiment`,
    "Top Discussion Theme": Object.entries(themeCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'General Discussion',
    "Platform Engagement": `Most active on ${Object.entries(platformDistribution).sort(([,a], [,b]) => b - a)[0]?.[0] || 'various platforms'}`
  };

  return {
    market: market.charAt(0).toUpperCase() + market.slice(1),
    consumerReactionThemes: themeCounts,
    sentimentAnalysis,
    platformDistribution,
    consumerTimeline,
    consumerQuotes,
    purchaseIntentStats,
    competitorMentionCounts: competitorCounts,
    keyInsights
  };
}

/**
 * Calculate weekly sentiment
 */
function calculateWeeklySentiment(posts) {
  const sentiments = posts.map(p => p.sentiment);
  const positive = sentiments.filter(s => s === 'POSITIVE').length;
  const negative = sentiments.filter(s => s === 'NEGATIVE').length;
  const neutral = sentiments.filter(s => s === 'NEUTRAL').length;

  const total = posts.length;
  const posPercent = Math.round((positive / total) * 100);

  if (posPercent > 60) return 'Positive';
  if (posPercent < 40) return 'Negative';
  return 'Mixed';
}

/**
 * Generate key reactions for timeline
 */
function generateKeyReactions(posts) {
  const themes = posts.map(p => p.theme);
  const topTheme = themes.sort((a,b) =>
    themes.filter(v => v===a).length - themes.filter(v => v===b).length
  ).pop();

  const sentiments = posts.map(p => p.sentiment);
  const avgSentiment = sentiments.reduce((acc, s) => {
    if (s === 'POSITIVE') return acc + 1;
    if (s === 'NEGATIVE') return acc - 1;
    return acc;
  }, 0) / sentiments.length;

  let reaction = '';
  if (avgSentiment > 0.2) reaction = 'Generally positive reactions';
  else if (avgSentiment < -0.2) reaction = 'Mixed to negative feedback';
  else reaction = 'Balanced discussion';

  return `${reaction} focusing on ${topTheme || 'various topics'}`;
}

/**
 * Get week range string
 */
function getWeekRange(weekNum) {
  // Simplified week range calculation
  const year = new Date().getFullYear();
  const startDate = new Date(year, 0, 1 + (weekNum - 1) * 7);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  return `${startDate.getDate()}/${startDate.getMonth() + 1} - ${endDate.getDate()}/${endDate.getMonth() + 1}`;
}

/**
 * Save processed data to file
 */
function saveProcessedData(data, market) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `processed_social_data_${market}_${timestamp}.json`;
  const filepath = path.join(__dirname, '../data/processed', filename);

  // Ensure directory exists
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`💾 Processed data saved to: ${filepath}`);
}

// Export functions
module.exports = {
  processSocialData,
  filterAndCleanData,
  analyzeContent,
  structureForDashboard
};

// CLI usage
if (require.main === module) {
  const rawDataPath = process.argv[2];
  const market = process.argv[3] || 'global';

  if (!rawDataPath) {
    console.error('Usage: node data-processor.js <raw-data-file> [market]');
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));

  processSocialData(rawData, market)
    .then(() => {
      console.log('✅ Data processing complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Data processing failed:', error);
      process.exit(1);
    });
}
