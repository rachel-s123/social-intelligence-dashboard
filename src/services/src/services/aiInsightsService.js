// src/services/aiInsightsService.js

import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
});

/**
 * AI Insights Service for R 12 G/S Filtering
 * Generates contextual mini-reports based on filtered data
 */
class AIInsightsService {
  constructor() {
    this.model = "gpt-4o-mini";
    this.temperature = 0.3; // Slightly higher for creative insights
    this.maxTokens = 800; // Shorter responses for mini-reports
    
    // Debug API key detection
    const reactAppKey = process.env.REACT_APP_OPENAI_API_KEY;
    const regularKey = process.env.OPENAI_API_KEY;
    const hasApiKey = reactAppKey || regularKey;
    
    console.log("🔍 AI Insights Service - API Key Detection:", {
      hasReactAppKey: !!reactAppKey,
      hasRegularKey: !!regularKey,
      hasAnyKey: !!hasApiKey,
      reactAppKeyLength: reactAppKey ? reactAppKey.length : 0,
      regularKeyLength: regularKey ? regularKey.length : 0,
      reactAppKeyPrefix: reactAppKey ? reactAppKey.substring(0, 10) + "..." : "none",
      regularKeyPrefix: regularKey ? regularKey.substring(0, 10) + "..." : "none"
    });
    
    this.demoMode = !hasApiKey;
    
    if (this.demoMode) {
      console.log("🎭 Running in DEMO MODE - no API key detected");
    } else {
      console.log("🤖 Running with REAL AI - API key detected");
    }
  }

  /**
   * Generate AI insights based on filtered data
   * @param {Object} filteredData - The filtered data from the dashboard
   * @param {Array} activeFilters - Currently active filters
   * @param {string} section - Dashboard section (themes, sentiment, timeline, etc.)
   * @returns {Promise<Object>} - Structured insights object
   */
  async generateFilteredInsights(filteredData, activeFilters, section) {
    try {
      // Check if we're in demo mode (no API key)
      if (this.demoMode) {
        console.log("Running in demo mode - generating mock insights");
        return this.generateMockInsights(filteredData, activeFilters, section);
      }

      const prompt = this.buildInsightsPrompt(filteredData, activeFilters, section);
      
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: this.getInsightsSystemPrompt()
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens,
      });

