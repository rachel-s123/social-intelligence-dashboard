import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Fade, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import ForumIcon from '@mui/icons-material/Forum';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { modelInsights } from '../data/modelInsights';
import TopInsightsSection from './TopInsightsSection';
import MarketAnalysisSection from './MarketAnalysisSection';

const SENTIMENT_COLORS = {
  Positive: '#48b83c',
  Negative: '#e63329',
  Neutral: '#666666'
};

const SENTIMENT_ICONS = {
  Positive: '😊',
  Negative: '😞',
  Neutral: '😐'
};

const PLATFORM_COLORS = {
  'Reddit (r/motorcycles, r/motorrad, etc.)': '#FF4500',
  'ADVrider Forum': '#FF6B35',
  'Facebook Groups': '#1877F2',
  'Instagram Comments': '#E4405F',
  'YouTube Comments': '#FF0000',
  'Other Forums': '#666666'
};

const PLATFORM_ICONS = {
  reddit: <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/reddit.svg" alt="Reddit" style={{ width: 28, height: 28 }} />,
  facebook: <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg" alt="Facebook" style={{ width: 28, height: 28 }} />, 
  youtube: <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/youtube.svg" alt="YouTube" style={{ width: 28, height: 28 }} />, 
  advrider: <ForumIcon sx={{ color: '#FF6B35', fontSize: 28 }} />,
  forum: <ForumIcon sx={{ color: '#666', fontSize: 28 }} />,
  default: <ForumIcon color="primary" sx={{ fontSize: 28 }} />
};

