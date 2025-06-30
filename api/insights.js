const OpenAI = require("openai").default;
const { getReportVectorStoreId } = require("../config/getReportVectorStoreId");

// Initialize OpenAI client only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Prefer VS_REPORTS_STORE_ID but allow client-side fallback
const REPORTS_VECTOR_STORE_ID = getReportVectorStoreId();

module.exports = async (req, res) => {
  console.log("🔍 Insights API endpoint called!");
  
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
    console.log("🔍 Insights API - Received data:", { 
      totalQuotes: filteredData?.totalQuotes,
      sentimentPercentages: filteredData?.sentimentPercentages,
      activeFilters: activeFilters?.length
    });

    if (!filteredData) {
      return res.status(400).json({ error: "Filtered data is required" });
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.log("No OpenAI API key available, returning enhanced mock insights");
      return res.json({
        success: true,
        insights: generateEnhancedMockInsights(filteredData, activeFilters, section)
      });
    }

    // Generate AI insights with enhanced prompts
    const insights = await generateAIInsights(filteredData, activeFilters, section);
    
    res.json({
      success: true,
      insights: insights
    });

  } catch (error) {
    console.error("Insights API error:", error);
    
    // Fallback to enhanced mock insights on error
    const { filteredData, activeFilters, section } = req.body;
    res.json({
      success: true,
      insights: generateEnhancedMockInsights(filteredData, activeFilters, section)
    });
  }
};

/**
 * Generate AI insights using OpenAI with enhanced prompts
 */
async function generateAIInsights(filteredData, activeFilters, section) {
  if (!openai) {
    console.log("OpenAI client not initialized, returning enhanced mock insights");
    return generateEnhancedMockInsights(filteredData, activeFilters, section);
  }

  let reportContext = "";
  // Attempt to enrich prompt with context from market reports via vector store
  try {
    const query = buildReportQuery(filteredData, activeFilters);
    reportContext = await retrieveReportContext(query);
  } catch (ctxErr) {
    console.log("Report context retrieval failed:", ctxErr.message);
  }

  const prompt = buildEnhancedInsightsPrompt(
    filteredData,
    activeFilters,
    section,
    reportContext
  );
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: getEnhancedInsightsSystemPrompt()
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.2, // Lower temperature for more focused analysis
    max_tokens: 1200, // Increased token limit for detailed insights
  });

  const content = response.choices[0].message.content;
  return parseEnhancedInsightsResponse(content);
}

/**
 * Enhanced system prompt for more actionable insights
 */
function getEnhancedInsightsSystemPrompt() {
  return `You are a senior market research analyst specializing in BMW Motorrad consumer insights and competitive intelligence. Your expertise includes motorcycle market dynamics, consumer behavior patterns, and actionable business strategy development.

ANALYSIS OBJECTIVES:
- Identify specific consumer pain points and unmet needs
- Detect emerging trends and market opportunities
- Provide concrete, implementable recommendations
- Highlight competitive advantages or disadvantages
- Identify at-risk customer segments or growth opportunities

CRITICAL REQUIREMENTS:
1. FILTER CONTEXT: Always explain what data subset is being analyzed and its limitations
2. SPECIFICITY: Avoid generic statements - be specific about what the data reveals
3. ACTIONABILITY: Every recommendation must be implementable with clear next steps
4. BUSINESS IMPACT: Quantify potential impact where possible
5. EVIDENCE-BASED: Reference specific data points, themes, or quote patterns
6. SEGMENT FOCUS: Identify specific customer segments or use cases when relevant

RESPONSE FORMAT (JSON):
{
  "filterContext": "Detailed explanation of filters and data subset limitations",
  "executiveSummary": "1-2 sentences highlighting the most critical business insight",
  "keyInsights": [
    {
      "insight": "Specific finding with data backing",
      "evidence": "What in the data supports this",
      "businessImplication": "Why this matters for BMW Motorrad"
    }
  ],
  "actionableRecommendations": [
    {
      "category": "Product/Marketing/Customer Experience/etc.",
      "recommendation": "Specific action to take",
      "rationale": "Why this recommendation based on the data",
      "timeline": "Short-term/Medium-term/Long-term",
      "expectedImpact": "What outcome to expect"
    }
  ],
  "consumerSegments": {
    "primarySegment": "Most represented consumer type in this data",
    "concernsAndNeeds": ["Specific need 1", "Specific concern 2"],
    "opportunityAreas": ["Specific opportunity 1", "Specific opportunity 2"]
  },
  "competitiveIntelligence": {
    "bmwStrengths": ["Specific strength mentioned by consumers"],
    "vulnerabilities": ["Specific weakness or concern raised"],
    "marketPosition": "How BMW R 12 G/S is perceived vs competitors"
  },
  "dataHighlights": {
    "criticalQuote": "Most strategically important quote",
    "emergingTheme": "New or surprising theme discovered",
    "sentimentDriver": "Main factor driving positive/negative sentiment"
  }
}

AVOID:
- Generic statements like "improve customer experience"
- Vague recommendations without specific actions
- Obvious insights that don't add value
- Repeating data statistics without interpretation
- One-size-fits-all recommendations`;
}

