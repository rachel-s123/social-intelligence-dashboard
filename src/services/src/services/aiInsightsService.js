// src/services/aiInsightsService.js

/**
 * AI Insights Service for R 12 G/S Filtering
 * Generates contextual mini-reports based on filtered data
 * Now uses server-side API endpoint for secure OpenAI calls
 */
class AIInsightsService {
  constructor() {
    // Debug API endpoint detection
    console.log("🔍 AI Insights Service - Using server-side API endpoint");
    
    this.demoMode = false; // We'll let the server handle demo mode
  }

  /**
   * Generate AI insights based on filtered data
   * @param {Object} filteredData - The filtered data from the dashboard
   * @param {Array} activeFilters - Currently active filters
   * @param {string} section - Dashboard section (themes, sentiment, timeline, etc.)
   * @param {string} market - The market for which insights are generated (e.g., "US", "EU")
   * @returns {Promise<Object>} - Structured insights object
   */
  async generateFilteredInsights(filteredData, activeFilters, section, market) {
    try {
      console.log("🚀 Calling server-side insights API...");
      
      // Limit quotes to prevent payload size issues - send only essential data
      const maxQuotes = 100; // Limit to 100 quotes max
      const limitedQuotes = (filteredData.quotes || []).slice(0, maxQuotes);
      
      // Optimize quote data by keeping only essential fields
      const optimizedQuotes = limitedQuotes.map(quote => ({
        text: quote.text,
        sentiment: quote.sentiment,
        theme: quote.theme,
        platform: quote.platform,
        week: quote.week,
        // Remove other fields to reduce payload size
      }));
      
      const optimizedData = {
        totalQuotes: filteredData.totalQuotes,
        sentimentPercentages: filteredData.sentimentPercentages,
        topTheme: filteredData.topTheme?.name || "General",
        timeRange: filteredData.timeRange || "All time",
        // Include optimized quotes to prevent payload size issues
        quotes: optimizedQuotes,
        // Add note about data limitation
        dataNote: `Analysis based on ${optimizedQuotes.length} of ${filteredData.totalQuotes || 0} total quotes to ensure optimal performance.`
      };

      // Simplified filters - only essential info and limit filter count
      const maxFilters = 10; // Limit filters to prevent payload bloat
      const simplifiedFilters = (activeFilters || []).slice(0, maxFilters).map(f => ({
        type: f.type,
        value: f.value
      }));

      const payload = {
        filteredData: optimizedData,
        activeFilters: simplifiedFilters,
        section: section || "general",
        market: market || null
      };

      const payloadString = JSON.stringify(payload);
      const payloadSizeKB = Math.round(payloadString.length / 1024);
      console.log("🔍 Payload size:", payloadSizeKB, "KB");
      console.log("🔍 Quotes count:", optimizedData.quotes.length);
      
      // Check payload size before sending
      if (payloadSizeKB > 5000) { // 5MB limit
        console.warn("⚠️ Payload too large, falling back to mock insights");
        return {
          success: true,
          insights: this.generateMockInsights(filteredData, activeFilters, section)
        };
      }
      
      console.log("📤 Sending request to /api/insights...");
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payloadString
      });

      if (!response.ok) {
        console.error("❌ API Response error:", response.status, response.statusText);
        if (response.status === 431) {
          console.error("❌ Payload too large - consider reducing data size");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("🔍 Server response:", result);
      console.log("🔍 Response success:", result.success);
      console.log("🔍 Response insights keys:", result.insights ? Object.keys(result.insights) : "No insights");
      
      if (result.success) {
        console.log("✅ Insights generated successfully via server API");
        return result;
      } else {
        console.log("❌ Server returned error:", result.error);
        throw new Error(result.error || "Failed to generate insights");
      }
    } catch (error) {
      console.error("AI Insights API error:", error);
      
      // Provide specific error handling for different error types
      if (error.message.includes('431')) {
        console.error("❌ Request header fields too large - payload size issue");
        console.log("💡 Consider reducing the amount of data or using more specific filters");
      } else if (error.message.includes('413')) {
        console.error("❌ Payload too large - server rejected the request");
        console.log("💡 Data size exceeded server limits");
      }
      
      // Fallback to mock insights if server call fails
      console.log("Server API failed, falling back to mock insights");
      return {
        success: true,
        insights: this.generateMockInsights(filteredData, activeFilters, section),
        error: error.message,
        fallback: true
      };
    }
  }

