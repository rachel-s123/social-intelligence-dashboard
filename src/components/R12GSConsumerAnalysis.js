import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  AlertTitle,
  Tooltip
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
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';
import CloseIcon from '@mui/icons-material/Close';
import TimelineIcon from '@mui/icons-material/Timeline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import QuoteExplorer from './QuoteExplorer';
import { useAIInsights } from './AIInsightsHooks';
import './src/components/AIInsights.css';
import StarIcon from '@mui/icons-material/Star';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import ForumIcon from '@mui/icons-material/Forum';

console.log({ Accordion, AccordionSummary, AccordionDetails });

const R12GSConsumerAnalysis = ({ selectedMarket, data }) => {
  const marketKey = selectedMarket.toLowerCase();
  const marketData = data[marketKey] || {};
  const noData = !data[marketKey];
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedSentiment, setSelectedSentiment] = useState(null);
  const [showQuotesDialog, setShowQuotesDialog] = useState(false);
  const [dialogQuotes, setDialogQuotes] = useState([]);
  const [showInsights, setShowInsights] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [timelineExpanded, setTimelineExpanded] = useState(false);
  
  // AI Insights hook
  const { insights, loading, error, generateInsights, clearInsights } = useAIInsights();

  // Debug environment variables
  useEffect(() => {
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
  const calculateSentimentPercentages = (quotes) => {
    if (!quotes || quotes.length === 0) return { positive: 0, neutral: 0, negative: 0 };
    
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    quotes.forEach(q => {
      switch (q.sentiment) {
        case 'POSITIVE': sentimentCounts.positive++; break;
        case 'NEUTRAL': sentimentCounts.neutral++; break;
        case 'NEGATIVE': sentimentCounts.negative++; break;
        default: sentimentCounts.neutral++; break;
      }
    });
    
    const total = quotes.length;
    return {
      positive: Math.round((sentimentCounts.positive / total) * 100),
      neutral: Math.round((sentimentCounts.neutral / total) * 100),
      negative: Math.round((sentimentCounts.negative / total) * 100)
    };
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

  // Return a representative sample of quotes spanning sentiments and themes
  const getQuoteSample = (quotes, sampleSize = 50) => {
    if (!quotes || quotes.length <= sampleSize) return quotes;
    const sorted = [...quotes].sort((a, b) => {
      if (a.sentiment === b.sentiment) {
        return a.theme.localeCompare(b.theme);
      }
      return a.sentiment.localeCompare(b.sentiment);
    });
    const step = Math.max(Math.floor(sorted.length / sampleSize), 1);
    const sample = [];
    for (let i = 0; i < sorted.length && sample.length < sampleSize; i += step) {
      sample.push(sorted[i]);
    }
    return sample;
  };

  // Prepare filtered data for AI insights
  const filteredData = useMemo(() => {
    if (!filteredQuotes || filteredQuotes.length === 0) return null;
    
    const sentimentPercentages = calculateSentimentPercentages(filteredQuotes);
    console.log("🔍 Debug - Filtered Quotes:", filteredQuotes.length);
    console.log("🔍 Debug - Sentiment Percentages:", sentimentPercentages);
    console.log("🔍 Debug - Sample quotes:", filteredQuotes.slice(0, 3).map(q => ({ 
      text: q.text.substring(0, 50) + "...", 
      sentiment: q.sentiment,
      theme: q.theme 
    })));
    console.log("🔍 Debug - All sentiment values:", filteredQuotes.map(q => q.sentiment));
    
    return {
      totalQuotes: filteredQuotes.length,
      sentimentPercentages: sentimentPercentages,
      topTheme: calculateTopTheme(filteredQuotes),
      timeRange: calculateTimeRange(filteredQuotes),
      quotes: getQuoteSample(filteredQuotes),
      sentimentData: sentimentData,
      themeData: themeData,
      platformData: platformData
    };
  }, [filteredQuotes, sentimentData, themeData, platformData]);

  // Helper function to extract numeric volume from timeline strings
  const extractVolumeData = (timeline) => {
    return timeline.map(week => {
      let volume = 0;
      const volumeStr = week.volume;
      
      // Skip if volume is not provided
      if (volumeStr === '[NOT PROVIDED IN REPORT]' || !volumeStr) {
        return {
          week: week.week,
          weekRange: week.weekRange,
          volume: 0,
          event: week.event,
          sentiment: week.sentiment,
          keyReactions: week.keyReactions
        };
      }
      
      // Pattern 1: "~320 discussions (~40% of total quarter volume)"
      let match = volumeStr.match(/~(\d+)\s*discussions/);
      if (match) {
        volume = parseInt(match[1]);
      }
      
      // Pattern 2: "Estimated 800-1000 comments across platforms by end of April"
      if (!match) {
        match = volumeStr.match(/Estimated\s+(\d+)-(\d+)\s*comments/);
        if (match) {
          // Take the average of the range
          volume = Math.round((parseInt(match[1]) + parseInt(match[2])) / 2);
        }
      }
      
      // Pattern 3: "Steady moderate level (50-60% of peak)" - estimate based on context
      if (!match) {
        match = volumeStr.match(/\((\d+)-(\d+)%\s*of\s*peak\)/);
        if (match) {
          // Estimate as 50% of the France peak (320) for moderate level
          const avgPercent = (parseInt(match[1]) + parseInt(match[2])) / 2;
          volume = Math.round((320 * avgPercent) / 100);
        }
      }
      
      // Pattern 4: "Dipped to lowest (30% of March peak)" - estimate based on context
      if (!match) {
        match = volumeStr.match(/\((\d+)%\s*of\s*March\s*peak\)/);
        if (match) {
          // Estimate as percentage of France peak (320)
          volume = Math.round((320 * parseInt(match[1])) / 100);
        }
      }
      
      // Pattern 5: "Exploded again, approaching or exceeding initial March spike"
      if (!match && volumeStr.toLowerCase().includes('exploded') && volumeStr.toLowerCase().includes('march spike')) {
        volume = 320; // Same as March peak
      }
      
      // Pattern 6: "Remained high through second week of June"
      if (!match && volumeStr.toLowerCase().includes('remained high')) {
        volume = 120; // Estimate based on France week 10-11 levels
      }
      
      // Pattern 7: "Above April/May lull but tapered from early-June high"
      if (!match && volumeStr.toLowerCase().includes('above') && volumeStr.toLowerCase().includes('lull')) {
        volume = 80; // Estimate based on France week 11-12 levels
      }
      
      // Pattern 8: "Gradually slowing as pre-launch transitioned to sales phase"
      if (!match && volumeStr.toLowerCase().includes('gradually slowing')) {
        volume = 40; // Estimate based on France week 13 level
      }
      
      return {
        week: week.week,
        weekRange: week.weekRange,
        volume: volume,
        event: week.event,
        sentiment: week.sentiment,
        keyReactions: week.keyReactions
      };
    });
  };

  // Prepare volume data for line chart
  const volumeChartData = useMemo(() => {
    if (!filteredConsumerTimeline.length) return [];
    return extractVolumeData(filteredConsumerTimeline);
  }, [filteredConsumerTimeline]);

  // Check if we have valid volume data (not all zeros)
  const hasValidVolumeData = useMemo(() => {
    return volumeChartData.length > 0 && volumeChartData.some(week => week.volume > 0);
  }, [volumeChartData]);

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
    await generateInsights(filteredData, activeFilters, 'consumer-analysis', selectedMarket);
  };

  const handleToggleInsights = () => {
    console.log("🔍 handleToggleInsights called - Current showInsights:", showInsights);
    if (showInsights) {
      console.log("🔍 Clearing insights...");
      clearInsights();
    }
    console.log("🔍 Setting showInsights to:", !showInsights);
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

  // Update handleThemeClick to accept a theme object
  const handleThemeClick = (themeObj) => {
    if (themeObj && themeObj.fullTheme) {
      const quotes = consumerQuotes.filter(quote => quote.theme === themeObj.fullTheme);
      setDialogQuotes(quotes);
      setSelectedTheme(themeObj.fullTheme);
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

  // Handle line chart click to expand timeline and show specific week
  const handleLineChartClick = (data, index) => {
    console.log('Line chart clicked - data:', data, 'index:', index);
    
    // Recharts Line onClick can receive different data formats
    // Try to extract the week from various possible data structures
    let week = null;
    
    if (data && typeof data === 'object') {
      // If data is the actual data point object (this is what we're getting)
      if (data.week) {
        week = data.week;
      } else if (data.payload && data.payload.week) {
        // If data has a payload property
        week = data.payload.week;
      } else if (data.activePayload && data.activePayload[0] && data.activePayload[0].payload) {
        // If data has activePayload array
        week = data.activePayload[0].payload.week;
      } else if (data.activeLabel) {
        // If data has activeLabel (this is what we're getting from LineChart onClick)
        week = data.activeLabel;
      }
    }
    
    // If we still don't have a week, try to get it from the volumeChartData using the index
    // But first check if index is actually a number (not an event object)
    if (!week && typeof index === 'number' && volumeChartData[index]) {
      week = volumeChartData[index].week;
    }
    
    console.log('Extracted week:', week);
    
    if (week) {
      setExpandedWeek(week);
      setTimelineExpanded(true);
      console.log('Timeline expanded for week:', week);
    } else {
      console.log('Could not extract week from click data');
    }
  };

  // Add this before the return statement
  const weekRefs = useRef([]);

  useEffect(() => {
    if (timelineExpanded && expandedWeek && weekRefs.current) {
      const weekIndex = filteredConsumerTimeline.findIndex(w => w.week === expandedWeek);
      if (weekIndex !== -1 && weekRefs.current[weekIndex]) {
        weekRefs.current[weekIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [expandedWeek, timelineExpanded, filteredConsumerTimeline]);

  if (noData) {
    return (
      <Typography sx={{ fontFamily: 'BMW Motorrad' }}>
        No R 12 G/S consumer data available for {selectedMarket}.
      </Typography>
    );
  }

  return (
    <Box sx={{ 
      p: 3,
      backgroundColor: '#fafbfc',
      borderRadius: 2,
      border: '1px solid #e3f2fd'
    }}>
      {/* Model-Level Data Indicator */}
      <Alert 
        severity="info" 
        icon={<ModelTrainingIcon />}
        sx={{ 
          mb: 3, 
          backgroundColor: '#e3f2fd',
          border: '1px solid #1976d2',
          '& .MuiAlert-icon': {
            color: '#1976d2'
          }
        }}
      >
        <AlertTitle sx={{ fontFamily: 'BMW Motorrad', fontWeight: 'bold' }}>
          Model-Level Consumer Insights
        </AlertTitle>
        <Typography variant="body2" sx={{ mt: 1 }}>
          This analysis contains <strong>model-specific data</strong> for the BMW R 12 G/S, based on consumer conversations 
          and reactions specifically about this motorcycle model. This data is separate from the segment-level 
          insights shown in other dashboard sections (Executive Summary through Market Recommendations).
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Typography variant="h4" sx={{ fontFamily: 'BMW Motorrad', color: '#1a1a1a' }}>
          R 12 G/S Consumer Analysis
        </Typography>
        <Tooltip title="This section analyzes consumer conversations specifically about the BMW R 12 G/S model, providing model-level insights distinct from segment-level data.">
          <InfoOutlinedIcon sx={{ color: '#1976d2', cursor: 'help' }} />
        </Tooltip>
      </Box>

      {/* Mini Executive Summary (Dynamic Bullets) */}
      <Card elevation={4} sx={{ mb: 4, borderLeft: '6px solid #1976d2', background: 'linear-gradient(90deg, #e3f2fd 60%, #fff 100%)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontFamily: 'BMW Motorrad', color: '#1976d2', fontWeight: 'bold', mb: 1 }}>
            Mini Executive Summary
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 0, mt: 1 }}>
            {/* Top Reaction Theme */}
            <Box component="li" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <StarIcon sx={{ color: '#1976d2', mr: 1 }} />
              <Typography variant="body2" sx={{ fontFamily: 'BMW Motorrad', color: '#222' }}>
                Top theme: <b>{Object.keys(consumerReactionThemes)[0]}</b>
              </Typography>
            </Box>
            {/* Top Concern */}
            {filteredConsumerConcerns.length > 0 && (
              <Box component="li" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningAmberIcon sx={{ color: '#f44336', mr: 1 }} />
                <Typography variant="body2" sx={{ fontFamily: 'BMW Motorrad', color: '#222' }}>
                  Main concern: <b>{filteredConsumerConcerns[0].concern}</b>
                </Typography>
              </Box>
            )}
            {/* Sentiment Split */}
            <Box component="li" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmojiEmotionsIcon sx={{ color: '#4caf50', mr: 1 }} />
              <Typography variant="body2" sx={{ fontFamily: 'BMW Motorrad', color: '#222' }}>
                Sentiment: <b>{sentimentAnalysis.positive}% positive</b>, <b>{sentimentAnalysis.neutral}% neutral</b>, <b>{sentimentAnalysis.negative}% negative</b>
              </Typography>
            </Box>
            {/* Launch/Engagement Highlight */}
            {consumerTimeline.length > 0 && (
              <Box component="li" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ForumIcon sx={{ color: '#1976d2', mr: 1 }} />
                <Typography variant="body2" sx={{ fontFamily: 'BMW Motorrad', color: '#222' }}>
                  Launch highlight: <b>{consumerTimeline[0].event.replace(/\s*\([^)]*\)/, '')}</b> — Generated the highest engagement and excitement across forums and social media.
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Key Insights */}
      {filteredKeyInsights.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontFamily: 'BMW Motorrad', mb: 2, color: '#1a1a1a' }}>
            Key Insights
          </Typography>
          {filteredKeyInsights.map(([insight, content], index) => (
            <Accordion key={index} sx={{ mb: 1, borderRadius: 2, boxShadow: 1, background: '#f8f9fa', '&:before': { display: 'none' } }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: '#1976d2' }} />}
                sx={{
                  backgroundColor: '#e3f2fd',
                  borderRadius: 2,
                  '& .MuiAccordionSummary-content': {
                    fontFamily: 'BMW Motorrad',
                    fontWeight: 'bold',
                    color: '#1976d2',
                  }
                }}
              >
                {insight}
              </AccordionSummary>
              <AccordionDetails sx={{ background: '#fff', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.6, color: '#424242', fontFamily: 'BMW Motorrad' }}>
                  {content}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
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
        showInsights={showInsights}
        onToggleInsights={handleToggleInsights}
        onGenerateInsights={handleGenerateInsights}
        loading={loading}
        filteredData={filteredData}
        insights={insights}
        error={error}
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
                // Removed onClick handler here
              >
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={themeData}>
                    <PolarGrid />
                    <PolarAngleAxis 
                      dataKey="subject"
                      tick={({ payload, x, y, textAnchor, ...rest }) => (
                        <text
                          x={x}
                          y={y}
                          textAnchor={textAnchor}
                          {...rest}
                          style={{ cursor: 'pointer', fontWeight: 'bold', fill: '#333' }}
                          onClick={() => {
                            const themeObj = themeData[payload.index]; // Use index for correct mapping
                            if (themeObj) handleThemeClick(themeObj);
                          }}
                        >
                          {payload.value}
                        </text>
                      )}
                    />
                    <PolarRadiusAxis angle={90} domain={[0, 25]} />
                    <Radar
                      name="Themes"
                      dataKey="A"
                      stroke="#1976d2"
                      fill="#1976d2"
                      fillOpacity={0.3}
                      // Removed onClick from Radar
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </Box>
              <Typography variant="caption" sx={{ color: '#666', mt: 1, display: 'block' }}>
                Click anywhere on the chart to view all quotes, or hover for theme details
              </Typography>
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
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
          {/* Conversation Volume Line Chart */}
          {hasValidVolumeData && (
            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontFamily: 'BMW Motorrad', mb: 2, color: '#1a1a1a' }}>
                    Conversation Volume Over Time (Click on points to view timeline details)
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart 
                      data={volumeChartData.filter(week => week.volume > 0)}
                      onClick={(data, index) => {
                        console.log('LineChart clicked!', data, index);
                        if (data && data.activeLabel) {
                          // Pass the week data directly
                          const weekData = volumeChartData.find(w => w.week === data.activeLabel);
                          if (weekData) {
                            handleLineChartClick(weekData, data.activeLabel);
                          }
                        }
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="week" 
                        label={{ value: 'Week', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        label={{ value: 'Discussion Volume', angle: -90, position: 'insideLeft' }}
                      />
                      <RechartsTooltip 
                        formatter={(value, name) => [value, 'Discussions']}
                        labelFormatter={(label) => {
                          const weekData = volumeChartData.find(w => w.week === label);
                          return weekData ? `Week ${label} (${weekData.weekRange})` : `Week ${label}`;
                        }}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const weekData = volumeChartData.find(w => w.week === label);
                            return (
                              <Box sx={{ 
                                backgroundColor: 'white', 
                                border: '1px solid #ccc', 
                                p: 2, 
                                borderRadius: 1,
                                boxShadow: 2
                              }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                  Week {label} ({weekData?.weekRange})
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  <strong>Volume:</strong> {payload[0].value} discussions
                                </Typography>
                                {weekData?.event && (
                                  <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#666', mb: 1 }}>
                                    <strong>Event:</strong> {weekData.event}
                                  </Typography>
                                )}
                                <Typography variant="caption" sx={{ color: '#1976d2', fontStyle: 'italic' }}>
                                  Click to view timeline details
                                </Typography>
                              </Box>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="volume" 
                        stroke="#1976d2" 
                        strokeWidth={3}
                        dot={{ 
                          fill: '#1976d2', 
                          strokeWidth: 2, 
                          r: 6,
                          onClick: (data, index) => {
                            console.log('Dot clicked!', data, index);
                            handleLineChartClick(data, index);
                          }
                        }}
                        activeDot={{ 
                          r: 8, 
                          stroke: '#1976d2', 
                          strokeWidth: 2,
                          onClick: (data, index) => {
                            console.log('Active dot clicked!', data, index);
                            handleLineChartClick(data, index);
                          }
                        }}
                        name="Discussion Volume"
                        style={{ cursor: 'pointer' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Accordion 
              expanded={timelineExpanded} 
              onChange={() => setTimelineExpanded(!timelineExpanded)}
              sx={{ 
                '&:before': { display: 'none' },
                boxShadow: timelineExpanded ? 3 : 1
              }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  backgroundColor: timelineExpanded ? '#f5f5f5' : 'white',
                  '&:hover': { backgroundColor: '#f0f0f0' }
                }}
              >
                <Typography variant="h6" sx={{ fontFamily: 'BMW Motorrad', color: '#1a1a1a' }}>
                  Consumer Timeline {expandedWeek && `(Week ${expandedWeek} selected)`}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <Card elevation={0}>
                  <CardContent>
                    <Box sx={{ position: 'relative' }}>
                      {filteredConsumerTimeline.map((week, index) => (
                        <Box 
                          key={index} 
                          ref={el => weekRefs.current[index] = el}
                          sx={{ 
                            display: 'flex', 
                            mb: 3, 
                            position: 'relative',
                            backgroundColor: expandedWeek === week.week ? '#e3f2fd' : 'transparent',
                            borderRadius: expandedWeek === week.week ? 2 : 0,
                            p: expandedWeek === week.week ? 2 : 0,
                            border: expandedWeek === week.week ? '2px solid #1976d2' : 'none',
                            '&:not(:last-child)::after': {
                              content: '""',
                              position: 'absolute',
                              left: 20,
                              top: 40,
                              bottom: -20,
                              width: 2,
                              backgroundColor: expandedWeek === week.week ? '#1976d2' : '#e0e0e0'
                            }
                          }}
                        >
                          <Box sx={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: '50%', 
                            backgroundColor: expandedWeek === week.week ? '#1976d2' : '#1976d2', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mr: 2,
                            flexShrink: 0,
                            boxShadow: expandedWeek === week.week ? 2 : 0
                          }}>
                            <TimelineIcon sx={{ color: 'white' }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ 
                              fontFamily: 'BMW Motorrad', 
                              color: expandedWeek === week.week ? '#1976d2' : '#1976d2',
                              mb: 1,
                              fontWeight: expandedWeek === week.week ? 'bold' : 'normal'
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
              </AccordionDetails>
            </Accordion>
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
