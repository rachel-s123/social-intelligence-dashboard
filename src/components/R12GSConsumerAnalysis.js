import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Divider,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button
} from '@mui/material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import CloseIcon from '@mui/icons-material/Close';
import TimelineIcon from '@mui/icons-material/Timeline';
import QuoteExplorer from './QuoteExplorer';
import { useAIInsights, AIInsightsPanel } from './AIInsightsHooks';
import './src/components/AIInsights.css';
import MiniAIInsights from './MiniAIInsights';

const R12GSConsumerAnalysis = ({ selectedMarket, data }) => {
  const marketKey = selectedMarket.toLowerCase();
  const marketData = data[marketKey] || {};
  const noData = !data[marketKey];
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedSentiment, setSelectedSentiment] = useState(null);
  const [showQuotesDialog, setShowQuotesDialog] = useState(false);
  const [dialogQuotes, setDialogQuotes] = useState([]);
  const [showInsights, setShowInsights] = useState(false);
  
  // AI Insights hook
  const { insights, loading, error, generateInsights, clearInsights } = useAIInsights();

  // Debug environment variables
  React.useEffect(() => {
    console.log("🔍 R12GSConsumerAnalysis - Environment Check:");
    console.log("REACT_APP_OPENAI_API_KEY:", process.env.REACT_APP_OPENAI_API_KEY ? "✅ Found" : "❌ Not found");
    console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "✅ Found" : "❌ Not found");
  }, []);

  const {
    keyInsights = {},
    consumerTimeline = [],
    consumerQuotes = [],
    consumerConcerns = [],
    consumerReactionThemes = {},
    sentimentAnalysis = {},
    platformDistribution = {}
  } = marketData;

  // Prepare filter options for QuoteExplorer
  const allThemes = useMemo(
    () => Array.from(new Set(consumerQuotes.map((q) => q.theme))),
    [consumerQuotes]
  );
  const allSentiments = useMemo(
    () => Array.from(new Set(consumerQuotes.map((q) => q.sentiment))),
    [consumerQuotes]
  );
  const allPlatforms = useMemo(
    () => Array.from(new Set(consumerQuotes.map((q) => q.platform))),
    [consumerQuotes]
  );
  const allWeeks = useMemo(
    () => Array.from(new Set(consumerQuotes.map((q) => q.week).filter(Boolean))),
    [consumerQuotes]
  );
  const allPurchaseIntents = useMemo(
    () => Array.from(new Set(consumerQuotes.map((q) => q.purchaseIntent))),
    [consumerQuotes]
  );
  const allCompetitors = useMemo(
    () =>
      Array.from(
        new Set(
          consumerQuotes
            .map((q) => q.competitorMentioned)
            .filter((c) => c && c !== 'NONE')
        )
      ),
    [consumerQuotes]
  );

  const [filters, setFilters] = useState({
    theme: 'All',
    sentiment: 'All',
    platform: 'All',
    week: 'All',
    purchaseIntent: 'All',
    competitor: 'All'
  });

  const filteredQuotes = useMemo(() => {
    return consumerQuotes.filter((q) =>
      [
        filters.theme === 'All' || q.theme === filters.theme,
        filters.sentiment === 'All' || q.sentiment === filters.sentiment,
        filters.platform === 'All' || q.platform === filters.platform,
        filters.week === 'All' || q.week === filters.week,
        filters.purchaseIntent === 'All' || q.purchaseIntent === filters.purchaseIntent,
        filters.competitor === 'All' || q.competitorMentioned === filters.competitor
      ].every(Boolean)
    );
  }, [consumerQuotes, filters]);

  // Filter out [NOT PROVIDED IN REPORT] items
  const filteredKeyInsights = Object.entries(keyInsights).filter(([key, value]) => 
    value !== '[NOT PROVIDED IN REPORT]' && value !== 'NOT PROVIDED IN REPORT'
  );

  const filteredConsumerConcerns = consumerConcerns.filter(concern => 
    concern.frequency !== '[NOT PROVIDED IN REPORT] mentions' && 
    concern.frequency !== 'NOT PROVIDED IN REPORT mentions'
  );

  const filteredConsumerTimeline = consumerTimeline.filter(week => 
    week.event !== '[NOT PROVIDED IN REPORT]' && 
    week.volume !== '[NOT PROVIDED IN REPORT]' && 
    week.sentiment !== '[NOT PROVIDED IN REPORT]' && 
    week.keyReactions !== '[NOT PROVIDED IN REPORT]'
  );

  // Prepare data for pie chart (sentiment)
  const sentimentData = Object.entries(sentimentAnalysis).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: value,
    color: key === 'positive' ? '#4caf50' : key === 'negative' ? '#f44336' : '#ff9800'
  }));

  // Prepare data for radar chart (themes)
  const themeData = Object.entries(consumerReactionThemes).map(([theme, value]) => ({
    subject: theme.length > 20 ? theme.substring(0, 20) + '...' : theme,
    fullTheme: theme,
    A: value,
    fullMark: Math.max(...Object.values(consumerReactionThemes), 1)
  }));

  // Prepare data for bar chart (platforms)
  const platformData = Object.entries(platformDistribution).map(([platform, value]) => ({
    platform,
    value: value
  }));

  // Helper functions for data calculations
  const calculateAverageSentiment = (quotes) => {
    if (!quotes || quotes.length === 0) return 0;
    const sentimentValues = quotes.map(q => {
      switch (q.sentiment) {
        case 'Positive': return 5;
        case 'Neutral': return 3;
        case 'Negative': return 1;
        default: return 3;
      }
    });
    return (sentimentValues.reduce((a, b) => a + b, 0) / sentimentValues.length).toFixed(1);
  };

  const calculateTopTheme = (quotes) => {
    if (!quotes || quotes.length === 0) return null;
    
    const themeCounts = {};
    quotes.forEach(q => {
      themeCounts[q.theme] = (themeCounts[q.theme] || 0) + 1;
    });
    
    const topTheme = Object.entries(themeCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (!topTheme) return null;
    
    return {
      name: topTheme[0],
      count: topTheme[1],
      percentage: Math.round((topTheme[1] / quotes.length) * 100)
    };
  };

  const calculateTimeRange = (quotes) => {
    if (!quotes || quotes.length === 0) return null;
    
    const weeks = quotes.map(q => q.week).filter(Boolean);
    if (weeks.length === 0) return null;
    
    return {
      start: Math.min(...weeks),
      end: Math.max(...weeks)
    };
  };

  // Prepare filtered data for AI insights
  const filteredData = useMemo(() => {
    if (!filteredQuotes || filteredQuotes.length === 0) return null;
    
    return {
      totalQuotes: filteredQuotes.length,
      averageSentiment: calculateAverageSentiment(filteredQuotes),
      topTheme: calculateTopTheme(filteredQuotes),
      timeRange: calculateTimeRange(filteredQuotes),
      quotes: filteredQuotes.slice(0, 10), // Sample of quotes
      sentimentData: sentimentData,
      themeData: themeData,
      platformData: platformData
    };
  }, [filteredQuotes, sentimentData, themeData, platformData]);

  // INSIGHTS GENERATION: Only manual generation via button click
  // No automatic generation - insights will only be generated when user clicks "Generate Insights" button

  const handleGenerateInsights = async () => {
    console.log("🔍 handleGenerateInsights called - Manual generation triggered");
    if (!filteredData) {
      console.log("❌ No filtered data available, skipping generation");
      return;
    }
    
    // Convert filters to activeFilters format
    const activeFilters = Object.entries(filters)
      .filter(([key, value]) => value !== 'All')
      .map(([key, value]) => ({
        type: key,
        value: value
      }));
    
    console.log("🚀 Starting manual insight generation with filters:", activeFilters);
    await generateInsights(filteredData, activeFilters, 'consumer-analysis');
  };

  const handleToggleInsights = () => {
    if (showInsights) {
      clearInsights();
    }
    setShowInsights(!showInsights);
  };

  // Color coding for quote tags
  const getTagColor = (tag) => {
    const colorMap = {
      'POSITIVE': '#4caf50',
      'NEGATIVE': '#f44336',
      'NEUTRAL': '#ff9800',
      'YES': '#4caf50',
      'NO': '#f44336',
      'CONDITIONAL': '#ff9800',
      'NONE': '#9e9e9e',
      'BMW GS Series': '#1976d2',
      'KTM 890 Adventure': '#ff5722',
      'BMW Urban G/S': '#2196f3'
    };
    return colorMap[tag] || '#757575';
  };

  // Handle theme click
  const handleThemeClick = (data, index) => {
    if (data && themeData[index]) {
      const theme = themeData[index];
      const quotes = consumerQuotes.filter(quote => quote.theme === theme.fullTheme);
      setDialogQuotes(quotes);
      setSelectedTheme(theme.fullTheme);
      setShowQuotesDialog(true);
    }
  };

  // Custom tooltip for radar chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box sx={{ 
          backgroundColor: 'white', 
          border: '1px solid #ccc', 
          p: 1, 
          borderRadius: 1,
          boxShadow: 2
        }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {data.fullTheme}
          </Typography>
          <Typography variant="body2">
            Value: {data.A}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Handle sentiment click
  const handleSentimentClick = (sentiment) => {
    const quotes = consumerQuotes.filter(quote => quote.sentiment === sentiment.name.toUpperCase());
    setDialogQuotes(quotes);
    setSelectedSentiment(sentiment.name);
    setShowQuotesDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setShowQuotesDialog(false);
    setSelectedTheme(null);
    setSelectedSentiment(null);
    setDialogQuotes([]);
  };

  if (noData) {
    return (
      <Typography sx={{ fontFamily: 'BMW Motorrad' }}>
        No R 12 G/S consumer data available for {selectedMarket}.
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontFamily: 'BMW Motorrad', mb: 4, color: '#1a1a1a' }}>
        R 12 G/S Consumer Analysis - {selectedMarket}
      </Typography>

      {/* AI Insights Controls */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant={showInsights ? "contained" : "outlined"}
            onClick={handleToggleInsights}
            sx={{
              fontFamily: 'BMW Motorrad',
              backgroundColor: showInsights ? '#1976d2' : 'transparent',
              color: showInsights ? 'white' : '#1976d2',
              borderColor: '#1976d2',
              '&:hover': {
                backgroundColor: showInsights ? '#1565c0' : 'rgba(25, 118, 210, 0.04)',
              }
            }}
          >
            🤖 {showInsights ? 'Hide' : 'Show'} AI Insights
          </Button>
          
          {showInsights && (
            <Button
              variant="contained"
              onClick={handleGenerateInsights}
              disabled={loading || !filteredData || !Object.values(filters).some(f => f !== 'All')}
              sx={{
                fontFamily: 'BMW Motorrad',
                backgroundColor: '#4caf50',
                '&:hover': {
                  backgroundColor: '#388e3c',
                },
                '&:disabled': {
                  backgroundColor: '#ccc',
                }
              }}
            >
              {loading ? 'Generating...' : 'Generate Insights'}
            </Button>
          )}
        </Box>
      </Box>

      {/* AI Insights Panel */}
      {showInsights && (
        <Box sx={{ mb: 3 }}>
          <AIInsightsPanel
            insights={insights}
            loading={loading}
            error={error}
            onRefresh={handleGenerateInsights}
            className="main-insights-panel"
          />
        </Box>
      )}

      {/* Quote Explorer */}
      <QuoteExplorer
        filters={filters}
        onFilterChange={setFilters}
        quotes={filteredQuotes}
        themes={allThemes}
        sentiments={allSentiments}
        platforms={allPlatforms}
        weeks={allWeeks}
        purchaseIntents={allPurchaseIntents}
        competitors={allCompetitors}
      />

      {/* Sentiment Analysis Pie Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontFamily: 'BMW Motorrad', mb: 2, color: '#1a1a1a' }}>
                Sentiment Analysis (Click to View Quotes)
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
                    onClick={handleSentimentClick}
                    style={{ cursor: 'pointer' }}
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
              
              {/* Mini AI Insights for Sentiment */}
              {/* Temporarily disabled to prevent flashing and multiple API calls */}
              {/* {showInsights && filteredData && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: 1 }}>
                  <MiniAIInsights 
                    data={filteredData}
                    section="sentiment"
                    filters={Object.entries(filters)
                      .filter(([key, value]) => value !== 'All')
                      .map(([key, value]) => ({ type: key, value }))}
                  />
                </Box>
              )} */}
            </CardContent>
          </Card>
        </Grid>

        {/* Consumer Reaction Themes Radar Chart */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontFamily: 'BMW Motorrad', mb: 2, color: '#1a1a1a' }}>
                Consumer Reaction Themes (Click to View Quotes)
              </Typography>
              <Box 
                sx={{ 
                  position: 'relative',
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.8 }
                }}
                onClick={() => {
                  // For now, show all quotes until we fix the individual theme clicking
                  setDialogQuotes(consumerQuotes);
                  setSelectedTheme('All Themes');
                  setShowQuotesDialog(true);
                }}
              >
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
                      onClick={(data, index) => {
                        console.log('Theme clicked:', data, index);
                        handleThemeClick(data, index);
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </Box>
              <Typography variant="caption" sx={{ color: '#666', mt: 1, display: 'block' }}>
                Click anywhere on the chart to view all quotes, or hover for theme details
              </Typography>
              
              {/* Mini AI Insights for Themes */}
              {/* Temporarily disabled to prevent flashing and multiple API calls */}
              {/* {showInsights && filteredData && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(25, 118, 210, 0.1)', borderRadius: 1 }}>
                  <MiniAIInsights 
                    data={filteredData}
                    section="themes"
                    filters={Object.entries(filters)
                      .filter(([key, value]) => value !== 'All')
                      .map(([key, value]) => ({ type: key, value }))}
                  />
                </Box>
              )} */}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Platform Distribution Bar Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" sx={{ fontFamily: 'BMW Motorrad', mb: 2, color: '#1a1a1a' }}>
                Platform Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={platformData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
              
              {/* Mini AI Insights for Platform Distribution */}
              {/* Temporarily disabled to prevent flashing and multiple API calls */}
              {/* {showInsights && filteredData && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(156, 39, 176, 0.1)', borderRadius: 1 }}>
                  <MiniAIInsights 
                    data={filteredData}
                    section="platforms"
                    filters={Object.entries(filters)
                      .filter(([key, value]) => value !== 'All')
                      .map(([key, value]) => ({ type: key, value }))}
                  />
                </Box>
              )} */}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Key Insights */}
      {filteredKeyInsights.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ fontFamily: 'BMW Motorrad', mb: 2, color: '#1a1a1a' }}>
              Key Insights
            </Typography>
          </Grid>
          {filteredKeyInsights.map(([insight, content], index) => (
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
      )}

      {/* Consumer Concerns */}
      {filteredConsumerConcerns.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ fontFamily: 'BMW Motorrad', mb: 2, color: '#1a1a1a' }}>
              Top Consumer Concerns
            </Typography>
          </Grid>
          {filteredConsumerConcerns.map((concern, index) => (
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

      {/* Consumer Timeline */}
      {filteredConsumerTimeline.length > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ fontFamily: 'BMW Motorrad', mb: 2, color: '#1a1a1a' }}>
              Consumer Timeline
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ position: 'relative' }}>
                  {filteredConsumerTimeline.map((week, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      mb: 3, 
                      position: 'relative',
                      '&:not(:last-child)::after': {
                        content: '""',
                        position: 'absolute',
                        left: 20,
                        top: 40,
                        bottom: -20,
                        width: 2,
                        backgroundColor: '#e0e0e0'
                      }
                    }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%', 
                        backgroundColor: '#1976d2', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        mr: 2,
                        flexShrink: 0
                      }}>
                        <TimelineIcon sx={{ color: 'white' }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ 
                          fontFamily: 'BMW Motorrad', 
                          color: '#1976d2',
                          mb: 1
                        }}>
                          Week {week.week} ({week.weekRange})
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                          {week.event}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                          Volume: {week.volume}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                          Sentiment: {week.sentiment}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Key Reactions: {week.keyReactions}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Quotes Dialog */}
      <Dialog 
        open={showQuotesDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: 'BMW Motorrad' }}>
          {selectedTheme ? `Quotes for: ${selectedTheme}` : `Quotes for: ${selectedSentiment} Sentiment`}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <List>
            {dialogQuotes.map((quote, index) => (
              <ListItem key={index} sx={{ 
                border: '1px solid #e0e0e0', 
                borderRadius: 1, 
                mb: 2,
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}>
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ mb: 1, fontStyle: 'italic' }}>
                      "{quote.text}"
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                        <Chip 
                          label={`Sentiment: ${quote.sentiment}`} 
                          size="small" 
                          sx={{ backgroundColor: getTagColor(quote.sentiment), color: 'white' }}
                        />
                        <Chip 
                          label={`Intent: ${quote.purchaseIntent}`} 
                          size="small" 
                          sx={{ backgroundColor: getTagColor(quote.purchaseIntent), color: 'white' }}
                        />
                        {quote.competitorMentioned !== 'NONE' && (
                          <Chip 
                            label={`Competitor: ${quote.competitorMentioned}`} 
                            size="small" 
                            sx={{ backgroundColor: getTagColor(quote.competitorMentioned), color: 'white' }}
                          />
                        )}
                      </Box>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        Platform: {quote.platform} | Date: {quote.date} | ID: {quote.id}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default R12GSConsumerAnalysis;
