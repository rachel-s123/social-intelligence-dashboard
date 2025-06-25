import React, { useEffect } from 'react';
import { useAIInsights } from './AIInsightsHooks';
import { Box, Typography, CircularProgress } from '@mui/material';

const MiniAIInsights = ({ data, section, filters }) => {
  const { insights, loading, generateInsights } = useAIInsights();
  
  useEffect(() => {
    if (data && filters.length > 0) {
      generateInsights(data, filters, section);
    }
  }, [data, filters, section, generateInsights]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={16} />
        <Typography variant="caption" sx={{ color: '#666' }}>
          Analyzing {section}...
        </Typography>
      </Box>
    );
  }

  if (!insights) return null;

  return (
    <Box sx={{ 
      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
      borderRadius: 1, 
      p: 1.5,
      border: '1px solid rgba(76, 175, 80, 0.3)'
    }}>
      <Typography variant="caption" sx={{ 
        fontWeight: 'bold', 
        color: '#2e7d32',
        display: 'block',
        mb: 0.5
      }}>
        🤖 AI Insight:
      </Typography>
      <Typography variant="caption" sx={{ 
        color: '#424242',
        lineHeight: 1.4,
        display: 'block',
        mb: 0.5
      }}>
        {insights.summary}
      </Typography>
      {insights.keyFindings && insights.keyFindings.length > 0 && (
        <Typography variant="caption" sx={{ 
          color: '#1976d2',
          fontStyle: 'italic',
          display: 'block'
        }}>
          💡 {insights.keyFindings[0]}
        </Typography>
      )}
    </Box>
  );
};

export default MiniAIInsights; 