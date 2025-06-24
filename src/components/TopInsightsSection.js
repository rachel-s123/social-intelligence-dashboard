import React from 'react';
import { Box, Typography, Paper, Card, CardContent, Grid, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import ForumIcon from '@mui/icons-material/Forum';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

const SENTIMENT_ICONS = {
  Positive: <SentimentSatisfiedAltIcon sx={{ color: '#48b83c' }} />,
  Negative: <SentimentDissatisfiedIcon sx={{ color: '#e63329' }} />,
  Neutral: <SentimentNeutralIcon sx={{ color: '#666666' }} />
};

const SENTIMENT_COLORS = {
  Positive: '#48b83c',
  Negative: '#e63329',
  Neutral: '#666666'
};

const TopInsightsSection = ({ data }) => {
  if (!data || !data.topInsights || !Array.isArray(data.topInsights)) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" color="primary.main">Top 10 Insights</Typography>
        <Typography color="text.secondary">No insights data available.</Typography>
      </Paper>
    );
  }

  // Helper function to determine sentiment and category from insight text
  const analyzeInsight = (insightText) => {
    const text = insightText.toLowerCase();
    
    // Determine sentiment
    let sentiment = "Neutral";
    if (text.includes("winner") || text.includes("positive") || text.includes("praise") || 
        text.includes("excitement") || text.includes("interest") || text.includes("successfully")) {
      sentiment = "Positive";
    } else if (text.includes("pain point") || text.includes("concerns") || text.includes("wary") || 
               text.includes("debate") || text.includes("skepticism") || text.includes("barrier")) {
      sentiment = "Negative";
    }
    
    // Determine category
    let category = "General";
    if (text.includes("design") || text.includes("styling") || text.includes("retro")) {
      category = "Design";
    } else if (text.includes("price") || text.includes("value") || text.includes("cost")) {
      category = "Pricing";
    } else if (text.includes("weight") || text.includes("capability") || text.includes("performance")) {
      category = "Performance";
    } else if (text.includes("feature") || text.includes("electronics") || text.includes("simplicity")) {
      category = "Features";
    } else if (text.includes("purchase") || text.includes("intent") || text.includes("demand")) {
      category = "Intent";
    } else if (text.includes("community") || text.includes("image") || text.includes("perception")) {
      category = "Community";
    }
    
    // Determine icon
    let icon = <LightbulbIcon color="primary" />;
    if (category === "Design" || category === "Features") {
      icon = <TrendingUpIcon color="primary" />;
    } else if (category === "Pricing" || category === "Performance") {
      icon = sentiment === "Positive" ? 
        <SentimentSatisfiedAltIcon sx={{ color: SENTIMENT_COLORS.Positive }} /> :
        <SentimentDissatisfiedIcon sx={{ color: SENTIMENT_COLORS.Negative }} />;
    } else if (category === "Intent") {
      icon = <TrendingUpIcon color="primary" />;
    } else if (category === "Community") {
      icon = <ForumIcon color="primary" />;
    }
    
    return { sentiment, category, icon };
  };

  // Create insights from the actual data
  const insights = data.topInsights.map((insightText, index) => {
    const { sentiment, category, icon } = analyzeInsight(insightText);
    
    return {
      id: index + 1,
      title: insightText.split(' - ')[0] || insightText.substring(0, 50) + '...',
      description: insightText.split(' - ')[1] || insightText,
      icon,
      category,
      sentiment,
      number: index + 1 // Numeric label
    };
  });

  return (
    <Paper sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <LightbulbIcon sx={{ color: 'primary.main', mr: 1, fontSize: 28 }} />
        <Typography variant="h6" color="primary.main" fontWeight={600}>
          Top {insights.length} Insights
        </Typography>
      </Box>
      
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Key consumer insights and market trends for the R 12 G/S based on social media analysis
      </Typography>

      <Grid container spacing={2}>
        {insights.map((insight) => (
          <Grid item xs={12} md={6} key={insight.id}>
            <Card 
              sx={{ 
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: 2
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                  <Box sx={{ mr: 1.5, mt: 0.5 }}>
                    {insight.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      {insight.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      {insight.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={`#${insight.number}`} 
                        size="small" 
                        variant="outlined"
                        color="secondary"
                      />
                      <Chip 
                        label={insight.category} 
                        size="small" 
                        variant="outlined"
                        color="primary"
                      />
                      <Chip 
                        label={insight.sentiment} 
                        size="small"
                        icon={SENTIMENT_ICONS[insight.sentiment]}
                        sx={{ 
                          backgroundColor: SENTIMENT_COLORS[insight.sentiment] + '20',
                          color: SENTIMENT_COLORS[insight.sentiment],
                          borderColor: SENTIMENT_COLORS[insight.sentiment]
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default TopInsightsSection; 