/**
 * Enhanced prompt building with richer context
 */
function buildEnhancedInsightsPrompt(filteredData, activeFilters, section, reportContext = "") {
  const filterDescription = describeActiveFilters(activeFilters);
  const dataStats = generateDataStatistics(filteredData);
  const contextualInfo = generateContextualAnalysis(filteredData, activeFilters);
  
  const additionalContextSection = reportContext
    ? `\n\nADDITIONAL CONTEXT FROM MARKET REPORTS:\n${reportContext}`
    : "";

  return `Analyze consumer conversations about the BMW R 12 G/S motorcycle:

FILTER CONTEXT & DATA SUBSET:
${filterDescription}

DATASET OVERVIEW:
${dataStats}

CONTEXTUAL ANALYSIS:
${contextualInfo}

CURRENT SECTION: ${section}

ANALYSIS REQUIREMENTS:
1. Focus on ACTIONABLE insights - what should BMW Motorrad DO with this information?
2. Identify specific consumer segments and their unique needs/concerns
3. Highlight competitive positioning opportunities or threats
4. Detect patterns that reveal business opportunities or risks
5. Provide timeline-specific recommendations (quick wins vs. long-term strategy)

SAMPLE QUOTE ANALYSIS:
${generateSampleQuoteAnalysis(filteredData)}

Please provide strategic insights that go beyond surface-level observations. Focus on:
- What specific actions should product, marketing, or customer experience teams take?
- Which consumer segments are most/least satisfied and why?
- What competitive advantages or vulnerabilities are revealed?
- What emerging trends or opportunities can be capitalized on?

Return a detailed JSON analysis following the specified format.${additionalContextSection}`;
}

/**
 * Generate deeper contextual analysis of the filtered data
 */
