const OpenAI = require("openai").default;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filteredData, activeFilters, section } = req.body;

    if (!filteredData) {
      return res.status(400).json({ error: "Filtered data is required" });
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.log("No OpenAI API key available, returning mock insights");
      return res.json({
        success: true,
        insights: generateMockInsights(filteredData, activeFilters, section)
      });
    }

    // Generate AI insights
    const insights = await generateAIInsights(filteredData, activeFilters, section);
    
    res.json({
      success: true,
      insights: insights
    });

  } catch (error) {
    console.error("Insights API error:", error);
    
    // Fallback to mock insights on error
    const { filteredData, activeFilters, section } = req.body;
    res.json({
      success: true,
      insights: generateMockInsights(filteredData, activeFilters, section)
    });
  }
};

/**
 * Generate AI insights using OpenAI
 */
async function generateAIInsights(filteredData, activeFilters, section) {
  const prompt = buildInsightsPrompt(filteredData, activeFilters, section);
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: getInsightsSystemPrompt()
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 800,
  });

  const content = response.choices[0].message.content;
  return parseInsightsResponse(content);
}

/**
 * Generate mock insights for demo mode or API failures
 */
function generateMockInsights(filteredData, activeFilters, section) {
  const filterDescription = describeActiveFilters(activeFilters);
  const dataStats = generateDataStatistics(filteredData);
  
  // Calculate sentiment breakdown from filteredData
  const quotes = filteredData.quotes || [];
  const total = quotes.length || 1;
  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
  quotes.forEach(q => {
    if (q.sentiment && q.sentiment.toLowerCase() === 'positive') sentimentCounts.positive++;
    else if (q.sentiment && q.sentiment.toLowerCase() === 'neutral') sentimentCounts.neutral++;
    else sentimentCounts.negative++;
  });
  
  const sentimentBreakdown = {
    positive: { count: sentimentCounts.positive, percentage: Math.round((sentimentCounts.positive / total) * 100) },
    neutral: { count: sentimentCounts.neutral, percentage: Math.round((sentimentCounts.neutral / total) * 100) },
    negative: { count: sentimentCounts.negative, percentage: Math.round((sentimentCounts.negative / total) * 100) },
    scoreExplanation: "Sentiment is scored from 1 (very negative) to 5 (very positive), with 3 being neutral. The average is calculated from all filtered quotes."
  };

  return {
    filterContext: `Analysis based on filtered data: ${filterDescription}. This represents a subset of consumer feedback, not the complete dataset.`,
    summary: generateMockSummary(filteredData, activeFilters, section),
    sentimentBreakdown,
    keyFindings: generateMockFindings(filteredData, activeFilters, section),
    recommendations: generateMockRecommendations(filteredData, activeFilters, section),
    dataHighlights: generateMockHighlights(filteredData, activeFilters, section)
  };
}

/**
 * Generate mock summary based on data
 */
function generateMockSummary(filteredData, activeFilters, section) {
  const totalQuotes = filteredData.totalQuotes || 0;
  const avgSentiment = filteredData.averageSentiment || 3.0;
  const topTheme = filteredData.topTheme?.name || "General";
  
  if (activeFilters.length === 0) {
    return `Analysis of ${totalQuotes} consumer quotes reveals an average sentiment score of ${avgSentiment}/5.0, with "${topTheme}" being the most discussed theme. This comprehensive view shows overall consumer perception of the R 12 G/S.`;
  }
  
  const filterDesc = activeFilters.map(f => f.value).join(", ");
  return `Filtered analysis of ${totalQuotes} quotes (${filterDesc}) shows ${avgSentiment}/5.0 average sentiment with "${topTheme}" as the primary theme. This focused view reveals specific consumer insights for the selected criteria and should not be interpreted as overall consumer sentiment.`;
}

/**
 * Generate mock findings based on data
 */
function generateMockFindings(filteredData, activeFilters, section) {
  const findings = [];
  const totalQuotes = filteredData.totalQuotes || 0;
  const avgSentiment = filteredData.averageSentiment || 3.0;
  const topTheme = filteredData.topTheme?.name || "General";
  
  findings.push(`Consumer sentiment averages ${avgSentiment}/5.0 across ${totalQuotes} analyzed quotes`);
  findings.push(`"${topTheme}" emerges as the dominant discussion theme with ${filteredData.topTheme?.percentage || 25}% of mentions`);
  
  if (avgSentiment > 3.5) {
    findings.push("Overall positive sentiment indicates strong consumer satisfaction with R 12 G/S features");
  } else if (avgSentiment < 2.5) {
    findings.push("Lower sentiment scores suggest areas for improvement in consumer experience");
  } else {
    findings.push("Neutral sentiment indicates mixed consumer reactions requiring further analysis");
  }
  
  return findings;
}

/**
 * Generate mock recommendations based on data
 */
function generateMockRecommendations(filteredData, activeFilters, section) {
  const recommendations = [];
  const avgSentiment = filteredData.averageSentiment || 3.0;
  const topTheme = filteredData.topTheme?.name || "General";
  
  if (avgSentiment > 3.5) {
    recommendations.push("Leverage positive sentiment by highlighting successful features in marketing campaigns");
    recommendations.push("Expand on themes that resonate well with consumers");
  } else if (avgSentiment < 2.5) {
    recommendations.push("Address consumer concerns identified in negative sentiment areas");
    recommendations.push("Develop targeted improvements based on feedback themes");
  } else {
    recommendations.push("Conduct deeper analysis to understand mixed consumer reactions");
    recommendations.push("Focus on improving areas with neutral sentiment");
  }
  
  recommendations.push(`Prioritize "${topTheme}" related improvements based on high discussion volume`);
  
  return recommendations;
}

