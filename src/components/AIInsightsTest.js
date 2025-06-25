import React from 'react';
import { useAIInsights, AIInsightsPanel } from './AIInsightsHooks';
import { Box, Button, Typography, Alert } from '@mui/material';

const AIInsightsTest = () => {
  const { insights, loading, error, generateInsights, clearInsights } = useAIInsights();

  const testData = {
    quotes: [
      {
        text: "The R 12 G/S is an amazing adventure bike!",
        sentiment: "Positive",
        theme: "Performance",
        platform: "Instagram"
      },
      {
        text: "Not sure about the price point",
        sentiment: "Neutral", 
        theme: "Pricing",
        platform: "Twitter"
      }
    ],
    totalQuotes: 2,
    averageSentiment: 4.0,
    topTheme: {
      name: "Performance",
      count: 1,
      percentage: 50
    },
    timeRange: {
      start: 1,
      end: 4
    }
  };

  const testFilters = [
    { type: 'sentiment', value: 'Positive' }
  ];

  const handleTest = () => {
    generateInsights(testData, testFilters, 'test');
  };

  // Check API key status
  const apiKeyStatus = {
    hasApiKey: !!(process.env.REACT_APP_OPENAI_API_KEY || process.env.OPENAI_API_KEY),
    keyLength: (process.env.REACT_APP_OPENAI_API_KEY || process.env.OPENAI_API_KEY)?.length || 0,
    keyPrefix: (process.env.REACT_APP_OPENAI_API_KEY || process.env.OPENAI_API_KEY)?.substring(0, 10) + "..." || "none"
  };

  const testApiKeyDetection = () => {
    console.log("🔍 Testing API Key Detection in Browser:");
    console.log("REACT_APP_OPENAI_API_KEY:", process.env.REACT_APP_OPENAI_API_KEY ? "✅ Found" : "❌ Not found");
    console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "✅ Found" : "❌ Not found");
    console.log("Any API Key:", (process.env.REACT_APP_OPENAI_API_KEY || process.env.OPENAI_API_KEY) ? "✅ Found" : "❌ Not found");
    
    if (process.env.REACT_APP_OPENAI_API_KEY) {
      console.log("React App Key Length:", process.env.REACT_APP_OPENAI_API_KEY.length);
      console.log("React App Key Prefix:", process.env.REACT_APP_OPENAI_API_KEY.substring(0, 10) + "...");
    }
    
    if (process.env.OPENAI_API_KEY) {
      console.log("Regular Key Length:", process.env.OPENAI_API_KEY.length);
      console.log("Regular Key Prefix:", process.env.OPENAI_API_KEY.substring(0, 10) + "...");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        AI Insights Test
      </Typography>

      {/* API Key Status */}
      <Alert 
        severity={apiKeyStatus.hasApiKey ? "success" : "warning"} 
        sx={{ mb: 3 }}
      >
        <Typography variant="h6">API Key Status:</Typography>
        <Typography>Has API Key: {apiKeyStatus.hasApiKey ? "✅ Yes" : "❌ No"}</Typography>
        <Typography>Key Length: {apiKeyStatus.keyLength}</Typography>
        <Typography>Key Prefix: {apiKeyStatus.keyPrefix}</Typography>
        {!apiKeyStatus.hasApiKey && (
          <Typography sx={{ mt: 1, fontWeight: 'bold' }}>
            Running in demo mode. Add OPENAI_API_KEY to .env file for real AI insights.
          </Typography>
        )}
      </Alert>
      
      <Box sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={handleTest}
          disabled={loading}
          sx={{ mr: 2 }}
        >
          {loading ? 'Testing...' : 'Test AI Insights'}
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={clearInsights}
          sx={{ mr: 2 }}
        >
          Clear Insights
        </Button>

        <Button 
          variant="outlined" 
          onClick={testApiKeyDetection}
          sx={{ mr: 2 }}
        >
          Test API Key Detection
        </Button>
      </Box>

      <AIInsightsPanel
        insights={insights}
        loading={loading}
        error={error}
        onRefresh={handleTest}
        className="test-panel"
      />

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">Test Data:</Typography>
        <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(testData, null, 2)}
        </pre>
      </Box>
    </Box>
  );
};

export default AIInsightsTest; 