      const content = response.choices[0].message.content;
      return this.parseInsightsResponse(content);
    } catch (error) {
      console.error("AI Insights generation error:", error);
      
      // If API fails, fall back to mock insights
      console.log("API failed, falling back to mock insights");
      return this.generateMockInsights(filteredData, activeFilters, section);
    }
  }

  /**
   * Generate mock insights for demo mode or API failures
   */
  generateMockInsights(filteredData, activeFilters, section) {
    const filterDescription = this.describeActiveFilters(activeFilters);
    const dataStats = this.generateDataStatistics(filteredData);
    
    // Generate contextual mock insights based on the data
    const mockInsights = {
      summary: this.generateMockSummary(filteredData, activeFilters, section),
      keyFindings: this.generateMockFindings(filteredData, activeFilters, section),
      recommendations: this.generateMockRecommendations(filteredData, activeFilters, section),
      dataHighlights: this.generateMockHighlights(filteredData, activeFilters, section)
    };

    return {
      success: true,
      insights: mockInsights
    };
  }

  /**
   * Generate mock summary based on data
   */
  generateMockSummary(filteredData, activeFilters, section) {
    const totalQuotes = filteredData.totalQuotes || 0;
    const avgSentiment = filteredData.averageSentiment || 3.0;
    const topTheme = filteredData.topTheme?.name || "General";
    
    if (activeFilters.length === 0) {
      return `Analysis of ${totalQuotes} consumer quotes reveals an average sentiment score of ${avgSentiment}/5.0, with "${topTheme}" being the most discussed theme. This comprehensive view shows overall consumer perception of the R 12 G/S.`;
    }
    
    const filterDesc = activeFilters.map(f => f.value).join(", ");
    return `Filtered analysis of ${totalQuotes} quotes (${filterDesc}) shows ${avgSentiment}/5.0 average sentiment with "${topTheme}" as the primary theme. This focused view reveals specific consumer insights for the selected criteria.`;
  }

  /**
   * Generate mock findings based on data
   */
  generateMockFindings(filteredData, activeFilters, section) {
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
  generateMockRecommendations(filteredData, activeFilters, section) {
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
  generateMockHighlights(filteredData, activeFilters, section) {
    const topTheme = filteredData.topTheme?.name || "Performance";
    const avgSentiment = filteredData.averageSentiment || 3.0;
    const quotes = filteredData.quotes || [];
    
    let sentimentTrend = "Neutral";
    if (avgSentiment > 3.5) sentimentTrend = "Positive";
    else if (avgSentiment < 2.5) sentimentTrend = "Negative";
    
    const criticalQuote = quotes.length > 0 
      ? quotes[0].text || "Sample consumer feedback unavailable"
      : "No quotes available for analysis";
    
    return {
      strongestTheme: topTheme,
      sentimentTrend: sentimentTrend,
      criticalQuote: criticalQuote.length > 100 ? criticalQuote.substring(0, 100) + "..." : criticalQuote
    };
  }

  /**
   * System prompt specifically for filtering insights
   */
  getInsightsSystemPrompt() {
    return `You are an AI analyst specializing in BMW R 12 G/S consumer insights. Your role is to generate concise, actionable mini-reports based on filtered data.

RESPONSE FORMAT - Always structure your response as JSON:
{
  "summary": "2-3 sentence overview of key insights from the filtered data",
  "keyFindings": [
    "Finding 1 - specific insight with percentage or data point",
    "Finding 2 - trend or pattern identified",
    "Finding 3 - consumer behavior insight"
  ],
  "recommendations": [
    "Actionable recommendation 1",
    "Strategic suggestion 2",
    "Market opportunity 3"
  ],
  "dataHighlights": {
    "strongestTheme": "Most prominent theme in filtered data",
    "sentimentTrend": "Overall sentiment direction",
    "criticalQuote": "Most representative consumer quote"
  }
}

GUIDELINES:
- Focus on the specific filtered subset, not general insights
- Highlight what makes this filtered view unique or significant
- Include specific percentages, themes, or sentiment scores when available
- Keep insights actionable and business-relevant
- Maintain BMW Motorrad brand perspective
- Use data-driven language, not speculation`;
  }

  /**
   * Build the insights prompt based on filtered data
   */
  buildInsightsPrompt(filteredData, activeFilters, section) {
    const filterDescription = this.describeActiveFilters(activeFilters);
    const dataStats = this.generateDataStatistics(filteredData);
    
    return `Analyze the following R 12 G/S consumer data subset and generate insights:

ACTIVE FILTERS: ${filterDescription}
DASHBOARD SECTION: ${section}

DATA SUMMARY:
${dataStats}

FILTERED CONSUMER QUOTES (sample):
${this.formatQuoteSample(filteredData.quotes?.slice(0, 5) || [])}

SENTIMENT BREAKDOWN:
${this.formatSentimentData(filteredData.sentimentData || [])}

THEME DISTRIBUTION:
${this.formatThemeData(filteredData.themeData || [])}

Generate a focused mini-report that explains what this filtered data reveals about R 12 G/S consumer sentiment and provides actionable recommendations.`;
  }

  /**
   * Describe active filters in natural language
   */
  describeActiveFilters(filters) {
    if (!filters || filters.length === 0) return "No filters applied - viewing all data";
    
    const filterDescriptions = filters.map(filter => {
      switch (filter.type) {
        case 'theme':
          return `Theme: ${filter.value}`;
        case 'sentiment':
          return `Sentiment: ${filter.value}`;
        case 'platform':
          return `Platform: ${filter.value}`;
        case 'week':
          return `Week: ${filter.value}`;
        case 'purchaseIntent':
          return `Purchase Intent: ${filter.value}`;
        case 'dateRange':
          return `Date Range: ${filter.startDate} to ${filter.endDate}`;
        default:
          return `${filter.type}: ${filter.value}`;
      }
    });
    
    return filterDescriptions.join(", ");
  }

  /**
   * Generate statistics from filtered data
   */
  generateDataStatistics(data) {
    const stats = [];
    
    if (data.totalQuotes) {
      stats.push(`Total Consumer Quotes: ${data.totalQuotes}`);
    }
    
    if (data.averageSentiment) {
      stats.push(`Average Sentiment Score: ${data.averageSentiment}/5.0`);
    }
    
    if (data.topTheme) {
      stats.push(`Most Discussed Theme: ${data.topTheme.name} (${data.topTheme.percentage}%)`);
    }
    
    if (data.timeRange) {
      stats.push(`Time Period: ${data.timeRange.start} to ${data.timeRange.end}`);
    }
    
    return stats.join("\n");
  }

  /**
   * Format quote samples for the prompt
   */
  formatQuoteSample(quotes) {
    if (!quotes || quotes.length === 0) return "No quotes available";
    
    return quotes.map((quote, index) => 
      `${index + 1}. "${quote.text}" - ${quote.sentiment} sentiment, ${quote.theme} theme, ${quote.platform}`
    ).join("\n");
  }

  /**
   * Format sentiment data for the prompt
   */
  formatSentimentData(sentimentData) {
    if (!sentimentData || sentimentData.length === 0) return "No sentiment data available";
    
    return sentimentData.map(item => 
      `${item.name}: ${item.value} (${item.percentage || 'N/A'}%)`
    ).join(", ");
  }

  /**
   * Format theme data for the prompt
   */
  formatThemeData(themeData) {
    if (!themeData || themeData.length === 0) return "No theme data available";
    
    return themeData.map(item => 
      `${item.subject}: ${item.value} mentions (${item.percentage || 'N/A'}%)`
    ).join(", ");
  }

  /**
   * Parse the AI response into structured format
   */
  parseInsightsResponse(content) {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content);
      return {
        success: true,
        insights: parsed
      };
    } catch (error) {
      // If JSON parsing fails, create structured response from text
      return {
        success: true,
        insights: {
          summary: content.split('\n')[0] || "Analysis complete",
          keyFindings: this.extractListItems(content, 'finding'),
          recommendations: this.extractListItems(content, 'recommend'),
          dataHighlights: {
            strongestTheme: "Unable to parse from response",
            sentimentTrend: "Unable to parse from response",
            criticalQuote: "Unable to parse from response"
          }
        }
      };
    }
  }

  /**
   * Extract list items from text response
   */
  extractListItems(text, keyword) {
    const lines = text.split('\n');
    const items = [];
    
    lines.forEach(line => {
      if (line.toLowerCase().includes(keyword) && line.includes('-')) {
        items.push(line.split('-').slice(1).join('-').trim());
      }
    });
    
    return items.length > 0 ? items : [`Analysis related to ${keyword} available in full response`];
  }

  /**
   * Return error response structure
   */
  getErrorResponse() {
    return {
      success: false,
      insights: {
        summary: "Unable to generate insights at this time. Please try again or check your filters.",
        keyFindings: ["Analysis temporarily unavailable"],
        recommendations: ["Please refresh and try again"],
        dataHighlights: {
          strongestTheme: "Data unavailable",
          sentimentTrend: "Data unavailable", 
          criticalQuote: "Data unavailable"
        }
      }
    };
  }
}

// Export singleton instance
export const aiInsightsService = new AIInsightsService();