/**
 * Generate mock highlights based on data
 */
function generateMockHighlights(filteredData, activeFilters, section) {
  const topTheme = filteredData.topTheme?.name || "Performance";
  const avgSentiment = filteredData.averageSentiment || 3.0;
  const quotes = filteredData.quotes || [];
  
  let sentimentTrend = "Neutral";
  if (avgSentiment > 3.5) sentimentTrend = "Positive";
  else if (avgSentiment < 2.5) sentimentTrend = "Negative";
  
  const criticalQuote = quotes.length > 0 ? quotes[0].text : "No quotes available";
  
  return {
    strongestTheme: topTheme,
    sentimentTrend: sentimentTrend,
    criticalQuote: criticalQuote
  };
}

/**
 * Get the system prompt for AI insights
 */
function getInsightsSystemPrompt() {
  return `You are an AI analyst specializing in BMW Motorrad market research and consumer insights. Your role is to analyze filtered consumer data and provide actionable insights.

CRITICAL REQUIREMENTS:
- ALWAYS include a clear filter context explaining what data subset is being analyzed
- If any sentiment scores or statistics are mentioned, EXPLAIN what they mean and how they're calculated
- Provide insights that are specific to the filtered data, not general statements
- Keep responses concise but informative
- Focus on actionable business insights

RESPONSE FORMAT:
Return a JSON object with this exact structure:
{
  "filterContext": "Clear description of what filters are applied and what data subset this represents",
  "summary": "2-3 sentence summary of key findings",
  "keyFindings": ["Finding 1", "Finding 2", "Finding 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "dataHighlights": {
    "strongestTheme": "Most prominent theme name",
    "sentimentTrend": "Positive/Neutral/Negative trend description",
    "criticalQuote": "Most representative quote from the data"
  }
}

IMPORTANT: Always explain any scores or statistics you reference. For example, if you mention "sentiment score of 3.8", explain that sentiment is scored from 1-5 where 1 is very negative and 5 is very positive.`;
}

/**
 * Build the prompt for AI insights generation
 */
function buildInsightsPrompt(filteredData, activeFilters, section) {
  const filterDescription = describeActiveFilters(activeFilters);
  const dataStats = generateDataStatistics(filteredData);
  
  return `Analyze the following filtered consumer data for BMW R 12 G/S insights:

FILTER CONTEXT:
${filterDescription}

DATA OVERVIEW:
${dataStats}

SECTION: ${section}

Please provide insights based on this filtered data subset. Remember to:
1. Clearly state what filters are applied
2. Explain any sentiment scores or statistics
3. Focus on insights specific to this data subset
4. Provide actionable recommendations

Return your response as a valid JSON object matching the required format.`;
}

/**
 * Describe active filters in human-readable format
 */
function describeActiveFilters(filters) {
  if (!filters || filters.length === 0) {
    return "No filters applied - analyzing complete dataset";
  }
  
  const filterDescriptions = filters.map(filter => {
    switch (filter.type) {
      case 'theme': return `Theme: ${filter.value}`;
      case 'sentiment': return `Sentiment: ${filter.value}`;
      case 'platform': return `Platform: ${filter.value}`;
      case 'week': return `Week: ${filter.value}`;
      case 'purchaseIntent': return `Purchase Intent: ${filter.value}`;
      default: return `${filter.type}: ${filter.value}`;
    }
  });
  
  return `Filters applied: ${filterDescriptions.join(', ')}`;
}

/**
 * Generate data statistics for the prompt
 */
function generateDataStatistics(data) {
  const totalQuotes = data.totalQuotes || 0;
  const avgSentiment = data.averageSentiment || 0;
  const topTheme = data.topTheme?.name || "N/A";
  const topThemePercentage = data.topTheme?.percentage || 0;
  
  return `Total Quotes: ${totalQuotes}
Average Sentiment: ${avgSentiment}/5.0 (1=very negative, 5=very positive)
Top Theme: ${topTheme} (${topThemePercentage}% of mentions)
Time Range: ${data.timeRange || 'N/A'}`;
}

/**
 * Parse the AI response into structured insights
 */
function parseInsightsResponse(content) {
  try {
    // Try to extract JSON from the response
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Ensure all required fields are present
      return {
        filterContext: parsed.filterContext || "Filter context not provided",
        summary: parsed.summary || "Summary not provided",
        keyFindings: parsed.keyFindings || ["No findings provided"],
        recommendations: parsed.recommendations || ["No recommendations provided"],
        dataHighlights: {
          strongestTheme: parsed.dataHighlights?.strongestTheme || "N/A",
          sentimentTrend: parsed.dataHighlights?.sentimentTrend || "N/A",
          criticalQuote: parsed.dataHighlights?.criticalQuote || "No critical quote provided"
        }
      };
    }
  } catch (error) {
    console.error("Failed to parse AI response:", error);
  }
  
  // Fallback if parsing fails
  return {
    filterContext: "Unable to parse AI response",
    summary: "AI analysis completed but response format was unexpected",
    keyFindings: ["Analysis completed", "Response parsing issue encountered"],
    recommendations: ["Review data manually", "Check AI service configuration"],
    dataHighlights: {
      strongestTheme: "Unknown",
      sentimentTrend: "Unknown",
      criticalQuote: "Unable to extract quote"
    }
  };
} 