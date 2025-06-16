import React, { useState, useEffect } from 'react';
import { Paper, Typography, Grid, Box, Card, CardContent, Divider, CircularProgress, Fade } from '@mui/material';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { conversationData } from '../data/conversationData';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CampaignIcon from '@mui/icons-material/Campaign';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MessageIcon from '@mui/icons-material/Message';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

const SENTIMENT_COLORS = {
  Positive: '#48b83c',
  Negative: '#e63329',
  Neutral: '#666666'
};

const SENTIMENT_ICONS = {
  Positive: <SentimentSatisfiedAltIcon sx={{ color: SENTIMENT_COLORS.Positive }} />,
  Negative: <SentimentDissatisfiedIcon sx={{ color: SENTIMENT_COLORS.Negative }} />,
  Neutral: <SentimentNeutralIcon sx={{ color: SENTIMENT_COLORS.Neutral }} />
};

// Custom tick renderer for PolarAngleAxis to wrap or rotate long labels, now with % value
const AngleAxisTick = (themeData) => (props) => {
  const { x, y, payload } = props;
  const label = payload.value;
  // Find the value for this axis from the themeData array
  const found = themeData.find((d) => d.subject === label);
  const value = found ? found.value : null;
  const labelWithPercent = value !== null ? `${label} (${value}%)` : label;
  // Split long labels into two lines if needed
  const words = labelWithPercent.split(' ');
  let firstLine = labelWithPercent;
  let secondLine = '';
  if (labelWithPercent.length > 18 && words.length > 1) {
    const mid = Math.ceil(words.length / 2);
    firstLine = words.slice(0, mid).join(' ');
    secondLine = words.slice(mid).join(' ');
  }
  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fontSize={13} fill="#666" fontWeight="bold">
        <tspan x="0" dy="0">{firstLine}</tspan>
        {secondLine && <tspan x="0" dy="15">{secondLine}</tspan>}
      </text>
    </g>
  );
};

