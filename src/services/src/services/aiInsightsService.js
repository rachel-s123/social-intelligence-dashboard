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
   * @returns {Promise<Object>} - Structured insights object
   */
  async generateFilteredInsights(filteredData, activeFilters, section) {
    try {
      console.log("🚀 Calling server-side insights API...");
      
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filteredData,
          activeFilters,
          section
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log("✅ Insights generated successfully via server API");
        return result;
      } else {
        throw new Error(result.error || "Failed to generate insights");
      }
    } catch (error) {
      console.error("AI Insights API error:", error);
      
      // Fallback to mock insights if server call fails
      console.log("Server API failed, falling back to mock insights");
      return {
        success: true,
        insights: this.generateMockInsights(filteredData, activeFilters, section)
      };
    }
  }

  /**
   * Generate mock insights for fallback scenarios
   */
  generateMockInsights(filteredData, activeFilters, section) {
    const filterDescription = this.describeActiveFilters(activeFilters);
    const dataStats = this.generateDataStatistics(filteredData);
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
    // Generate contextual mock insights based on the data
    const mockInsights = {
      filterContext: `Analysis based on filtered data: ${filterDescription}. This represents a subset of consumer feedback, not the complete dataset.`,
      summary: this.generateMockSummary(filteredData, activeFilters, section),
      sentimentBreakdown,
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
    return `Filtered analysis of ${totalQuotes} quotes (${filterDesc}) shows ${avgSentiment}/5.0 average sentiment with "${topTheme}" as the primary theme. This focused view reveals specific consumer insights for the selected criteria and should not be interpreted as overall consumer sentiment.`;
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
    
    const criticalQuote = quotes.length > 0 ? quotes[0].text : "No quotes available";
    
    return {
      strongestTheme: topTheme,
      sentimentTrend: sentimentTrend,
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
    const avgSentiment = data.averageSentiment || 0;
    const topTheme = data.topTheme?.name || "N/A";
    const topThemePercentage = data.topTheme?.percentage || 0;
    
    return `Total Quotes: ${totalQuotes}
Average Sentiment: ${avgSentiment}/5.0 (1=very negative, 5=very positive)
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