  /**
   * Generate mock insights for fallback scenarios
   */
  generateMockInsights(filteredData, activeFilters, section) {
    const filterDescription = this.describeActiveFilters(activeFilters);
    const dataStats = this.generateDataStatistics(filteredData);
    
    // Use sentiment percentages from filteredData if available, otherwise calculate from quotes
    let sentimentBreakdown;
    if (filteredData.sentimentPercentages) {
      sentimentBreakdown = {
        positive: { count: 0, percentage: filteredData.sentimentPercentages.positive },
        neutral: { count: 0, percentage: filteredData.sentimentPercentages.neutral },
        negative: { count: 0, percentage: filteredData.sentimentPercentages.negative },
        scoreExplanation: "Sentiment breakdown shows the percentage distribution of positive, neutral, and negative quotes in the filtered dataset."
      };
    } else {
      // Fallback calculation from quotes
      const quotes = filteredData.quotes || [];
      const total = quotes.length || 1;
      const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
      quotes.forEach(q => {
        if (q.sentiment && q.sentiment.toLowerCase() === 'positive') sentimentCounts.positive++;
        else if (q.sentiment && q.sentiment.toLowerCase() === 'neutral') sentimentCounts.neutral++;
        else sentimentCounts.negative++;
      });
      sentimentBreakdown = {
        positive: { count: sentimentCounts.positive, percentage: Math.round((sentimentCounts.positive / total) * 100) },
        neutral: { count: sentimentCounts.neutral, percentage: Math.round((sentimentCounts.neutral / total) * 100) },
        negative: { count: sentimentCounts.negative, percentage: Math.round((sentimentCounts.negative / total) * 100) },
        scoreExplanation: "Sentiment breakdown shows the percentage distribution of positive, neutral, and negative quotes in the filtered dataset."
      };
    }
    
    // Generate contextual mock insights based on the data
    const mockInsights = {
      filterContext: `Analysis based on filtered data: ${filterDescription}. This represents a subset of consumer feedback, not the complete dataset.`,
      executiveSummary: this.generateMockSummary(filteredData, activeFilters, section, sentimentBreakdown),
      humanTruths: this.generateMockHumanTruths(filteredData, activeFilters, section, sentimentBreakdown),
      recommendations: this.generateMockRecommendations(filteredData, activeFilters, section, sentimentBreakdown),
      dataHighlights: this.generateMockHighlights(filteredData, activeFilters, section, sentimentBreakdown)
    };

    return {
      success: true,
      insights: mockInsights
    };
  }

  /**
   * Generate mock human truths based on data
   */
  generateMockHumanTruths(filteredData, activeFilters, section, sentimentBreakdown) {
    const totalQuotes = filteredData.totalQuotes || 0;
    const topTheme = filteredData.topTheme?.name || "General";
    const positivePct = sentimentBreakdown.positive.percentage;
    
    const humanTruths = [
      {
        humanTruth: "Consumers value authentic heritage and classic design",
        explanation: "The R 12 G/S represents a return to BMW's roots, appealing to riders who appreciate traditional motorcycle aesthetics and engineering",
        evidence: `"${topTheme}" theme dominates discussions with ${positivePct}% positive sentiment`,
        businessImplication: "Emphasize heritage and classic design in marketing communications to connect with nostalgic consumers"
      }
    ];
    
    if (activeFilters.length > 0) {
      const filterDesc = activeFilters.map(f => f.value).join(", ");
      humanTruths.push({
        humanTruth: "Filtered insights reveal specific consumer segments",
        explanation: "Targeted analysis shows distinct patterns within the selected criteria",
        evidence: `Analysis focused on ${filterDesc} with ${totalQuotes} relevant quotes`,
        businessImplication: "Use these insights for targeted marketing campaigns to specific consumer segments"
      });
    }
    
    return humanTruths;
  }

  /**
   * Generate mock summary based on data
   */
  generateMockSummary(filteredData, activeFilters, section, sentimentBreakdown) {
    const totalQuotes = filteredData.totalQuotes || 0;
    const topTheme = filteredData.topTheme?.name || "General";
    const positivePct = sentimentBreakdown.positive.percentage;
    const neutralPct = sentimentBreakdown.neutral.percentage;
    const negativePct = sentimentBreakdown.negative.percentage;
    
    if (activeFilters.length === 0) {
      return `Analysis of ${totalQuotes} consumer quotes reveals ${positivePct}% positive, ${neutralPct}% neutral, and ${negativePct}% negative sentiment, with "${topTheme}" being the most discussed theme. This comprehensive view shows overall consumer perception of the R 12 G/S.`;
    }
    
    const filterDesc = activeFilters.map(f => f.value).join(", ");
    return `Filtered analysis of ${totalQuotes} quotes (${filterDesc}) shows ${positivePct}% positive, ${neutralPct}% neutral, and ${negativePct}% negative sentiment with "${topTheme}" as the primary theme. This focused view reveals specific consumer insights for the selected criteria and should not be interpreted as overall consumer sentiment.`;
  }



