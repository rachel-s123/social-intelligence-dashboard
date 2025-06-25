import React, { useState, useEffect } from 'react';
import { useAIInsights, AIInsightsPanel } from './AIInsightsHooks';
import { Box, Button, Typography, Paper } from '@mui/material';

const AIInsightsTest = () => {
  const { insights, loading, error, generateInsights, clearInsights } = useAIInsights();
  const [testData, setTestData] = useState(null);

  useEffect(() => {
    // Create test data
    setTestData({
      totalQuotes: 150,
      averageSentiment: 3.8,
      topTheme: { name: "Performance", percentage: 35 },
      quotes: [
        { text: "The R 12 G/S performance is exceptional", sentiment: "Positive", theme: "Performance", platform: "Forum" },
        { text: "Great handling on rough terrain", sentiment: "Positive", theme: "Performance", platform: "Review" }
      ],
      sentimentData: [
        { name: "Positive", value: 60, percentage: 60 },
        { name: "Neutral", value: 25, percentage: 25 },
        { name: "Negative", value: 15, percentage: 15 }
      ],
      themeData: [
        { subject: "Performance", value: 35, percentage: 35 },
        { subject: "Design", value: 25, percentage: 25 },
        { subject: "Technology", value: 20, percentage: 20 }
      ]
    });
  }, []);

  const handleTest = async () => {
    if (testData) {
      await generateInsights(testData, [
        { type: 'theme', value: 'Performance' },
        { type: 'sentiment', value: 'Positive' }
      ], 'test-section');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontFamily: 'BMW Motorrad', mb: 3 }}>
        AI Insights Test
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Test Controls
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button 
            variant="contained" 
            onClick={handleTest}
            disabled={loading || !testData}
          >
            {loading ? 'Testing...' : 'Test AI Insights'}
          </Button>
          <Button 
            variant="outlined" 
            onClick={clearInsights}
          >
            Clear Insights
          </Button>
        </Box>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            Error: {error}
          </Typography>
        )}
      </Paper>

      <AIInsightsPanel
        insights={insights}
        loading={loading}
        error={error}
        onRefresh={handleTest}
        className="test-insights-panel"
      />
    </Box>
  );
};

export default AIInsightsTest; 