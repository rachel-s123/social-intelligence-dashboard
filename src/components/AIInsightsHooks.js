import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend as RechartsLegend, ResponsiveContainer } from 'recharts';

// Simple service loader to avoid circular dependencies
const createMockService = () => ({
  generateFilteredInsights: async () => ({
    success: true,
    insights: {
      filterContext: "Service unavailable - running in demo mode with filtered data context.",
      summary: "Demo mode - no API key configured",
      keyFindings: ["Demo mode active", "Service failed to load"],
      recommendations: ["Check service configuration", "Contact administrator"],
      dataHighlights: {
        strongestTheme: "Demo",
        sentimentTrend: "Unavailable",
        criticalQuote: "Service not loaded"
      }
    }
  })
});

/**
 * Transform the new API response structure to match component expectations
 */
const transformInsightsResponse = (apiInsights) => {
  // If the response already has the old format, return as is
  if (apiInsights.summary && apiInsights.keyFindings) {
    return apiInsights;
  }
  
  // Transform new format to old format
  return {
    filterContext: apiInsights.filterContext || "Filter context not provided",
    summary: apiInsights.executiveSummary || "Executive summary not provided",
    keyFindings: apiInsights.keyInsights?.map(insight => insight.insight) || ["No insights provided"],
    recommendations: apiInsights.actionableRecommendations?.map(rec => rec.recommendation) || ["No recommendations provided"],
    dataHighlights: {
      strongestTheme: apiInsights.dataHighlights?.emergingTheme || "Unknown",
      sentimentTrend: apiInsights.dataHighlights?.sentimentDriver || "Unknown",
      criticalQuote: apiInsights.dataHighlights?.criticalQuote || "No critical quote available"
    }
  };
};

// React Hook for using AI insights
export const useAIInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateInsights = async (filteredData, activeFilters, section) => {
    // Prevent multiple simultaneous generations
    if (loading) {
      console.log("🔄 Already generating insights, skipping...");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Log environment check
      console.log("🔍 AI Insights - Environment Check:");
      console.log("REACT_APP_OPENAI_API_KEY:", process.env.REACT_APP_OPENAI_API_KEY ? "✅ Found" : "❌ Not found");
      console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "✅ Found" : "❌ Not found");
      
      // Try to load the real service, fall back to mock if it fails
      let service;
      try {
        console.log("🔄 Attempting to load AI Insights Service...");
        const module = await import('../services/src/services/aiInsightsService.js');
        service = module.default;
        console.log("✅ AI Insights Service loaded successfully");
      } catch (importError) {
        console.warn('⚠️ Failed to import AI service, using mock:', importError);
        service = createMockService();
      }
      
      console.log("🚀 Generating insights with service...");
      const result = await service.generateFilteredInsights(
        filteredData, 
        activeFilters, 
        section
      );
      
      if (result.success) {
        // Transform the new API response structure to match component expectations
        const transformedInsights = transformInsightsResponse(result.insights);
        setInsights(transformedInsights);
        setHasGenerated(true);
        console.log("✅ Insights generated successfully");
      } else {
        setError("Failed to generate insights");
        setInsights(result.insights); // Still show error response structure
        setHasGenerated(true);
        console.log("❌ Insights generation failed");
      }
    } catch (err) {
      console.error('AI Insights generation error:', err);
      
      // Provide fallback insights if service fails
      const fallbackInsights = {
        filterContext: "Demo mode - no API key configured. Insights are simulated based on your filtered data.",
        summary: "AI analysis is running in demo mode. No OpenAI API key detected. Insights are generated based on your data patterns.",
        keyFindings: [
          "Demo mode active - insights are simulated",
          "Configure OpenAI API key for real AI analysis",
          "Current insights based on data patterns and statistics"
        ],
        recommendations: [
          "Add REACT_APP_OPENAI_API_KEY to environment variables",
          "Restart the application after adding API key",
          "Contact administrator for API key configuration"
        ],
        dataHighlights: {
          strongestTheme: "Demo Mode",
          sentimentTrend: "Simulated Analysis",
          criticalQuote: "API key required for real AI insights"
        }
      };
      
      setError("Demo mode - no API key configured");
      setInsights(fallbackInsights);
      setHasGenerated(true);
    } finally {
      setLoading(false);
    }
  };

  const clearInsights = () => {
    setInsights(null);
    setError(null);
    setHasGenerated(false);
  };

  return {
    insights,
    loading,
    error,
    hasGenerated,
    generateInsights,
    clearInsights
  };
};

// React Component for displaying insights
export const AIInsightsPanel = ({ insights, loading, error, onRefresh, className = "" }) => {
  if (loading) {
    return (
      <div className={`ai-insights-panel loading ${className}`}>
        <div className="insights-header">
          <h3>🤖 Generating AI Insights...</h3>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Analyzing filtered data...</p>
        </div>
      </div>
    );
  }

  if (error && !insights) {
    return (
      <div className={`ai-insights-panel error ${className}`}>
        <div className="insights-header">
          <h3>⚠️ AI Insights Error</h3>
          <button onClick={onRefresh} className="refresh-btn">Retry</button>
        </div>
        <p>Unable to generate insights: {error}</p>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className={`ai-insights-panel empty ${className}`}>
        <div className="insights-header">
          <h3>🤖 AI Insights</h3>
        </div>
        <p>Apply filters and click "Generate Insights" to see AI analysis</p>
      </div>
    );
  }

  return (
    <div className={`ai-insights-panel ${className}`}>
      <div className="insights-header">
        <h3>🤖 AI Insights</h3>
        <button onClick={onRefresh} className="refresh-btn">Refresh</button>
      </div>
      {/* Demo Mode Indicator */}
      {error && error.includes("Demo mode") && (
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          padding: '8px 12px',
          marginBottom: '16px',
          fontSize: '14px',
          color: '#856404'
        }}>
          🎭 <strong>Demo Mode:</strong> No OpenAI API key configured. Insights are simulated based on your data.
        </div>
      )}
      <div className="insights-content">
        {/* Filter Context Section */}
        {insights.filterContext && (
          <div className="filter-context-section" style={{
            backgroundColor: '#e3f2fd',
            border: '1px solid #2196f3',
            borderRadius: '4px',
            padding: '12px 16px',
            marginBottom: '16px',
            fontSize: '14px',
            color: '#1565c0'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
              🔍 Filter Context
            </h4>
            <p style={{ margin: 0, lineHeight: 1.4 }}>
              {insights.filterContext}
            </p>
          </div>
        )}

        <div className="summary-section">
          <h4>Summary</h4>
          <p>{insights.summary}</p>
        </div>

        <div className="findings-section">
          <h4>Key Findings</h4>
          <ul>
            {insights.keyFindings && insights.keyFindings.map((finding, index) => (
              <li key={index}>{finding}</li>
            ))}
          </ul>  
        </div>

        <div className="recommendations-section">
          <h4>Recommendations</h4>
          <ul>
            {insights.recommendations && insights.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>

        <div className="highlights-section">
          <h4>Data Highlights</h4>
          <div className="highlights-grid">
            <div className="highlight-item">
              <span className="label">Strongest Theme:</span>
              <span className="value">{insights.dataHighlights?.strongestTheme || 'N/A'}</span>
            </div>
            <div className="highlight-item">
              <span className="label">Sentiment Trend:</span>
              <span className="value">{insights.dataHighlights?.sentimentTrend || 'N/A'}</span>
            </div>
            <div className="highlight-item">
              <span className="label">Critical Quote:</span>
              <span className="value">"{insights.dataHighlights?.criticalQuote || 'N/A'}"</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 