  /**
   * Generate mock recommendations based on data
   */
  generateMockRecommendations(filteredData, activeFilters, section, sentimentBreakdown) {
    const recommendations = [];
    const topTheme = filteredData.topTheme?.name || "General";
    const positivePct = sentimentBreakdown.positive.percentage;
    const neutralPct = sentimentBreakdown.neutral.percentage;
    const negativePct = sentimentBreakdown.negative.percentage;
    
    if (positivePct > 50) {
      recommendations.push("Leverage strong positive sentiment by highlighting successful features in marketing campaigns");
      recommendations.push("Expand on themes that resonate well with consumers");
    } else if (negativePct > 40) {
      recommendations.push("Address consumer concerns identified in negative sentiment areas");
      recommendations.push("Develop targeted improvements based on feedback themes");
    } else if (neutralPct > 50) {
      recommendations.push("Conduct deeper analysis to understand mixed consumer reactions");
      recommendations.push("Focus on improving areas with neutral sentiment");
    } else {
      recommendations.push("Develop balanced strategies addressing both positive and negative feedback");
      recommendations.push("Focus on converting neutral sentiment to positive through targeted improvements");
    }
    
    recommendations.push(`Prioritize "${topTheme}" related improvements based on high discussion volume`);
    
    return recommendations;
  }

  /**
   * Generate mock highlights based on data
   */
  generateMockHighlights(filteredData, activeFilters, section, sentimentBreakdown) {
    const topTheme = filteredData.topTheme?.name || "Performance";
    const quotes = filteredData.quotes || [];
    const positivePct = sentimentBreakdown.positive.percentage;
    const neutralPct = sentimentBreakdown.neutral.percentage;
    const negativePct = sentimentBreakdown.negative.percentage;
    
    let sentimentTrend = "Neutral";
    if (positivePct > 50) sentimentTrend = "Positive";
    else if (negativePct > 40) sentimentTrend = "Negative";
    
    // Find a meaningful sample quote - prefer positive quotes if available, otherwise use the first one
    let criticalQuote = "No quotes available";
    if (quotes.length > 0) {
      if (positivePct > 0) {
        const positiveQuote = quotes.find(q => q.sentiment === 'Positive');
        if (positiveQuote) {
          criticalQuote = positiveQuote.text;
        } else {
          criticalQuote = quotes[0].text;
        }
      } else {
        criticalQuote = quotes[0].text;
      }
    }
    
    return {
      emergingTheme: topTheme,
      sentimentDriver: sentimentTrend,
      criticalQuote: criticalQuote
    };
  }

  /**
   * Describe active filters in human-readable format
   */
  describeActiveFilters(filters) {
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
  generateDataStatistics(data) {
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
   * Format quote sample for display
   */
  formatQuoteSample(quotes) {
    if (!quotes || quotes.length === 0) return "No quotes available";
    
    return quotes.slice(0, 3).map(q => 
      `"${q.text}" (${q.sentiment}, ${q.theme})`
    ).join('\n');
  }

  /**
   * Format sentiment data for display
   */
  formatSentimentData(sentimentData) {
    if (!sentimentData || sentimentData.length === 0) return "No sentiment data available";
    
    return sentimentData.map(item => 
      `${item.name}: ${item.value}%`
    ).join(', ');
  }

  /**
   * Format theme data for display
   */
  formatThemeData(themeData) {
    if (!themeData || themeData.length === 0) return "No theme data available";
    
    return themeData.map(item => 
      `${item.subject}: ${item.value}%`
    ).join(', ');
  }

  /**
   * Get error response structure
   */
  getErrorResponse() {
    return {
      success: false,
      insights: {
        filterContext: "Error occurred during analysis",
        summary: "Unable to generate insights due to technical issues",
        keyFindings: ["Analysis failed", "Please try again"],
        recommendations: ["Check your connection", "Contact support if issue persists"],
        dataHighlights: {
          strongestTheme: "Unknown",
          sentimentTrend: "Unknown",
          criticalQuote: "Unable to analyze"
        }
      }
    };
  }
}

// Create and export singleton instance
const aiInsightsService = new AIInsightsService();

// Export both singleton and class for flexibility
export { aiInsightsService as default, AIInsightsService };