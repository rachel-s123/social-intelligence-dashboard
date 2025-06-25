import React, { useState } from 'react';

// React Hook for using AI insights
export const useAIInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateInsights = async (filteredData, activeFilters, section) => {
    setLoading(true);
    setError(null);
    
    try {
      // Dynamic import to avoid circular dependency
      const { aiInsightsService } = await import('../services/src/services/aiInsightsService');
      
      const result = await aiInsightsService.generateFilteredInsights(
        filteredData, 
        activeFilters, 
        section
      );
      
      if (result.success) {
        setInsights(result.insights);
      } else {
        setError("Failed to generate insights");
        setInsights(result.insights); // Still show error response structure
      }
    } catch (err) {
      console.error('AI Insights generation error:', err);
      
      // Provide fallback insights if service fails
      const fallbackInsights = {
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
    } finally {
      setLoading(false);
    }
  };

  const clearInsights = () => {
    setInsights(null);
    setError(null);
  };

  return {
    insights,
    loading,
    error,
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
        <div className="summary-section">
          <h4>Summary</h4>
          <p>{insights.summary}</p>
        </div>

        <div className="findings-section">
          <h4>Key Findings</h4>
          <ul>
            {insights.keyFindings.map((finding, index) => (
              <li key={index}>{finding}</li>
            ))}
          </ul>  
        </div>

        <div className="recommendations-section">
          <h4>Recommendations</h4>
          <ul>
            {insights.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>

        <div className="highlights-section">
          <h4>Data Highlights</h4>
          <div className="highlights-grid">
            <div className="highlight-item">
              <span className="label">Strongest Theme:</span>
              <span className="value">{insights.dataHighlights.strongestTheme}</span>
            </div>
            <div className="highlight-item">
              <span className="label">Sentiment Trend:</span>
              <span className="value">{insights.dataHighlights.sentimentTrend}</span>
            </div>
            <div className="highlight-item">
              <span className="label">Critical Quote:</span>
              <span className="value">"{insights.dataHighlights.criticalQuote}"</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 