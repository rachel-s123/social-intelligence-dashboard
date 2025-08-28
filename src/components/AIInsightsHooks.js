import React, { useState } from 'react';
import { 
  TrendingUp, 
  Lightbulb, 
  Assessment, 
  Campaign, 
  Group, 
  FormatQuote,
  Timeline,
  CheckCircle,
  Warning,
  Info,
  Star,
  Business,
  Analytics
} from '@mui/icons-material';

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
  // Ensure we have a valid insights object
  if (!apiInsights || typeof apiInsights !== 'object') {
    console.error("❌ Invalid insights data received:", apiInsights);
    return {
      filterContext: "Invalid insights data received",
      executiveSummary: "Data format error - please retry",
      keyInsights: [],
      recommendations: [],
      consumerSegments: { primarySegment: "Error", concernsAndNeeds: [], opportunityAreas: [] },
      competitiveIntelligence: { bmwStrengths: [], vulnerabilities: [], marketPosition: "Error" },
      dataHighlights: { criticalQuote: "Error", emergingTheme: "Error", sentimentDriver: "Error" }
    };
  }
  
  // Transform and validate the response structure
  const transformed = {
    ...apiInsights,
    // Handle both old and new insight structures
    keyInsights: apiInsights.humanTruths || apiInsights.keyInsights || apiInsights.keyFindings || [],
    recommendations: apiInsights.recommendations || apiInsights.actionableRecommendations || [],
    // Ensure all required fields exist with fallbacks
    filterContext: apiInsights.filterContext || "Analysis context not provided",
    executiveSummary: apiInsights.executiveSummary || "Summary not available",
    consumerSegments: apiInsights.consumerSegments || { primarySegment: "Unknown", concernsAndNeeds: [], opportunityAreas: [] },
    competitiveIntelligence: apiInsights.competitiveIntelligence || { bmwStrengths: [], vulnerabilities: [], marketPosition: "Unknown" },
    dataHighlights: apiInsights.dataHighlights || { criticalQuote: "Not available", emergingTheme: "Not available", sentimentDriver: "Not available" }
  };
  
  console.log("✅ Insights transformed successfully:", transformed);
  return transformed;
};

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
        
        // Check if this was a fallback response
        if (result.fallback) {
          console.warn("⚠️ Insights generated from fallback due to:", result.error);
        }
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
        executiveSummary: "AI analysis is running in demo mode. No OpenAI API key detected. Insights are generated based on your data patterns.",
        humanTruths: [
          {
            humanTruth: "Demo mode active - insights are simulated",
            explanation: "System is running without AI capabilities",
            evidence: "No OpenAI API key configured",
            businessImplication: "Configure API key for real AI insights"
          }
        ],
        recommendations: [
          "Add REACT_APP_OPENAI_API_KEY to environment variables",
          "Restart the application after adding API key",
          "Contact administrator for API key configuration"
        ],
        dataHighlights: {
          emergingTheme: "Demo Mode",
          sentimentDriver: "Simulated Analysis",
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
        <p style={{ color: '#1c2a5c', fontWeight: 600, fontSize: '1rem', textAlign: 'center', marginTop: 16 }}>
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
          borderRadius: '8px',
          padding: '8px 12px',
          marginBottom: '16px',
          fontSize: '12px',
          color: '#856404',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Info fontSize="small" />
          <strong>Demo Mode:</strong> No OpenAI API key configured. Insights are simulated based on your data.
        </div>
      )}

      <div className="insights-content">
        {/* Filter Context Section */}
        {insights.filterContext && (
          <div className="filter-context-section" style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            border: '1px solid #0ea5e9',
            borderRadius: '8px',
            padding: '12px 16px',
            margin: '0 0 20px 0',
            fontStyle: 'italic',
            color: '#0c4a6e',
            fontSize: '0.9rem',
            boxShadow: '0 2px 4px rgba(14, 165, 233, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Assessment fontSize="small" />
            {insights.filterContext}
          </div>
        )}

        {/* DATA HIGHLIGHTS - MOVED TO TOP */}
        {insights.dataHighlights && (
          <>
            <h4 style={{ 
              fontSize: '1.3rem', 
              fontWeight: 700, 
              color: '#1c2a5c', 
              margin: '0 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <TrendingUp style={{ color: '#10b981' }} />
              Data Highlights
            </h4>
            
            <div className="data-highlights-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '16px',
              marginBottom: '24px'
            }}>
              {/* Critical Quote Box */}
              {insights.dataHighlights.criticalQuote && (
                <div style={{ 
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  border: '2px solid #f59e0b',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                                      <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      fontSize: '24px',
                      opacity: '0.3'
                    }}>
                      <FormatQuote />
                    </div>
                  <div style={{
                    fontSize: '1.1rem',
                    color: '#92400e',
                    fontWeight: '600',
                    fontStyle: 'italic',
                    lineHeight: '1.4',
                    marginBottom: '8px'
                  }}>
                    "{insights.dataHighlights.criticalQuote}"
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#92400e',
                    opacity: '0.8',
                    textAlign: 'right'
                  }}>
                    Critical Quote
                  </div>
                </div>
              )}

              {/* Emerging Theme */}
              {insights.dataHighlights.emergingTheme && (
                <div style={{ 
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                  border: '2px solid #10b981',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  <TrendingUp style={{ fontSize: '32px', color: '#10b981', marginBottom: '8px' }} />
                  <div style={{
                    fontSize: '1.2rem',
                    color: '#065f46',
                    fontWeight: '700',
                    marginBottom: '4px'
                  }}>
                    {insights.dataHighlights.emergingTheme}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#065f46',
                    opacity: '0.8'
                  }}>
                    Emerging Theme
                  </div>
                </div>
              )}

              {/* Sentiment Driver */}
              {insights.dataHighlights.sentimentDriver && (
                <div style={{ 
                  background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
                  border: '2px solid #ef4444',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  <Analytics style={{ fontSize: '32px', color: '#ef4444', marginBottom: '8px' }} />
                  <div style={{
                    fontSize: '1.1rem',
                    color: '#991b1b',
                    fontWeight: '600',
                    marginBottom: '4px',
                    textAlign: 'center'
                  }}>
                    {insights.dataHighlights.sentimentDriver}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#991b1b',
                    opacity: '0.8'
                  }}>
                    Sentiment Driver
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Executive Summary */}
        {insights.executiveSummary && (
          <>
            <h4 style={{ 
              fontSize: '1.3rem', 
              fontWeight: 700, 
              color: '#1c2a5c', 
              margin: '24px 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Lightbulb style={{ color: '#f59e0b' }} />
              Executive Summary
            </h4>
            <div className="executive-summary-section" style={{ marginBottom: '24px' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                border: '2px solid #f59e0b',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  fontSize: '20px',
                  opacity: '0.3'
                }}>
                  <Lightbulb />
                </div>
                <h5 style={{ 
                  margin: '0 0 0 0', 
                  color: '#92400e', 
                  fontSize: '1.1rem', 
                  fontWeight: '600',
                  lineHeight: '1.5'
                }}>
                  {insights.executiveSummary}
                </h5>
              </div>
            </div>
          </>
        )}

        {/* Key Insights */}
        {insights.keyInsights && (
          <>
            <h4 style={{ 
              fontSize: '1.3rem', 
              fontWeight: 700, 
              color: '#1c2a5c', 
              margin: '24px 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Analytics style={{ color: '#8b5cf6' }} />
              Human Truths & Insights
            </h4>
            <div className="key-insights-section" style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              {insights.keyInsights.map((finding, index) => {
                if (!finding) return null;
                if (typeof finding === 'string') {
                  return (
                    <div key={index} style={{ 
                      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                      border: '2px solid #8b5cf6',
                      borderRadius: '12px',
                      padding: '20px',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        fontSize: '20px',
                        color: '#8b5cf6',
                        opacity: '0.3'
                      }}>
                        <Analytics />
                      </div>
                      <div style={{ fontSize: '1rem', color: '#1c2a5c', lineHeight: '1.5' }}>{finding}</div>
                    </div>
                  );
                }
                return (
                  <div key={index} style={{ 
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    border: '2px solid #8b5cf6',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      fontSize: '20px',
                      color: '#8b5cf6',
                      opacity: '0.3'
                    }}>
                      <Analytics />
                    </div>
                    <h5 style={{ 
                      margin: '0 0 12px 0', 
                      color: '#1c2a5c', 
                      fontSize: '1.1rem', 
                      fontWeight: '700',
                      lineHeight: '1.4'
                    }}>
                      {finding.humanTruth || 'Human Truth'}
                    </h5>
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: '#1c2a5c', 
                      marginBottom: '8px',
                      lineHeight: '1.4'
                    }}>
                      <strong>Why it matters:</strong> {finding.explanation || 'N/A'}
                    </div>
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: '#1c2a5c', 
                      marginBottom: '8px',
                      lineHeight: '1.4'
                    }}>
                      <strong>Evidence:</strong> {finding.evidence || 'N/A'}
                    </div>
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: '#1c2a5c',
                      lineHeight: '1.4'
                    }}>
                      <strong>Marketing Impact:</strong> {finding.businessImplication || 'N/A'}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Actionable Recommendations */}
        {insights.actionableRecommendations && (
          <>
            <h4 style={{ 
              fontSize: '1.3rem', 
              fontWeight: 700, 
              color: '#1c2a5c', 
              margin: '24px 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Campaign style={{ color: '#3b82f6' }} />
              Actionable Recommendations
            </h4>
            <div className="actionable-recommendations-section" style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              {insights.actionableRecommendations.map((rec, index) => {
                if (!rec) return null;
                if (typeof rec === 'string') {
                  return (
                    <div key={index} style={{ 
                      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                      border: '2px solid #3b82f6',
                      borderRadius: '12px',
                      padding: '20px',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        fontSize: '20px',
                        color: '#3b82f6',
                        opacity: '0.3'
                      }}>
                        <Campaign />
                      </div>
                      <div style={{ fontSize: '1rem', color: '#1c2a5c', lineHeight: '1.5' }}>{rec}</div>
                    </div>
                  );
                }
                
                // Timeline badge color
                const timelineColor = rec.timeline?.includes('Immediate') ? '#10b981' : 
                                    rec.timeline?.includes('Short-term') ? '#f59e0b' : '#8b5cf6';
                
                return (
                  <div key={index} style={{ 
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    border: '2px solid #3b82f6',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      fontSize: '20px',
                      color: '#3b82f6',
                      opacity: '0.3'
                    }}>
                      <Campaign />
                    </div>
                    
                    <h5 style={{ 
                      margin: '0 0 12px 0', 
                      color: '#1c2a5c', 
                      fontSize: '1.1rem', 
                      fontWeight: '700',
                      lineHeight: '1.4'
                    }}>
                      {rec.recommendation || 'Recommendation'}
                    </h5>
                    
                    {/* Timeline Badge */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: timelineColor,
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      marginBottom: '12px'
                    }}>
                      <Timeline fontSize="small" />
                      {rec.timeline || 'N/A'}
                    </div>
                    
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: '#64748b', 
                      marginBottom: '8px', 
                      fontStyle: 'italic',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      <strong>{rec.category || 'N/A'}</strong>
                    </div>
                    
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: '#1c2a5c', 
                      marginBottom: '8px',
                      lineHeight: '1.4'
                    }}>
                      <strong>Why this works:</strong> {rec.rationale || 'N/A'}
                    </div>
                    
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: '#1c2a5c',
                      lineHeight: '1.4'
                    }}>
                      <strong>Expected Outcome:</strong> {rec.expectedImpact || 'N/A'}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Consumer Segments */}
        {insights.consumerSegments && (
          <>
            <h4 style={{ 
              fontSize: '1.3rem', 
              fontWeight: 700, 
              color: '#1c2a5c', 
              margin: '24px 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Group style={{ color: '#ec4899' }} />
              Consumer Segments
            </h4>
            <div className="consumer-segments-section" style={{ marginBottom: '24px' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
                border: '2px solid #ec4899',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.15)',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  fontSize: '24px',
                  color: '#ec4899',
                  opacity: '0.3'
                }}>
                  <Group />
                </div>
                
                <h5 style={{ 
                  margin: '0 0 16px 0', 
                  color: '#1c2a5c', 
                  fontSize: '1.2rem', 
                  fontWeight: '700',
                  lineHeight: '1.4'
                }}>
                  {insights.consumerSegments.primarySegment || 'Primary Segment'}
                </h5>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '8px',
                      color: '#be185d',
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}>
                      <Warning fontSize="small" />
                      Concerns & Needs
                    </div>
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: '#1c2a5c',
                      lineHeight: '1.4'
                    }}>
                      {insights.consumerSegments.concernsAndNeeds?.join(', ') || 'N/A'}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '8px',
                      color: '#be185d',
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}>
                      <CheckCircle fontSize="small" />
                      Opportunity Areas
                    </div>
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: '#1c2a5c',
                      lineHeight: '1.4'
                    }}>
                      {insights.consumerSegments.opportunityAreas?.join(', ') || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Competitive Intelligence */}
        {insights.competitiveIntelligence && (
          <>
            <h4 style={{ 
              fontSize: '1.3rem', 
              fontWeight: 700, 
              color: '#1c2a5c', 
              margin: '24px 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Star style={{ color: '#f59e0b' }} />
              Competitive Intelligence
            </h4>
            <div className="competitive-intelligence-section" style={{ marginBottom: '24px' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                border: '2px solid #f59e0b',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  fontSize: '24px',
                  color: '#f59e0b',
                  opacity: '0.3'
                }}>
                  <Star />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '8px',
                      color: '#92400e',
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}>
                      <CheckCircle fontSize="small" />
                      BMW Strengths
                    </div>
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: '#1c2a5c',
                      lineHeight: '1.4'
                    }}>
                      {insights.competitiveIntelligence.bmwStrengths?.join(', ') || 'N/A'}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '8px',
                      color: '#92400e',
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}>
                      <Warning fontSize="small" />
                      Vulnerabilities
                    </div>
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: '#1c2a5c',
                      lineHeight: '1.4'
                    }}>
                      {insights.competitiveIntelligence.vulnerabilities?.join(', ') || 'N/A'}
                    </div>
                  </div>
                </div>
                
                <div style={{ 
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '8px',
                    color: '#92400e',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}>
                    <Business fontSize="small" />
                    Market Position
                  </div>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: '#1c2a5c',
                    lineHeight: '1.4'
                  }}>
                    {insights.competitiveIntelligence.marketPosition || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 