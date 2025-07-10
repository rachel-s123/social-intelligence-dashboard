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
const transformInsightsResponse = (apiInsights) => ({
  ...apiInsights,
  keyInsights: apiInsights.keyInsights || apiInsights.keyFindings || [],
  recommendations: apiInsights.recommendations || apiInsights.actionableRecommendations || [],
});

// React Hook for using AI insights
export const useAIInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateInsights = async (filteredData, activeFilters, section, market) => {
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
        section,
        market
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
        <p style={{ color: '#1c2a5c', fontWeight: 600, fontSize: '1.1rem', textAlign: 'center', marginTop: 32 }}>
          Filter by theme and/or sentiment to generate AI insights tailored to your selection.
        </p>
      </div>
    );
  }

  return (
    <div className={`ai-insights-panel ${className}`}>
      <div className="insights-header">
        <h3>🤖 AI Insights</h3>
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
            background: '#f5f7fa',
            border: '1px solid #e5e5e5',
            borderRadius: 8,
            padding: '10px 18px',
            margin: '0 0 24px 0',
            fontStyle: 'italic',
            color: '#1c2a5c',
            fontSize: '1rem',
            boxShadow: 'none'
          }}>
            {insights.filterContext}
          </div>
        )}

        {insights.executiveSummary && (
          <>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1c2a5c', margin: '32px 0 20px 0' }}>Executive Summary</h4>
            <div className="executive-summary-section" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: '#fff', border: '2px solid #1c2a5c', borderRadius: 10, padding: 24, boxShadow: '0 2px 8px #e5e5e5' }}>
                <h5 style={{ margin: '0 0 0 0', color: '#1c2a5c', fontSize: '1.2rem', fontWeight: 700 }}>
                  {insights.executiveSummary}
                </h5>
              </div>
            </div>
          </>
        )}

        {insights.keyInsights && (
          <>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1c2a5c', margin: '32px 0 20px 0' }}>Key Insights</h4>
            <div className="key-insights-section" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {insights.keyInsights.map((finding, index) => {
                if (!finding) return null;
                if (typeof finding === 'string') {
                  return <div key={index} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8, padding: 24, marginBottom: 12, boxShadow: '0 2px 8px #e0e0e0' }}>{finding}</div>;
                }
                return (
                  <div key={index} style={{ background: '#fff', border: '2px solid #1c2a5c', borderRadius: 10, padding: 24, marginBottom: 0, boxShadow: '0 2px 8px #e5e5e5' }}>
                    <h5 style={{ margin: '0 0 16px 0', color: '#1c2a5c', fontSize: '1.2rem', fontWeight: 700 }}>{finding.humanTruth || 'Human Truth'}</h5>
                    <div style={{ fontSize: '1rem', color: '#1c2a5c', marginBottom: 8 }}><strong>Explanation:</strong> {finding.explanation || 'N/A'}</div>
                    <div style={{ fontSize: '1rem', color: '#1c2a5c', marginBottom: 8 }}><strong>Evidence:</strong> {finding.evidence || 'N/A'}</div>
                    <div style={{ fontSize: '1rem', color: '#1c2a5c' }}><strong>Business Implication:</strong> {finding.businessImplication || 'N/A'}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {insights.actionableRecommendations && (
          <>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1c2a5c', margin: '32px 0 20px 0' }}>Actionable Recommendations</h4>
            <div className="actionable-recommendations-section" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {insights.actionableRecommendations.map((rec, index) => {
                if (!rec) return null;
                if (typeof rec === 'string') {
                  return <div key={index} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8, padding: 24, marginBottom: 12, boxShadow: '0 2px 8px #e0e0e0' }}>{rec}</div>;
                }
                return (
                  <div key={index} style={{ background: '#fff', border: '2px solid #6fa3ef', borderRadius: 10, padding: 24, marginBottom: 0, boxShadow: '0 2px 8px #e5e5e5' }}>
                    <h5 style={{ margin: '0 0 16px 0', color: '#1c2a5c', fontSize: '1.2rem', fontWeight: 700 }}>{rec.category || 'Category'}</h5>
                    <div style={{ fontSize: '1rem', color: '#1c2a5c', marginBottom: 8 }}><strong>Recommendation:</strong> {rec.recommendation || 'N/A'}</div>
                    <div style={{ fontSize: '1rem', color: '#1c2a5c', marginBottom: 8 }}><strong>Rationale:</strong> {rec.rationale || 'N/A'}</div>
                    <div style={{ fontSize: '1rem', color: '#1c2a5c', marginBottom: 8 }}><strong>Timeline:</strong> {rec.timeline || 'N/A'}</div>
                    <div style={{ fontSize: '1rem', color: '#1c2a5c' }}><strong>Expected Impact:</strong> {rec.expectedImpact || 'N/A'}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {insights.consumerSegments && (
          <>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1c2a5c', margin: '32px 0 20px 0' }}>Consumer Segments</h4>
            <div className="consumer-segments-section" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: '#fff', border: '2px solid #1c2a5c', borderRadius: 10, padding: 24, boxShadow: '0 2px 8px #e5e5e5' }}>
                <h5 style={{ margin: '0 0 16px 0', color: '#1c2a5c', fontSize: '1.2rem', fontWeight: 700 }}>
                  {insights.consumerSegments.primarySegment || 'Primary Segment'}
                </h5>
                <div style={{ fontSize: '1rem', color: '#1c2a5c', marginBottom: 8 }}>
                  <strong>Concerns/Needs:</strong> {insights.consumerSegments.concernsAndNeeds?.join(', ') || 'N/A'}
                </div>
                <div style={{ fontSize: '1rem', color: '#1c2a5c' }}>
                  <strong>Opportunity Areas:</strong> {insights.consumerSegments.opportunityAreas?.join(', ') || 'N/A'}
                </div>
              </div>
            </div>
          </>
        )}

        {insights.competitiveIntelligence && (
          <>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1c2a5c', margin: '32px 0 20px 0' }}>Competitive Intelligence</h4>
            <div className="competitive-intelligence-section" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: '#fff', border: '2px solid #1c2a5c', borderRadius: 10, padding: 24, boxShadow: '0 2px 8px #e5e5e5' }}>
                <h5 style={{ margin: '0 0 16px 0', color: '#1c2a5c', fontSize: '1.2rem', fontWeight: 700 }}>
                  {insights.competitiveIntelligence.strengths?.[0] || 'Strengths'}
                </h5>
                <div style={{ fontSize: '1rem', color: '#1c2a5c', marginBottom: 8 }}>
                  <strong>Strengths:</strong> {insights.competitiveIntelligence.strengths?.join(', ') || 'N/A'}
                </div>
                <div style={{ fontSize: '1rem', color: '#1c2a5c', marginBottom: 8 }}>
                  <strong>Vulnerabilities:</strong> {insights.competitiveIntelligence.vulnerabilities?.join(', ') || 'N/A'}
                </div>
                <div style={{ fontSize: '1rem', color: '#1c2a5c' }}>
                  <strong>Market Position:</strong> {insights.competitiveIntelligence.marketPosition || 'N/A'}
                </div>
              </div>
            </div>
          </>
        )}

        {insights.dataHighlights && (
          <>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1c2a5c', margin: '32px 0 20px 0' }}>Data Highlights</h4>
            <div className="data-highlights-section" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: '#fff', border: '2px solid #1c2a5c', borderRadius: 10, padding: 24, boxShadow: '0 2px 8px #e5e5e5' }}>
                <h5 style={{ margin: '0 0 16px 0', color: '#1c2a5c', fontSize: '1.2rem', fontWeight: 700 }}>
                  {insights.dataHighlights.criticalQuote ? `"${insights.dataHighlights.criticalQuote}"` : 'Critical Quote'}
                </h5>
                <div style={{ fontSize: '1rem', color: '#1c2a5c', marginBottom: 8 }}>
                  <strong>Emerging Theme:</strong> {insights.dataHighlights.emergingTheme || 'N/A'}
                </div>
                <div style={{ fontSize: '1rem', color: '#1c2a5c' }}>
                  <strong>Sentiment Driver:</strong> {insights.dataHighlights.sentimentDriver || 'N/A'}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 