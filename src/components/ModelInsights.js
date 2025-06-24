import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Card, CardContent } from '@mui/material';
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
  YAxis,
  LineChart,
  Line
} from 'recharts';
import { modelInsights } from '../data/modelInsights';

const SENTIMENT_COLORS = {
  Positive: '#48b83c',
  Negative: '#e63329',
  Neutral: '#666666'
};

const ModelInsights = ({ selectedModel }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (selectedModel) {
      setData(modelInsights[selectedModel] || null);
    }
  }, [selectedModel]);

  if (!data) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No insights available for {selectedModel}.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} gutterBottom color="primary.main">
        Model Insights
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Analysis of conversations and market data for {selectedModel}
      </Typography>

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom color="primary.main">
              Theme Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={data.themes}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis />
                <Radar dataKey="value" stroke="#0066B1" fill="#0066B1" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom color="primary.main">
              Sentiment
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.sentiment} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} (${Math.round(percent * 100)}%)`}>
                  {data.sentiment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[entry.name] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom color="primary.main">
          Platform Distribution
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.platforms}>
            <XAxis dataKey="name" />
            <YAxis />
            <Bar dataKey="value" fill="#0066B1" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {data.keyMetrics && (
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom color="primary.main">
            Key Metrics
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(data.keyMetrics).map(([metric, value]) => (
              <Grid item xs={12} md={3} key={metric}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      {metric}
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {data.quotes && data.quotes.length > 0 && (
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom color="primary.main">
            Direct Quotes
          </Typography>
          {data.quotes.map((q, idx) => (
            <Box key={idx} sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                "{q.quote}"
              </Typography>
              {q.source && (
                <Typography variant="caption" color="text.secondary">
                  {q.source}
                </Typography>
              )}
            </Box>
          ))}
        </Paper>
      )}

      {data.competitiveMentions && data.competitiveMentions.length > 0 && (
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom color="primary.main">
            Competitive Mentions
          </Typography>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            {data.competitiveMentions.map((item, idx) => (
              <li key={idx}>
                <Typography variant="body2">{item}</Typography>
              </li>
            ))}
          </ul>
        </Paper>
      )}

      {data.timeline && data.timeline.length > 0 && (
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom color="primary.main">
            Timeline
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.timeline} margin={{ left: 20, right: 20 }}>
              <XAxis dataKey="date" />
              <YAxis hide />
              <Tooltip />
              <Line type="monotone" dataKey="event" stroke="#0066B1" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {data.recommendations && data.recommendations.length > 0 && (
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom color="primary.main">
            Recommendations
          </Typography>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            {data.recommendations.map((rec, idx) => (
              <li key={idx}>
                <Typography variant="body2">{rec}</Typography>
              </li>
            ))}
          </ul>
        </Paper>
      )}
    </Box>
  );
};

export default ModelInsights;