function generateContextualAnalysis(filteredData, activeFilters) {
  const quotes = filteredData.quotes || [];
  const totalQuotes = filteredData.totalQuotes || 0;
  
  let contextualInsights = [];
  
  // Analyze filter implications
  if (activeFilters.length > 0) {
    const filterTypes = [...new Set(activeFilters.map(f => f.type))];
    const filterValues = activeFilters.map(f => f.value);
    
    contextualInsights.push(`Filter Focus: This analysis examines ${filterTypes.join(', ')} segments specifically: ${filterValues.join(', ')}`);
    contextualInsights.push(`Data Representation: ${totalQuotes} quotes represent a targeted subset of consumer conversations`);
  } else {
    contextualInsights.push(`Comprehensive Analysis: Full dataset analysis across all consumer segments and conversation topics`);
  }
  
  // Analyze quote distribution and patterns
  if (quotes.length > 0) {
    const themes = [...new Set(quotes.map(q => q.theme).filter(Boolean))];
    const sentiments = quotes.reduce((acc, q) => {
      const sentiment = q.sentiment || 'Unknown';
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {});
    
    contextualInsights.push(`Theme Diversity: ${themes.length} distinct themes discussed: ${themes.slice(0, 5).join(', ')}${themes.length > 5 ? '...' : ''}`);
    contextualInsights.push(`Sentiment Pattern: ${Object.entries(sentiments).map(([k,v]) => `${v} ${k.toLowerCase()}`).join(', ')}`);
  }
  
  // Time-based context if available
  if (filteredData.timeRange) {
    contextualInsights.push(`Temporal Context: Analysis covers ${filteredData.timeRange} period`);
  }
  
  return contextualInsights.join('\n');
}

/**
 * Generate sample quote analysis to guide AI reasoning
 */
function generateSampleQuoteAnalysis(filteredData) {
  const quotes = filteredData.quotes || [];
  if (quotes.length === 0) return "No sample quotes available for analysis";
  
  // Select diverse sample quotes (max 3)
  const sampleQuotes = [];
  const sentiments = ['Positive', 'Negative', 'Neutral'];
  
  sentiments.forEach(sentiment => {
    const quote = quotes.find(q => q.sentiment === sentiment);
    if (quote && sampleQuotes.length < 3) {
      sampleQuotes.push({
        text: quote.text,
        sentiment: quote.sentiment,
        theme: quote.theme || 'General',
        tags: quote.tags || []
      });
    }
  });
  
  // If we don't have enough diverse quotes, fill with any available
  while (sampleQuotes.length < 3 && sampleQuotes.length < quotes.length) {
    const quote = quotes[sampleQuotes.length];
    if (!sampleQuotes.find(sq => sq.text === quote.text)) {
      sampleQuotes.push({
        text: quote.text,
        sentiment: quote.sentiment,
        theme: quote.theme || 'General',
        tags: quote.tags || []
      });
    }
  }
  
  return sampleQuotes.map((quote, idx) => 
    `Quote ${idx + 1} (${quote.sentiment} - ${quote.theme}): "${quote.text}"${quote.tags.length ? ` [Tags: ${quote.tags.join(', ')}]` : ''}`
  ).join('\n');
}

/**
 * Enhanced mock insights with more specific recommendations
 */
function generateEnhancedMockInsights(filteredData, activeFilters, section) {
  const filterDescription = describeActiveFilters(activeFilters);
  const totalQuotes = filteredData.totalQuotes || 0;
  const topTheme = filteredData.topTheme?.name || "Performance";
  const quotes = filteredData.quotes || [];
  
  // Calculate sentiment percentages
  let sentimentBreakdown;
  if (filteredData.sentimentPercentages) {
    sentimentBreakdown = filteredData.sentimentPercentages;
  } else {
    const total = quotes.length || 1;
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    quotes.forEach(q => {
      if (q.sentiment && q.sentiment.toLowerCase() === 'positive') sentimentCounts.positive++;
      else if (q.sentiment && q.sentiment.toLowerCase() === 'neutral') sentimentCounts.neutral++;
      else sentimentCounts.negative++;
    });
    sentimentBreakdown = {
      positive: Math.round((sentimentCounts.positive / total) * 100),
      neutral: Math.round((sentimentCounts.neutral / total) * 100),
      negative: Math.round((sentimentCounts.negative / total) * 100)
    };
  }
  
  // Generate specific insights based on data patterns
  const keyInsights = generateSpecificInsights(filteredData, activeFilters, sentimentBreakdown);
  const actionableRecommendations = generateSpecificRecommendations(filteredData, activeFilters, sentimentBreakdown);
  const consumerSegments = analyzeConsumerSegments(filteredData, activeFilters);
  const competitiveIntel = generateCompetitiveIntelligence(filteredData, sentimentBreakdown);
  
  return {
    filterContext: `Analysis of ${totalQuotes} consumer quotes ${activeFilters.length > 0 ? `filtered by: ${filterDescription}` : 'across all segments'}. This represents a ${activeFilters.length > 0 ? 'targeted subset' : 'comprehensive view'} of R 12 G/S consumer conversations and should be interpreted accordingly.`,
    executiveSummary: generateExecutiveSummary(sentimentBreakdown, topTheme, activeFilters.length > 0),
    keyInsights,
    actionableRecommendations,
    consumerSegments,
    competitiveIntelligence: competitiveIntel,
    dataHighlights: {
      criticalQuote: findCriticalQuote(quotes, sentimentBreakdown),
      emergingTheme: identifyEmergingTheme(filteredData),
      sentimentDriver: identifySentimentDriver(filteredData, sentimentBreakdown)
    }
  };
}

/**
 * Generate specific, data-driven insights
 */
function generateSpecificInsights(filteredData, activeFilters, sentimentBreakdown) {
  const insights = [];
  const totalQuotes = filteredData.totalQuotes || 0;
  const topTheme = filteredData.topTheme?.name || "Performance";
  
  // Sentiment-based insights
  if (sentimentBreakdown.positive > 60) {
    insights.push({
      insight: `Strong positive sentiment (${sentimentBreakdown.positive}%) indicates high consumer satisfaction with R 12 G/S`,
      evidence: `${sentimentBreakdown.positive}% of ${totalQuotes} analyzed quotes express positive sentiment`,
      businessImplication: "BMW has a solid foundation for word-of-mouth marketing and customer retention in this segment"
    });
  } else if (sentimentBreakdown.negative > 40) {
    insights.push({
      insight: `Elevated negative sentiment (${sentimentBreakdown.negative}%) signals potential customer satisfaction issues`,
      evidence: `${sentimentBreakdown.negative}% of conversations express dissatisfaction or concerns`,
      businessImplication: "Risk of customer churn and negative word-of-mouth requiring immediate attention"
    });
  }
  
  // Theme-based insights
  insights.push({
    insight: `"${topTheme}" dominates consumer discussions with ${filteredData.topTheme?.percentage || 25}% of mentions`,
    evidence: `${topTheme} appears in ${Math.round((filteredData.topTheme?.percentage || 25) * totalQuotes / 100)} out of ${totalQuotes} quotes`,
    businessImplication: `This theme represents the primary consumer focus area and should guide ${topTheme.toLowerCase()}-related product development and messaging priorities`
  });
  
  // Filter-specific insights
  if (activeFilters.length > 0) {
    const filterType = activeFilters[0].type;
    const filterValue = activeFilters[0].value;
    insights.push({
      insight: `${filterValue} segment shows distinct conversation patterns compared to overall market`,
      evidence: `Filtered analysis reveals unique themes and sentiment patterns for ${filterValue} consumers`,
      businessImplication: `Targeted strategies needed for ${filterValue} segment rather than one-size-fits-all approach`
    });
  }
  
  return insights;
}

/**
 * Generate specific, actionable recommendations
 */
function generateSpecificRecommendations(filteredData, activeFilters, sentimentBreakdown) {
  const recommendations = [];
  const topTheme = filteredData.topTheme?.name || "Performance";
  
  // Sentiment-driven recommendations
  if (sentimentBreakdown.positive > 60) {
    recommendations.push({
      category: "Marketing",
      recommendation: "Develop customer testimonial campaign highlighting positive experiences",
      rationale: `${sentimentBreakdown.positive}% positive sentiment provides rich content for authentic marketing materials`,
      timeline: "Short-term (4-6 weeks)",
      expectedImpact: "Increased conversion rates and reduced customer acquisition costs"
    });
    
    recommendations.push({
      category: "Product Development",
      recommendation: `Enhance and expand features related to "${topTheme}" based on positive feedback`,
      rationale: `Strong positive sentiment around ${topTheme} indicates a competitive advantage to amplify`,
      timeline: "Medium-term (3-6 months)",
      expectedImpact: "Strengthened market position and increased customer satisfaction scores"
    });
  } else if (sentimentBreakdown.negative > 40) {
    recommendations.push({
      category: "Customer Experience",
      recommendation: "Implement immediate customer outreach program for negative sentiment drivers",
      rationale: `${sentimentBreakdown.negative}% negative sentiment requires proactive customer retention efforts`,
      timeline: "Immediate (1-2 weeks)",
      expectedImpact: "Reduced customer churn and improved Net Promoter Score"
    });
    
    recommendations.push({
      category: "Product Development",
      recommendation: `Address specific pain points identified in "${topTheme}" related complaints`,
      rationale: "High volume of negative feedback provides clear improvement roadmap",
      timeline: "Medium-term (6-12 months)",
      expectedImpact: "Reduced negative sentiment and improved customer satisfaction"
    });
  }
  
  // Theme-specific recommendations
  recommendations.push({
    category: "Content Strategy",
    recommendation: `Create detailed content addressing "${topTheme}" questions and concerns`,
    rationale: `${filteredData.topTheme?.percentage || 25}% of conversations focus on this topic`,
    timeline: "Short-term (2-4 weeks)",
    expectedImpact: "Improved customer education and reduced support inquiries"
  });
  
  return recommendations;
}

/**
 * Analyze consumer segments
 */
function analyzeConsumerSegments(filteredData, activeFilters) {
  let primarySegment = "Adventure Touring Enthusiasts";
  let concernsAndNeeds = ["Reliability for long-distance travel", "Comfort for extended rides"];
  let opportunityAreas = ["Accessory ecosystem expansion", "Community building initiatives"];
  
  if (activeFilters.length > 0) {
    const filterValue = activeFilters[0].value;
    if (filterValue.toLowerCase().includes('price') || filterValue.toLowerCase().includes('cost')) {
      primarySegment = "Price-Conscious Buyers";
      concernsAndNeeds = ["Value for money", "Total cost of ownership"];
      opportunityAreas = ["Financing options", "Entry-level variant development"];
    } else if (filterValue.toLowerCase().includes('performance')) {
      primarySegment = "Performance-Oriented Riders";
      concernsAndNeeds = ["Engine power and torque", "Handling and agility"];
      opportunityAreas = ["Performance upgrades", "Track day programs"];
    }
  }
  
  return {
    primarySegment,
    concernsAndNeeds,
    opportunityAreas
  };
}

/**
 * Generate competitive intelligence
 */
function generateCompetitiveIntelligence(filteredData, sentimentBreakdown) {
  return {
    bmwStrengths: ["German engineering reputation", "Adventure touring heritage", "Build quality perception"],
    vulnerabilities: sentimentBreakdown.negative > 30 ? 
      ["Price premium concerns", "Service accessibility", "Complexity for new riders"] :
      ["Market positioning clarity", "Digital experience gaps"],
    marketPosition: sentimentBreakdown.positive > 50 ? 
      "Strong competitive position with room for premium positioning" :
      "Competitive challenges requiring strategic repositioning"
  };
}

/**
 * Generate executive summary
 */
function generateExecutiveSummary(sentimentBreakdown, topTheme, isFiltered) {
  const sentimentLevel = sentimentBreakdown.positive > 60 ? "strong positive" : 
                        sentimentBreakdown.negative > 40 ? "concerning negative" : "mixed";
  
  const scope = isFiltered ? "targeted segment analysis reveals" : "comprehensive market analysis shows";
  
  return `${scope} ${sentimentLevel} consumer sentiment with "${topTheme}" as the primary discussion driver, indicating ${
    sentimentLevel === "strong positive" ? "opportunity for market expansion" :
    sentimentLevel === "concerning negative" ? "urgent need for customer retention focus" :
    "need for targeted segment strategies"
  }.`;
}

/**
 * Find the most strategically important quote
 */
function findCriticalQuote(quotes, sentimentBreakdown) {
  if (!quotes.length) return "No quotes available for analysis";
  
  // Prioritize negative quotes if high negative sentiment, otherwise positive quotes
  const targetSentiment = sentimentBreakdown.negative > 40 ? 'Negative' : 'Positive';
  const criticalQuote = quotes.find(q => q.sentiment === targetSentiment);
  
  return criticalQuote ? criticalQuote.text : quotes[0].text;
}

/**
 * Identify emerging themes
 */
function identifyEmergingTheme(filteredData) {
  // This would ideally compare against historical data
  return filteredData.topTheme?.name || "Adventure Capability";
}

/**
 * Identify main sentiment drivers
 */
function identifySentimentDriver(filteredData, sentimentBreakdown) {
  if (sentimentBreakdown.positive > 60) {
    return "Build quality and reliability exceed expectations";
  } else if (sentimentBreakdown.negative > 40) {
    return "Price-to-value perception and service experience concerns";
  } else {
    return "Mixed reactions to feature complexity vs. usability";
  }
}

/**
 * Parse the enhanced AI response into structured insights
 */
function parseEnhancedInsightsResponse(content) {
  try {
    // Try to extract JSON from the response
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Ensure all required fields are present with proper structure
      return {
        filterContext: parsed.filterContext || "Filter context not provided",
        executiveSummary: parsed.executiveSummary || "Executive summary not provided",
        keyInsights: parsed.keyInsights || [
          {
            insight: "No insights provided",
            evidence: "Unable to parse AI response",
            businessImplication: "Manual analysis required"
          }
        ],
        actionableRecommendations: parsed.actionableRecommendations || [
          {
            category: "Analysis",
            recommendation: "Review AI service configuration",
            rationale: "Response parsing failed",
            timeline: "Immediate",
            expectedImpact: "Restored insights functionality"
          }
        ],
        consumerSegments: parsed.consumerSegments || {
          primarySegment: "Unknown",
          concernsAndNeeds: ["Unable to determine"],
          opportunityAreas: ["Manual analysis required"]
        },
        competitiveIntelligence: parsed.competitiveIntelligence || {
          bmwStrengths: ["Unable to determine"],
          vulnerabilities: ["Unable to determine"],
          marketPosition: "Analysis required"
        },
        dataHighlights: parsed.dataHighlights || {
          criticalQuote: "Unable to extract quote",
          emergingTheme: "Unknown",
          sentimentDriver: "Unable to determine"
        }
      };
    }
  } catch (error) {
    console.error("Failed to parse enhanced AI response:", error);
  }
  
  // Fallback if parsing fails - return mock insights
  return generateEnhancedMockInsights(
    { totalQuotes: 0, quotes: [] }, 
    [], 
    "unknown"
  );
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
  
  return `${filterDescriptions.join(', ')}`;
}

