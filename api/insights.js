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
    const { filteredData, activeFilters, section, market } = req.body;
    console.log("🔍 Insights API - Received data:", { 
      totalQuotes: filteredData?.totalQuotes,
      sentimentPercentages: filteredData?.sentimentPercentages,
      activeFilters: activeFilters?.length,
      market: market
    });

    if (!filteredData) {
      return res.status(400).json({ error: "Filtered data is required" });
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.log("No OpenAI API key available, returning simple fallback");
      return res.json({
        success: true,
        insights: generateSimpleFallback(filteredData, activeFilters)
      });
    }

    // Generate AI insights with enhanced prompts
    const insights = await generateAIInsights(filteredData, activeFilters, section, market);
    
    res.json({
      success: true,
      insights: insights
    });

  } catch (error) {
    console.error("Insights API error:", error);
    
    // Fallback to simple insights on error
    const { filteredData, activeFilters } = req.body;
    res.json({
      success: true,
      insights: generateSimpleFallback(filteredData, activeFilters)
    });
  }
};

/**
 * Generate AI insights using OpenAI with enhanced prompts
 */
async function generateAIInsights(filteredData, activeFilters, section, market) {
  if (!openai) {
    console.log("OpenAI client not initialized, returning simple fallback");
    return generateSimpleFallback(filteredData, activeFilters);
  }

  let reportContext = "";
  const query = buildReportQuery(filteredData, activeFilters, market);
  // Attempt to enrich prompt with context from market reports via vector store
  try {
    console.log("🔍 Vector Store Query:", query);
    reportContext = await retrieveReportContext(query);
    console.log("🔍 Retrieved Report Context:", reportContext ? "✅ Context retrieved" : "❌ No context");
  } catch (ctxErr) {
    console.log("Report context retrieval failed:", ctxErr.message);
  }

  const prompt = buildInsightsPrompt(filteredData, activeFilters, section, reportContext);

  // Set the model for chat completion to 'gpt-4o-mini'
  const model = "gpt-4o-mini";
  const isO3 = model === "o3";
  const completionParams = {
    model,
    messages: [
      {
        role: "system",
        content: getInsightsSystemPrompt(),
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    ...(isO3
      ? { max_completion_tokens: 1200 }
      : { max_tokens: 1200, temperature: 0.2 }),
  };
  const response = await openai.chat.completions.create(completionParams);
  // Debug log for full AI response
  console.log("AI full response:", response);
  console.log("AI message object:", response.choices[0].message);
  const content = response.choices[0].message.content;
  return parseInsightsResponse(content);
}

/**
 * System prompt for marketing-focused insights
 */
function getInsightsSystemPrompt() {
  return `You are a senior market research analyst specializing in BMW Motorrad consumer insights and competitive intelligence. Your expertise includes motorcycle market dynamics, consumer behavior patterns, and actionable marketing strategy development.

TARGET AUDIENCE: Marketing professionals, marketing agencies, strategy consultants, and communications teams who need actionable insights for campaigns, positioning, messaging, and market strategy.

IMPORTANT: Only provide recommendations related to marketing, brand strategy, communications, or audience targeting. Do NOT provide recommendations about product development, product features, or pricing, as your audience has no influence over those areas.

• filteredQuotes            – Array<{ quote, theme, sentiment, week, purchaseIntent, market }>
• activeFilters             – Array<{ field, value }>  // may be empty
• totalQuotes               – Integer (filteredQuotes.length)
• filterDesc                – Short human-readable description of activeFilters
• getMarketContext(market)  – function that returns the 3 most relevant passages from that market’s deep-dive report (vector store).

###  Size rules
* Max 1200 tokens total.
* Strings ≤ 35 tokens each (use crisp phrases, no waffle).
* No line-breaks inside the JSON; minify before emitting.

##############################
## Output contract – RETURN ONE *MINIFIED* JSON OBJECT ONLY

{
  "filterContext": String,
  "executiveSummary": String,
  "keyInsights": Array<{
    humanTruth: String, // underlying human truth behind the finding
    explanation: String, // explanation of the human truth in context
    evidence: String,
    businessImplication: String
  }>,
  "actionableRecommendations": Array<{ category, recommendation, rationale, timeline, expectedImpact }>,
  "consumerSegments": { primarySegment, concernsAndNeeds: Array<String>, opportunityAreas: Array<String> },
  "competitiveIntelligence": { strengths: Array<String>, vulnerabilities: Array<String>, marketPosition: String },
  "dataHighlights": { criticalQuote, emergingTheme, sentimentDriver }
}

##############################
## Method (follow in order)

1. **Validate data**
   • If totalQuotes == 0 ➜ skip to Step 6 (fallback).

2. **Build filterContext**
   • Template:  Analysis of {totalQuotes} consumer quotes { activeFilters.length ? "filtered by: "+filterDesc : "across all segments" }.

3. **Analyse filteredQuotes**
   • Cluster by theme & sentiment.
   • Surface top 3-4 statistically salient insights (frequency × intensity × purchaseIntent).
   • For each key finding, explicitly identify the underlying 'human truth' (the core emotional, psychological, or behavioral driver revealed by the data) and provide a concise explanation.

4. **Augment with market context**
   • For each emerging insight, call getMarketContext(market) once (use the market with the highest quote count for that insight).
   • Extract 1–2 sentences of evidence from the returned passages.

5. **Generate final sections**
   • executiveSummary – 2 sentences: headline insight + strategic angle.
   • keyInsights – 3-4 items, each with humanTruth, explanation, evidence, and businessImplication.
   • actionableRecommendations – mirror each keyInsight with a clear action; set timeline to “Immediate”, “Next 3 months”, or “Strategic (12 months)”.
   • consumerSegments – identify main segment mentioned most; list their top concerns/needs & opportunityAreas.
   • competitiveIntelligence – focus on BMW vs competitors if present; else use “Segmentation-specific competitor(s)”.
   • dataHighlights – choose one punchy quote (≤ 25 tokens), the top emerging theme word/phrase, and main positive or negative sentiment driver.

6. **Fallback (no data or error)**
   • Populate every field with a short advisory message, NEVER leave fields empty.
   • Example: "AI analysis unavailable".

##############################
## Style constraints

* **Do not** mention token limits, models, or internal steps.
* Use **present tense** and action verbs.
* Avoid hedging words (“might”, “could”) unless evidence is weak.
* Keep quotes verbatim but truncate to 25 tokens max, add an ellipsis (…) if cut.

##############################
## Safety

If input text contains disallowed content, sanitise by redacting offensive terms (“****”) and still return the normal JSON structure with a note in dataHighlights.sentimentDriver.

##############################
## Final instruction

After reasoning, output only the minified JSON object described above – no markdown, no commentary.`;
}

/**
 * Build user prompt with filtered data and vector store context
 */
function buildInsightsPrompt(filteredData, activeFilters, section, reportContext = "") {
  const filterDescription = describeActiveFilters(activeFilters);
  const dataStats = generateDataStatistics(filteredData);
  const sampleQuotes = generateSampleQuotes(filteredData);
  
  const additionalContextSection = reportContext
    ? `\n\nADDITIONAL CONTEXT FROM MARKET REPORTS:\n${reportContext}`
    : "";

  return `Analyze consumer conversations about the BMW R 12 G/S motorcycle:

FILTER CONTEXT & DATA SUBSET:
${filterDescription}

DATASET OVERVIEW:
${dataStats}

CURRENT SECTION: ${section}

SAMPLE QUOTES FOR ANALYSIS:
${sampleQuotes}

ANALYSIS REQUIREMENTS:
1. Focus on MARKETING-ACTIONABLE insights - what should BMW Motorrad marketing, strategy, and communications teams DO with this information?
2. Identify specific consumer segments and their unique needs/concerns for targeted marketing
3. Highlight competitive positioning opportunities or threats for brand strategy
4. Detect patterns that reveal marketing opportunities or brand risks
5. Provide timeline-specific marketing recommendations (campaign quick wins vs. long-term brand strategy)
6. **Do NOT provide recommendations about product development, product features, or pricing. Only provide recommendations related to marketing, brand strategy, communications, or audience targeting.**

Please provide strategic marketing insights that go beyond surface-level observations. Focus on:
- What specific marketing actions should brand, communications, or campaign teams take?
- Which consumer segments are most/least satisfied and how to target them effectively?
- What competitive advantages or vulnerabilities are revealed for positioning strategy?
- What emerging trends or opportunities can be capitalized on through marketing campaigns?
- How can this data inform messaging, content strategy, and brand communications?
- **Do NOT provide recommendations about product or pricing.**

Return a detailed JSON analysis following the specified format.${additionalContextSection}`;
}

/**
 * Generate sample quotes for AI analysis
 */
function generateSampleQuotes(filteredData) {
  const quotes = filteredData.quotes || [];
  if (quotes.length === 0) return "No sample quotes available for analysis";
  
  // Select diverse sample quotes (max 5)
  const sampleQuotes = [];
  const sentiments = ['Positive', 'Negative', 'Neutral'];
  
  sentiments.forEach(sentiment => {
    const quote = quotes.find(q => q.sentiment === sentiment);
    if (quote && sampleQuotes.length < 5) {
      sampleQuotes.push({
        text: quote.text,
        sentiment: quote.sentiment,
        theme: quote.theme || 'General'
      });
    }
  });
  
  // Fill remaining slots with any available quotes
  while (sampleQuotes.length < 5 && sampleQuotes.length < quotes.length) {
    const quote = quotes[sampleQuotes.length];
    if (!sampleQuotes.find(sq => sq.text === quote.text)) {
      sampleQuotes.push({
        text: quote.text,
        sentiment: quote.sentiment,
        theme: quote.theme || 'General'
      });
    }
  }
  
  return sampleQuotes.map((quote, idx) => 
    `Quote ${idx + 1} (${quote.sentiment} - ${quote.theme}): "${quote.text}"`
  ).join('\n');
}

/**
 * Parse AI response into structured insights
 */
function parseInsightsResponse(content) {
  try {
    // Debug log for raw AI response
    console.log("AI raw response:", content);
    // Try to extract JSON from the response
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }
  } catch (error) {
    console.error("Failed to parse AI response:", error);
  }
  
  // Fallback if parsing fails
  return {
    filterContext: "Unable to parse AI response",
    executiveSummary: "Analysis failed - please try again",
    keyInsights: [{ 
      insight: "Response parsing failed", 
      evidence: "Technical error occurred", 
      businessImplication: "Manual analysis required" 
    }],
    actionableRecommendations: [{ 
      category: "Technical", 
      recommendation: "Retry analysis", 
      rationale: "Parsing error", 
      timeline: "Immediate", 
      expectedImpact: "Restored functionality" 
    }],
    consumerSegments: { 
      primarySegment: "Unknown", 
      concernsAndNeeds: ["Unable to determine"], 
      opportunityAreas: ["Retry analysis"] 
    },
    competitiveIntelligence: { 
      bmwStrengths: ["Unable to determine"], 
      vulnerabilities: ["Unable to determine"], 
      marketPosition: "Analysis required" 
    },
    dataHighlights: { 
      criticalQuote: "Unable to extract", 
      emergingTheme: "Unknown", 
      sentimentDriver: "Unable to determine" 
    }
  };
}

/**
 * Simple fallback when AI is unavailable
 */
function generateSimpleFallback(filteredData, activeFilters) {
  const totalQuotes = filteredData.totalQuotes || 0;
  const filterDesc = describeActiveFilters(activeFilters);
  
  return {
    filterContext: `Analysis of ${totalQuotes} consumer quotes ${activeFilters.length > 0 ? `filtered by: ${filterDesc}` : 'across all segments'}. AI analysis unavailable - showing basic data summary.`,
    executiveSummary: `Demo mode active - ${totalQuotes} quotes analyzed. Full AI insights require API key configuration.`,
    keyInsights: [{ 
      insight: "AI analysis unavailable", 
      evidence: "No OpenAI API key configured", 
      businessImplication: "Configure API key for detailed marketing insights" 
    }],
    actionableRecommendations: [{ 
      category: "Technical", 
      recommendation: "Configure OpenAI API key in environment variables", 
      rationale: "Required for AI-powered insights generation", 
      timeline: "Immediate", 
      expectedImpact: "Enable full insights functionality" 
    }],
    consumerSegments: { 
      primarySegment: "Unknown - AI analysis required", 
      concernsAndNeeds: ["API key configuration needed"], 
      opportunityAreas: ["Enable AI analysis"] 
    },
    competitiveIntelligence: { 
      bmwStrengths: ["Configure API key to analyze"], 
      vulnerabilities: ["Configure API key to analyze"], 
      marketPosition: "AI analysis required" 
    },
    dataHighlights: { 
      criticalQuote: "AI analysis unavailable", 
      emergingTheme: "Configure API key", 
      sentimentDriver: "AI analysis required" 
    }
  };
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
function buildReportQuery(filteredData, activeFilters, market) {
  const filterDesc = describeActiveFilters(activeFilters);
  const topTheme = filteredData.topTheme?.name;
  const timeRange = filteredData.timeRange
    ? `weeks ${filteredData.timeRange.start}-${filteredData.timeRange.end}`
    : "";

  let query = `BMW R 12 G/S market insights`;
  if (market) query += ` for ${market}`;
  query += ` related to: ${filterDesc}`;
  if (topTheme) query += ` focusing on ${topTheme}`;
  if (timeRange) query += ` during ${timeRange}`;
  query += `. Only use information from the ${market} market report.`;
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
      instructions: "Search BMW market reports and return concise relevant passages that provide additional context for consumer insights analysis.",
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

    await openai.beta.assistants.delete(assistant.id);
    return result;
  } catch (err) {
    console.log("Vector store retrieval failed:", err.message);
    return null;
  }
}
