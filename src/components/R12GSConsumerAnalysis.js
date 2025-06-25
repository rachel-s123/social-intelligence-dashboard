import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import ThemeCharts from './ThemeCharts';
import SentimentTimeline from './SentimentTimeline';
import QuoteExplorer from './QuoteExplorer';
import PurchaseIntentFunnel from './PurchaseIntentFunnel';
import CompetitiveIntelCharts from './CompetitiveIntelCharts';
import PlatformAnalysis from './PlatformAnalysis';

const R12GSConsumerAnalysis = ({ selectedMarket, data }) => {
  const marketKey = selectedMarket.toLowerCase();
  const marketData = data[marketKey] || {};
  const noData = !data[marketKey];

  const {
    keyInsights = {},
    consumerTimeline = [],
    consumerQuotes = [],
    consumerConcerns = []
  } = marketData;

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

  const themeData = useMemo(() => {
    const counts = {};
    filteredQuotes.forEach((q) => {
      counts[q.theme] = (counts[q.theme] || 0) + 1;
    });
    return Object.entries(counts).map(([theme, count]) => ({
      subject: theme.length > 20 ? theme.substring(0, 20) + '...' : theme,
      A: count,
      fullMark: Math.max(...Object.values(counts), 1)
    }));
  }, [filteredQuotes]);

  const platformData = useMemo(() => {
    const counts = {};
    filteredQuotes.forEach((q) => {
      counts[q.platform] = (counts[q.platform] || 0) + 1;
    });
    return Object.entries(counts).map(([platform, count]) => ({
      platform,
      value: count
    }));
  }, [filteredQuotes]);

  const purchaseIntentData = useMemo(() => {
    const counts = {};
    filteredQuotes.forEach((q) => {
      counts[q.purchaseIntent] = (counts[q.purchaseIntent] || 0) + 1;
    });
    return Object.entries(counts).map(([intent, count]) => ({ intent, count }));
  }, [filteredQuotes]);

  const competitorData = useMemo(() => {
    const counts = {};
    filteredQuotes.forEach((q) => {
      if (q.competitorMentioned && q.competitorMentioned !== 'NONE') {
        counts[q.competitorMentioned] = (counts[q.competitorMentioned] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([competitor, count]) => ({ competitor, count }));
  }, [filteredQuotes]);

  const parseSentiment = (text) => {
    const result = { positive: 0, neutral: 0, negative: 0 };
    if (!text) return result;
    const regex = /(\d+)%\s*(positive|negative|neutral)/gi;
    let m;
    while ((m = regex.exec(text))) {
      result[m[2].toLowerCase()] = parseInt(m[1], 10);
    }
    return result;
  };

  const timelineData = useMemo(() => {
    return consumerTimeline.map((w) => ({
      week: w.week,
      ...parseSentiment(w.sentiment)
    }));
  }, [consumerTimeline]);

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

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <ThemeCharts data={themeData} />
        </Grid>
        <Grid item xs={12} md={6}>
          <PlatformAnalysis data={platformData} />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <PurchaseIntentFunnel data={purchaseIntentData} />
        </Grid>
        <Grid item xs={12} md={6}>
          <CompetitiveIntelCharts data={competitorData} />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <SentimentTimeline data={timelineData} />
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