/**
 * Generate data statistics for the prompt
 */
function generateDataStatistics(data) {
  const totalQuotes = data.totalQuotes || 0;
  const topTheme = data.topTheme?.name || "N/A";
  const topThemePercentage = data.topTheme?.percentage || 0;
  
  let sentimentInfo = "Sentiment data not available";
  if (data.sentimentPercentages) {
    const { positive, neutral, negative } = data.sentimentPercentages;
    sentimentInfo = `Sentiment Distribution: ${positive}% positive, ${neutral}% neutral, ${negative}% negative`;
  }
  
  return `Total Quotes: ${totalQuotes}
${sentimentInfo}
Top Theme: ${topTheme} (${topThemePercentage}% of mentions)
Time Range: ${data.timeRange || 'N/A'}`;
}

/**
 * Build a search query for the reports vector store
 */
function buildReportQuery(filteredData, activeFilters) {
  const filterDesc = describeActiveFilters(activeFilters);
  const topTheme = filteredData.topTheme?.name;
  const timeRange = filteredData.timeRange
    ? `weeks ${filteredData.timeRange.start}-${filteredData.timeRange.end}`
    : "";

  let query = `Context for filters: ${filterDesc}`;
  if (topTheme) query += ` focusing on theme ${topTheme}`;
  if (timeRange) query += ` during ${timeRange}`;
  return query;
}

/**
 * Retrieve context from the reports vector store using file_search
 */
async function retrieveReportContext(query) {
  if (!openai || !REPORTS_VECTOR_STORE_ID) return null;

  try {
    const assistant = await openai.beta.assistants.create({
      name: "Report Search Assistant",
      instructions:
        "Search BMW market reports and return concise relevant passages.",
      model: "gpt-4o-mini",
      tools: [{ type: "file_search" }],
      tool_resources: {
        file_search: {
          vector_store_ids: [REPORTS_VECTOR_STORE_ID],
        },
      },
    });

    const thread = await openai.beta.threads.create();
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: query,
    });

    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistant.id,
    });

    let result = null;
    if (run.status === "completed") {
      const messages = await openai.beta.threads.messages.list(thread.id);
      const msg = messages.data.find((m) => m.role === "assistant");
      if (msg && msg.content[0]) {
        result = msg.content[0].text.value;
      }
    }

    await openai.beta.assistants.del(assistant.id);
    return result;
  } catch (err) {
    console.log("Vector store retrieval failed:", err.message);
    return null;
  }
}
