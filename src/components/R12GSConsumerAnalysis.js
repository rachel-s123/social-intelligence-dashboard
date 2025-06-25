import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Paper,
  Chip,
  Divider,
  useTheme
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const R12GSConsumerAnalysis = ({ selectedMarket, data }) => {
  const theme = useTheme();
  const marketKey = selectedMarket.toLowerCase();
  const marketData = data[marketKey];

  if (!marketData) {
    return (
      <Typography sx={{ fontFamily: 'BMW Motorrad' }}>
        No R 12 G/S consumer data available for {selectedMarket}.
      </Typography>
    );
  }

  const { 
    consumerReactionThemes = {}, 
    sentimentAnalysis = {}, 
    keyInsights = {},
    platformDistribution = {},
    consumerTimeline = [],
    consumerQuotes = [],
    consumerConcerns = []
  } = marketData;

  // Prepare data for pie chart (sentiment)
  const sentimentData = Object.entries(sentimentAnalysis).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: value,
    color: key === 'positive' ? '#4caf50' : key === 'negative' ? '#f44336' : '#ff9800'
  }));

  // Prepare data for radar chart (themes)
  const themeData = Object.entries(consumerReactionThemes).map(([theme, value]) => ({
    subject: theme.length > 20 ? theme.substring(0, 20) + '...' : theme,
    A: value,
    fullMark: 25
  }));

  // Platform distribution data
  const platformData = Object.entries(platformDistribution).map(([platform, value]) => ({
    name: platform,
    value: value
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontFamily: 'BMW Motorrad', mb: 4, color: '#1a1a1a' }}>
        R 12 G/S Consumer Analysis - {selectedMarket}
      </Typography>

      {/* Sentiment Analysis Pie Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontFamily: 'BMW Motorrad', mb: 2, color: '#1a1a1a' }}>
                Sentiment Analysis
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                {sentimentData.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, backgroundColor: item.color, borderRadius: '50%' }} />
                    <Typography variant="body2">{item.name}: {item.value}%</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Consumer Reaction Themes Radar Chart */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontFamily: 'BMW Motorrad', mb: 2, color: '#1a1a1a' }}>
                Consumer Reaction Themes
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={themeData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 25]} />
                  <Radar
                    name="Themes"
                    dataKey="A"
                    stroke="#1976d2"
                    fill="#1976d2"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Platform Distribution */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" sx={{ fontFamily: 'BMW Motorrad', mb: 2, color: '#1a1a1a' }}>
                Platform Distribution
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {platformData.map((platform, index) => (
                  <Chip
                    key={index}
                    label={`${platform.name}: ${platform.value}%`}
                    variant="outlined"
                    sx={{
                      fontFamily: 'BMW Motorrad',
                      borderColor: '#1976d2',
                      color: '#1976d2',
                      '&:hover': {
                        backgroundColor: '#1976d2',
                        color: 'white'
                      }
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Key Insights */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ fontFamily: 'BMW Motorrad', mb: 2, color: '#1a1a1a' }}>
            Key Insights
          </Typography>
        </Grid>
        {Object.entries(keyInsights).map(([insight, content], index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card elevation={3} sx={{ height: '100%', backgroundColor: '#f8f9fa' }}>
              <CardContent>
                <Typography variant="h6" sx={{ 
                  fontFamily: 'BMW Motorrad', 
                  mb: 2, 
                  color: '#1976d2',
                  fontWeight: 'bold'
                }}>
                  {insight}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" sx={{ 
                  lineHeight: 1.6,
                  color: '#424242'
                }}>
                  {content}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Consumer Concerns */}
      {consumerConcerns.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ fontFamily: 'BMW Motorrad', mb: 2, color: '#1a1a1a' }}>
              Top Consumer Concerns
            </Typography>
          </Grid>
          {consumerConcerns.map((concern, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Paper elevation={2} sx={{ p: 2, backgroundColor: '#fff3e0' }}>
                <Typography variant="subtitle1" sx={{ 
                  fontFamily: 'BMW Motorrad', 
                  fontWeight: 'bold',
                  color: '#e65100',
                  mb: 1
                }}>
                  {concern.concern}
                </Typography>
                <Typography variant="body2" sx={{ 
                  fontStyle: 'italic',
                  color: '#666',
                  mb: 1
                }}>
                  "{concern.exampleQuote}"
                </Typography>
                <Chip 
                  label={concern.frequency} 
                  size="small" 
                  variant="outlined"
                  sx={{ borderColor: '#e65100', color: '#e65100' }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Timeline Summary */}
      {consumerTimeline.length > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ fontFamily: 'BMW Motorrad', mb: 2, color: '#1a1a1a' }}>
              Consumer Timeline Summary
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {consumerTimeline.slice(0, 6).map((week, index) => (
                    <Chip
                      key={index}
                      label={`Week ${week.week}: ${week.event.substring(0, 30)}...`}
                      variant="outlined"
                      sx={{
                        fontFamily: 'BMW Motorrad',
                        borderColor: '#4caf50',
                        color: '#4caf50',
                        maxWidth: 200
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default R12GSConsumerAnalysis;