const ConversationInsights = ({ selectedMarket }) => {
  const [data, setData] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedSentiment, setSelectedSentiment] = useState(null);

  useEffect(() => {
    const normalizedMarket = selectedMarket?.toLowerCase().replace(/\s+/g, '_');
    const marketData = conversationData[normalizedMarket];
    setData(marketData);
    setSelectedTheme(null); // Reset selected theme when market changes
    setSelectedSentiment(null); // Reset selected sentiment when market changes
  }, [selectedMarket]);

  if (!data) {
    return <Typography>No insights available for this market.</Typography>;
  }

  const handleThemeClick = (theme) => {
    if (!theme) {
      console.warn('No theme provided to handleThemeClick');
      return;
    }
    
    // Try both with and without the dash prefix
    const themeWithDash = `- ${theme}`;
    const themeWithoutDash = theme.replace('- ', '');
    
    if (data.themeInsights[themeWithDash]) {
      setSelectedTheme(themeWithDash);
    } else if (data.themeInsights[themeWithoutDash]) {
      setSelectedTheme(themeWithoutDash);
    } else {
      console.warn(`No insights available for theme: ${theme}`);
    }
  };

  const ThemeInsightCard = ({ theme, insights }) => {
    if (!insights || !Array.isArray(insights)) {
      return (
        <Fade in={true}>
          <Card sx={{ 
            borderRadius: 1.5,
            border: '2px solid',
            borderColor: 'error.main',
            boxShadow: 3
          }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body1" color="error.main">
                No insights available for this theme
              </Typography>
            </CardContent>
          </Card>
        </Fade>
      );
    }

    return (
      <Fade in={true}>
        <Card sx={{ 
          borderRadius: 1.5,
          border: '2px solid',
          borderColor: 'primary.main',
          boxShadow: 3
        }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary.main">
              {theme.replace('- ', '')}
            </Typography>
            {insights.map((insight, index) => (
              <Box key={index} sx={{ mb: 1.5 }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.primary' }}>
                  "{insight.quote}"
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {insight.context}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Source: {insight.source}
                </Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Fade>
    );
  };

  const SentimentInsightCard = ({ sentiment, insights }) => {
    if (!insights || !Array.isArray(insights)) {
      return (
        <Fade in={true}>
          <Card sx={{ 
            borderRadius: 1.5,
            border: '2px solid',
            borderColor: 'error.main',
            boxShadow: 3
          }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body1" color="error.main">
                No insights available for this sentiment
              </Typography>
            </CardContent>
          </Card>
        </Fade>
      );
    }
    return (
      <Fade in={true}>
        <Card sx={{ 
          borderRadius: 1.5,
          border: '2px solid',
          borderColor: 'primary.main',
          boxShadow: 3
        }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              {SENTIMENT_ICONS[sentiment]}
              <Typography variant="subtitle1" fontWeight={600} sx={{ ml: 1 }}>
                {sentiment} Sentiment
              </Typography>
            </Box>
            {insights.map((insight, index) => (
              <Box key={index} sx={{ mb: 1.5 }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.primary' }}>
                  "{insight.quote}"
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {insight.context}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Source: {insight.source}
                </Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Fade>
    );
  };

  const handleSentimentClick = (sentiment) => {
    if (data.sentimentInsights[sentiment]) {
      setSelectedSentiment(sentiment);
    } else {
      console.warn(`No insights available for sentiment: ${sentiment}`);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 1, md: 2 } }}>
      {/* Theme Data Section */}
      <Paper sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <TrendingUpIcon sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" color="primary.main" fontWeight={600}>
            Theme Analysis
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ width: 600, height: 370, position: 'relative', px: 0, mx: 'auto' }}>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ textAlign: 'center', display: 'block', mb: 1, fontStyle: 'italic', fontSize: '0.98em' }}
              >
                Click on a theme in the radar chart to view insights
              </Typography>
              <ResponsiveContainer width={550} height={350}>
                <RadarChart 
                  data={data.themeData}
                  margin={{ top: 30, right: 60, bottom: 30, left: 60 }}
                >
                  <PolarGrid />
                  <PolarAngleAxis 
                    dataKey="subject"
                    onClick={(e) => handleThemeClick(e.value)}
                    style={{ cursor: 'pointer' }}
                    tick={AngleAxisTick(data.themeData)}
                    tickLine={false}
                  />
                  <PolarRadiusAxis />
                  <Radar 
                    name="Theme" 
                    dataKey="value" 
                    stroke="#0066B1" 
                    fill="#0066B1" 
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
              {selectedTheme ? (
                <ThemeInsightCard 
                  theme={selectedTheme} 
                  insights={data.themeInsights[selectedTheme]} 
                />
              ) : (
                <Card sx={{ borderRadius: 1.5, bgcolor: 'background.default', width: '100%', maxWidth: 420 }}>
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      Select a theme from the radar chart to view insights
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Sentiment Analysis Section */}
      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <MessageIcon sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" color="primary.main" fontWeight={600}>
            Sentiment Analysis
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ width: '100%', height: 340, position: 'relative', px: 2 }}>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ textAlign: 'center', display: 'block', mb: 1, fontStyle: 'italic', fontSize: '0.98em' }}
              >
                Click on a sentiment in the pie chart to view insights
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.sentimentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={({ name, percent }) => {
                      const sentiment = name.replace(' Sentiment', '');
                      return `${sentiment} (${Math.round(percent * 100)}%)`;
                    }}
                    onClick={(_, index) => {
                      const sentiment = data.sentimentData[index].name.replace(' Sentiment', '');
                      handleSentimentClick(sentiment);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {data.sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[entry.name.replace(' Sentiment', '')]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
              {selectedSentiment ? (
                <SentimentInsightCard 
                  sentiment={selectedSentiment} 
                  insights={data.sentimentInsights[selectedSentiment]} 
                />
              ) : (
                <Card sx={{ borderRadius: 1.5, bgcolor: 'background.default', width: '100%', maxWidth: 420 }}>
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      Select a sentiment from the pie chart to view insights
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ConversationInsights; 