const NavigationMenu = ({ sections, activeSection, onSectionClick }) => {
  return (
    <Paper 
      sx={{ 
        position: 'sticky',
        top: 20,
        maxHeight: 'calc(100vh - 40px)',
        overflowY: 'auto',
        borderRadius: 2,
        boxShadow: 3
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" color="primary.main" fontWeight={600}>
          Sections
        </Typography>
      </Box>
      <List sx={{ py: 0 }}>
        {sections.map((section, index) => (
          <React.Fragment key={section.id}>
            <ListItem disablePadding>
              <ListItemButton
                selected={activeSection === section.id}
                onClick={() => onSectionClick(section.id)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {section.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={section.title}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: activeSection === section.id ? 600 : 400
                  }}
                />
              </ListItemButton>
            </ListItem>
            {index < sections.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

const ThemeDistributionSection = ({ data, consumerInsights }) => {
  const [selectedTheme, setSelectedTheme] = useState(null);

  if (!data || (!data.copy && (!data.data || data.data.length === 0))) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" color="primary.main">Theme Distribution</Typography>
        <Typography color="text.secondary">No theme distribution data available.</Typography>
      </Paper>
    );
  }

  const handleThemeClick = (themeName) => {
    // Special handling for "Other themes"
    if (themeName === "Other themes") {
      setSelectedTheme({
        theme: "Other themes",
        quotes: [],
        isOtherThemes: true
      });
      return;
    }

    // Find the theme in consumerInsights with fuzzy matching
    const themeData = consumerInsights?.quotesByTheme?.find(theme => {
      // Exact match
      if (theme.theme === themeName) return true;
      
      // Handle variations like "Heritage/Retro Styling Reactions" vs "Heritage/Retro Styling"
      const normalizedThemeName = themeName.replace(/\s+(Reactions|Statements|Discussion)$/, '');
      const normalizedTheme = theme.theme.replace(/\s+(Reactions|Statements|Discussion)$/, '');
      
      return normalizedThemeName === normalizedTheme;
    });
    
    if (themeData) {
      setSelectedTheme(themeData);
    } else {
      console.warn(`No quotes found for theme: ${themeName}`);
      // Try to find partial matches
      const partialMatch = consumerInsights?.quotesByTheme?.find(theme => 
        themeName.includes(theme.theme) || theme.theme.includes(themeName)
      );
      if (partialMatch) {
        setSelectedTheme(partialMatch);
      } else {
        // Show a message for themes without quotes
        setSelectedTheme({
          theme: themeName,
          quotes: [],
          noQuotes: true
        });
      }
    }
  };

  const ThemeQuotesCard = ({ themeData }) => {
    if (!themeData || !themeData.quotes || !Array.isArray(themeData.quotes)) {
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
                No quotes available for this theme
              </Typography>
            </CardContent>
          </Card>
        </Fade>
      );
    }

    // Handle "Other themes" case
    if (themeData.isOtherThemes) {
      return (
        <Fade in={true}>
          <Card sx={{ 
            borderRadius: 1.5,
            border: '2px solid',
            borderColor: 'warning.main',
            boxShadow: 3
          }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="warning.main">
                Other themes (10% of discussions)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This category represents miscellaneous consumer discussions that don't fit into the main theme categories. 
                These include general comments, off-topic discussions, and other varied consumer feedback about the R 12 G/S.
              </Typography>
            </CardContent>
          </Card>
        </Fade>
      );
    }

    // Handle themes without quotes
    if (themeData.noQuotes) {
      return (
        <Fade in={true}>
          <Card sx={{ 
            borderRadius: 1.5,
            border: '2px solid',
            borderColor: 'info.main',
            boxShadow: 3
          }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="info.main">
                {themeData.theme}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This theme represents {themeData.theme.toLowerCase()} discussions, but no specific quotes are available for this category.
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
              {themeData.theme}
            </Typography>
            {themeData.quotes.map((quote, index) => (
              <Box key={index} sx={{ mb: 1.5, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.primary' }}>
                  "{quote.quote}"
                </Typography>
                {quote.insight && (
                  <Typography variant="body2" color="primary.main" sx={{ mt: 0.5, fontWeight: 500 }}>
                    <strong>Insight:</strong> {quote.insight}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {SENTIMENT_ICONS[quote.sentiment]} {quote.sentiment}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    • {quote.platform}
                  </Typography>
                  {quote.username && 
                   quote.username !== "[Not specified in report]" && 
                   quote.username !== "[User identified in report]" && 
                   quote.username.trim() !== "" && (
                    <Typography variant="caption" color="text.secondary">
                      • {quote.username}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Fade>
    );
  };

  return (
    <Paper sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 2 }}>
      <Typography variant="h6" color="primary.main" gutterBottom>Theme Distribution</Typography>
      {data.copy && (
        <Typography color="text.secondary" sx={{ mb: 2 }}>{data.copy}</Typography>
      )}
      <Typography 
        variant="caption" 
        color="text.secondary" 
        sx={{ textAlign: 'center', display: 'block', mb: 2, fontStyle: 'italic', fontSize: '0.9em' }}
      >
        Click on a theme in the radar chart to view consumer quotes
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {data.data && data.data.length > 0 && (
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={data.data}>
                <PolarGrid />
                <PolarAngleAxis 
                  dataKey="name"
                  onClick={(e) => handleThemeClick(e.value)}
                  style={{ cursor: 'pointer' }}
                />
                <PolarRadiusAxis />
                <Radar dataKey="value" stroke="#0066B1" fill="#0066B1" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            {selectedTheme ? (
              <ThemeQuotesCard themeData={selectedTheme} />
            ) : (
              <Card sx={{ borderRadius: 1.5, bgcolor: 'background.default', width: '100%', maxWidth: 420 }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Select a theme from the radar chart to view consumer quotes
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

const SentimentDistributionSection = ({ data, consumerInsights }) => {
  const [selectedSentiment, setSelectedSentiment] = useState(null);

  if (!data || (!data.copy && (!data.data || data.data.length === 0))) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" color="primary.main">Sentiment Distribution</Typography>
        <Typography color="text.secondary">No sentiment distribution data available.</Typography>
      </Paper>
    );
  }

  const handleSentimentClick = (sentimentName) => {
    // Collect all quotes with the selected sentiment from all themes
    const quotesWithSentiment = [];
    
    consumerInsights?.quotesByTheme?.forEach(theme => {
      theme.quotes.forEach(quote => {
        if (quote.sentiment === sentimentName) {
          quotesWithSentiment.push({
            ...quote,
            theme: theme.theme
          });
        }
      });
    });

    if (quotesWithSentiment.length > 0) {
      setSelectedSentiment({
        sentiment: sentimentName,
        quotes: quotesWithSentiment
      });
    } else {
      console.warn(`No quotes found for sentiment: ${sentimentName}`);
      setSelectedSentiment({
        sentiment: sentimentName,
        quotes: [],
        noQuotes: true
      });
    }
  };

  const SentimentQuotesCard = ({ sentimentData }) => {
    if (!sentimentData || !sentimentData.quotes || !Array.isArray(sentimentData.quotes)) {
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
                No quotes available for this sentiment
              </Typography>
            </CardContent>
          </Card>
        </Fade>
      );
    }

    if (sentimentData.noQuotes) {
      return (
        <Fade in={true}>
          <Card sx={{ 
            borderRadius: 1.5,
            border: '2px solid',
            borderColor: 'info.main',
            boxShadow: 3
          }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="info.main">
                {sentimentData.sentiment} Sentiment
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No specific quotes are available for {sentimentData.sentiment.toLowerCase()} sentiment.
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
          boxShadow: 3,
          height: 320,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <CardContent sx={{ p: 2, flex: 1, overflow: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontSize: '1.5rem', mr: 1 }}>
                {SENTIMENT_ICONS[sentimentData.sentiment]}
              </Typography>
              <Typography variant="subtitle1" fontWeight={600} color="primary.main">
                {sentimentData.sentiment} Sentiment ({sentimentData.quotes.length} quotes)
              </Typography>
            </Box>
            {sentimentData.quotes.map((quote, index) => (
              <Box key={index} sx={{ mb: 1.5, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.primary' }}>
                  "{quote.quote}"
                </Typography>
                {quote.insight && (
                  <Typography variant="body2" color="primary.main" sx={{ mt: 0.5, fontWeight: 500 }}>
                    <strong>Insight:</strong> {quote.insight}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Theme: {quote.theme}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    • {quote.platform}
                  </Typography>
                  {quote.username && 
                   quote.username !== "[Not specified in report]" && 
                   quote.username !== "[User identified in report]" && 
                   quote.username.trim() !== "" && (
                    <Typography variant="caption" color="text.secondary">
                      • {quote.username}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Fade>
    );
  };

  return (
    <Paper sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 2 }}>
      <Typography variant="h6" color="primary.main" gutterBottom>Sentiment Distribution</Typography>
      {data.copy && (
        <Typography color="text.secondary" sx={{ mb: 2 }}>{data.copy}</Typography>
      )}
      <Typography 
        variant="caption" 
        color="text.secondary" 
        sx={{ textAlign: 'center', display: 'block', mb: 2, fontStyle: 'italic', fontSize: '0.9em' }}
      >
        Click on a sentiment in the pie chart to view consumer quotes
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {data.data && data.data.length > 0 && (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={data.data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, percent }) => `${name} (${Math.round(percent * 100)}%)`}
                  onClick={(entry) => handleSentimentClick(entry.name)}
                  style={{ cursor: 'pointer' }}
                >
                  {data.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[entry.name] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            {selectedSentiment ? (
              <SentimentQuotesCard sentimentData={selectedSentiment} />
            ) : (
              <Card sx={{ borderRadius: 1.5, bgcolor: 'background.default', width: '100%', maxWidth: 420 }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Select a sentiment from the pie chart to view consumer quotes
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

const PlatformDistributionSection = ({ data }) => {
  if (!data || (!data.copy && (!data.data || data.data.length === 0))) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" color="primary.main">Platform Distribution</Typography>
        <Typography color="text.secondary">No platform distribution data available.</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 2 }}>
      <Typography variant="h6" color="primary.main" gutterBottom>Platform Distribution</Typography>
      {data.copy && (
        <Typography color="text.secondary" sx={{ mb: 2 }}>{data.copy}</Typography>
      )}
      
      {data.data && data.data.length > 0 && (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data.data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#0066B1">
              {data.data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={PLATFORM_COLORS[entry.name] || '#0066B1'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

function parsePost(post) {
  // Try to extract platform, title, engagement, and url
  let platform = 'default';
  let url = '';
  let title = post;
  let engagement = '';

  // Platform detection
  if (/reddit/i.test(post)) platform = 'reddit';
  else if (/facebook/i.test(post)) platform = 'facebook';
  else if (/youtube/i.test(post)) platform = 'youtube';
  else if (/advrider/i.test(post)) platform = 'advrider';
  else if (/forum/i.test(post)) platform = 'forum';

  // URL extraction
  const urlMatch = post.match(/https?:\/\/\S+/);
  if (urlMatch) url = urlMatch[0];

  // Engagement extraction (e.g., 70+ comments, 100k views)
  const engagementMatch = post.match(/([\d,.]+\+? (comments|views|replies))/i);
  if (engagementMatch) engagement = engagementMatch[0];

  // Title: remove url and engagement
  title = post.replace(url, '').replace(engagement, '').trim();

  return { platform, title, engagement, url };
}

const MostEngagedSection = ({ keyMetrics }) => {
  if (!keyMetrics || !keyMetrics.topPosts || keyMetrics.topPosts.length === 0) {
    return null;
  }

  // Robust merging: always append engagement lines to the last post, even at the end
  const mergedPosts = [];
  let lastPost = '';
  let engagementBuffer = '';
  keyMetrics.topPosts.forEach((post, idx) => {
    const isEngagement = /^\s*([\d,.]+\+? (comments|views|replies))\s*\)?$/i.test(post);
    if (isEngagement) {
      engagementBuffer += ' ' + post.trim();
      // If this is the last line, append buffer to lastPost
      if (idx === keyMetrics.topPosts.length - 1 && lastPost) {
        mergedPosts.push(lastPost + engagementBuffer);
        lastPost = '';
        engagementBuffer = '';
      }
    } else {
      if (lastPost) {
        mergedPosts.push(lastPost + engagementBuffer);
        engagementBuffer = '';
      }
      lastPost = post;
      // If this is the last line and not engagement, push it
      if (idx === keyMetrics.topPosts.length - 1) {
        mergedPosts.push(lastPost + engagementBuffer);
        lastPost = '';
        engagementBuffer = '';
      }
    }
  });

  // Helper to clean up empty brackets/parentheses
  function cleanTitle(title) {
    return title.replace(/\(\s*\)/g, '').replace(/\[\s*\]/g, '').replace(/\s{2,}/g, ' ').trim();
  }

  return (
    <Paper sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 2 }}>
      <Typography variant="h6" color="primary.main" gutterBottom>Most Engaged Posts & Threads</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        The most active and discussed posts/threads about the R 12 G/S across platforms:
      </Typography>
      <Grid container spacing={2}>
        {mergedPosts.map((post, idx) => {
          const { platform, title, engagement, url } = parsePost(post);
          return (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', '&:hover': { boxShadow: 4, borderColor: 'primary.main' }, transition: 'all 0.2s' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {PLATFORM_ICONS[platform] || PLATFORM_ICONS.default}
                    <Typography variant="subtitle2" sx={{ ml: 1, fontWeight: 600, flex: 1 }}>
                      {cleanTitle(title)}
                    </Typography>
                  </Box>
                  {engagement && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="primary" sx={{ fontWeight: 700 }}>
                        {engagement}
                      </Typography>
                    </Box>
                  )}
                  {url && (
                    <Box>
                      <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                        <Typography variant="body2" color="secondary" sx={{ fontWeight: 500 }}>
                          View Post
                        </Typography>
                      </a>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
};

const SegmentationSection = ({ segmentation }) => {
  if (!segmentation || segmentation.length === 0) return null;
  return (
    <Paper sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 2 }}>
      <Typography variant="h6" color="primary.main" gutterBottom>Consumer Voice Segmentation</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Key consumer segments and their perspectives on the R 12 G/S:
      </Typography>
      <Grid container spacing={2}>
        {segmentation.map((seg, idx) => (
          <Grid item xs={12} md={6} key={idx}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', '&:hover': { boxShadow: 4, borderColor: 'primary.main' }, transition: 'all 0.2s' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} color="primary.main" gutterBottom>
                  {seg.segment}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <b>Size:</b> {seg.size}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <b>Characteristics:</b> {seg.characteristics}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <b>Sentiment:</b> {seg.sentiment}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <b>Concerns:</b> {seg.concerns}
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'success.dark', mt: 2 }}>
                  "{seg.quote}"
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

const RecommendationsSection = ({ recommendations }) => {
  if (!recommendations || !recommendations.strategy || !recommendations.content || !recommendations.targeting) {
    return null;
  }

  return (
    <Paper sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 2 }}>
      <Typography variant="h6" color="primary.main" gutterBottom>Recommendations</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', background: '#f8fafc' }}>
            <CardContent>
              <Typography variant="h6" color="primary.main" gutterBottom>Strategy Positioning</Typography>
              <List dense>
                {recommendations.strategy.map((item, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText 
                      primary={item}
                      primaryTypographyProps={{ fontSize: '0.9rem' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', background: '#f8fafc' }}>
            <CardContent>
              <Typography variant="h6" color="primary.main" gutterBottom>Content & Messaging</Typography>
              <List dense>
                {recommendations.content.map((item, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText 
                      primary={item}
                      primaryTypographyProps={{ fontSize: '0.9rem' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', background: '#f8fafc' }}>
            <CardContent>
              <Typography variant="h6" color="primary.main" gutterBottom>Targeting</Typography>
              <List dense>
                {recommendations.targeting.map((item, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText 
                      primary={item}
                      primaryTypographyProps={{ fontSize: '0.9rem' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

const CompetitiveMentionsSection = ({ competitiveMentions }) => {
  if (!competitiveMentions || competitiveMentions.length === 0) {
    return null;
  }

  return (
    <Paper sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 2 }}>
      <Typography variant="h6" color="primary.main" gutterBottom>Competitive Mentions in Consumer Discussions</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        How consumers compare the R 12 G/S to competing models in their discussions.
      </Typography>
      
      <Grid container spacing={3}>
        {competitiveMentions.map((competitor, index) => (
          <Grid item xs={12} key={index}>
            <Card sx={{ background: '#f8fafc' }}>
              <CardContent>
                <Typography variant="h6" color="primary.main" gutterBottom>
                  {competitor.competitor}
                </Typography>
                
                {competitor.quotes.map((quote, quoteIndex) => (
                  <Box key={quoteIndex} sx={{ mb: 2, p: 2, background: 'white', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1 }}>
                      "{quote.quote}"
                    </Typography>
                    
                    <Grid container spacing={1} sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption">
                          <strong>User:</strong> {quote.username} | <strong>Platform:</strong> {quote.platform}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption">
                          <strong>Date:</strong> {quote.date} | <strong>Sentiment:</strong> 
                          <span style={{ 
                            color: SENTIMENT_COLORS[quote.sentiment] || '#666',
                            fontWeight: 'bold',
                            marginLeft: '4px'
                          }}>
                            {quote.sentiment}
                          </span>
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                          <strong>Insight:</strong> {quote.insight}
                        </Typography>
                      </Grid>
                      {quote.url && quote.url !== '[Referenced as forum-auto discussion]' && (
                        <Grid item xs={12}>
                          <Typography variant="caption">
                            <strong>Source:</strong> 
                            <a 
                              href={quote.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: 'primary.main', textDecoration: 'none', marginLeft: '4px' }}
                            >
                              View discussion
                            </a>
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

const ModelInsights = ({ selectedMarket, selectedModel }) => {
  // Debug test render
  console.log('ModelInsights component called with:', { selectedMarket, selectedModel });
  
  const [activeSection, setActiveSection] = useState('top-insights');
  const [data, setData] = useState(null);
  
  // Debug logging
  console.log('ModelInsights useEffect triggered:', { selectedMarket, selectedModel });
  
  useEffect(() => {
    console.log('ModelInsights useEffect triggered:', { selectedMarket, selectedModel });
    
    if (selectedMarket && selectedModel) {
      // Normalize function: lowercase, remove spaces and dashes
      const normalize = str => str.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
      const lookupKey = Object.keys(modelInsights).find(
        k => normalize(k) === normalize(`${selectedMarket}-${selectedModel}`)
      );
      console.log('Looking for data with normalized key:', normalize(`${selectedMarket}-${selectedModel}`));
      console.log('Available keys in modelInsights:', Object.keys(modelInsights));
      console.log('Matched lookupKey:', lookupKey);
      const modelData = lookupKey ? modelInsights[lookupKey] : undefined;
      console.log('Found model data:', modelData);
      
      if (modelData) {
        setData(modelData);
      } else {
        console.warn('No data found for key:', lookupKey);
        setData(null);
      }
    } else {
      console.log('Missing market or model selection');
      setData(null);
    }
  }, [selectedMarket, selectedModel]);

  // Debug logging for data state
  console.log('Current data state:', data);

  // Refs for each section
  const themeRef = useRef(null);
  const sentimentRef = useRef(null);
  const platformRef = useRef(null);
  const topInsightsRef = useRef(null);
  const marketAnalysisRef = useRef(null);
  const mostEngagedRef = useRef(null);
  const segmentationRef = useRef(null);
  const recommendationsRef = useRef(null);
  const competitiveMentionsRef = useRef(null);

  // Navigation sections configuration
  const sections = [
    {
      id: 'topInsights',
      title: 'Top Insights',
      icon: <LightbulbIcon color="primary" />
    },
    {
      id: 'theme',
      title: 'Theme Distribution',
      icon: <TrendingUpIcon color="primary" />
    },
    {
      id: 'sentiment',
      title: 'Sentiment Distribution',
      icon: <SentimentSatisfiedAltIcon color="primary" />
    },
    {
      id: 'platform',
      title: 'Platform Distribution',
      icon: <ForumIcon color="primary" />
    },
    {
      id: 'marketAnalysis',
      title: 'Market Analysis',
      icon: <AnalyticsIcon color="primary" />
    },
    {
      id: 'mostEngaged',
      title: 'Most Engaged Posts & Threads',
      icon: <ForumIcon color="primary" />
    },
    {
      id: 'segmentation',
      title: 'Consumer Voice Segmentation',
      icon: <SentimentSatisfiedAltIcon color="primary" />
    },
    {
      id: 'competitiveMentions',
      title: 'Competitive Mentions',
      icon: <ForumIcon color="primary" />
    },
    {
      id: 'recommendations',
      title: 'Recommendations',
      icon: <LightbulbIcon color="primary" />
    }
  ];

  // Section refs mapping
  const sectionRefs = {
    topInsights: topInsightsRef,
    theme: themeRef,
    sentiment: sentimentRef,
    platform: platformRef,
    marketAnalysis: marketAnalysisRef,
    mostEngaged: mostEngagedRef,
    segmentation: segmentationRef,
    competitiveMentions: competitiveMentionsRef,
    recommendations: recommendationsRef
  };

  // Handle section navigation
  const handleSectionClick = (sectionId) => {
    const ref = sectionRefs[sectionId];
    if (ref && ref.current) {
      ref.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      setActiveSection(sectionId);
    }
  };

  // Track active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Offset for sticky nav
      
      Object.entries(sectionRefs).forEach(([sectionId, ref]) => {
        if (ref && ref.current) {
          const element = ref.current;
          const elementTop = element.offsetTop;
          const elementBottom = elementTop + element.offsetHeight;
          
          if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
            setActiveSection(sectionId);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!data) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No insights available for {selectedModel} in {selectedMarket}.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', display: 'flex', gap: 3 }}>
      {/* Left Navigation */}
      <Box sx={{ flexShrink: 0, width: 280 }}>
        <NavigationMenu 
          sections={sections}
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
        />
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom color="primary.main" sx={{ mb: 4 }}>
          Model Insights
        </Typography>
        
        <div ref={topInsightsRef}>
          <TopInsightsSection data={data} />
        </div>
        
        <div ref={themeRef}>
          <ThemeDistributionSection 
            data={data.themeDistribution} 
            consumerInsights={data.consumerInsights} 
          />
        </div>
        
        <div ref={sentimentRef}>
          <SentimentDistributionSection 
            data={data.sentimentDistribution} 
            consumerInsights={data.consumerInsights} 
          />
        </div>
        
        <div ref={platformRef}>
          <PlatformDistributionSection data={data.platformDistribution} />
        </div>
        
        <div ref={marketAnalysisRef}>
          <MarketAnalysisSection data={data} />
        </div>
        
        <div ref={mostEngagedRef}>
          <MostEngagedSection keyMetrics={data.keyMetrics} />
        </div>
        
        <div ref={segmentationRef}>
          <SegmentationSection segmentation={data.segmentation} />
        </div>
        
        <div ref={competitiveMentionsRef}>
          <CompetitiveMentionsSection competitiveMentions={data.competitiveMentions} />
        </div>
        
        <div ref={recommendationsRef}>
          <RecommendationsSection recommendations={data.recommendations} />
        </div>
      </Box>
    </Box>
  );
};

export default ModelInsights;
