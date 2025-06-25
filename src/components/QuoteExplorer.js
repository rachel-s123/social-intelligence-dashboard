import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Box,
  Chip
} from '@mui/material';

const QuoteExplorer = ({ filters, onFilterChange, quotes, themes, sentiments, platforms, weeks, purchaseIntents, competitors }) => {
  const handleChange = (field) => (event) => {
    onFilterChange({ ...filters, [field]: event.target.value });
  };

  return (
    <Card elevation={3} sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontFamily: 'BMW Motorrad', mb: 2, color: '#1a1a1a' }}>
          Quote Explorer
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} md={2}>
            <TextField select label="Theme" fullWidth value={filters.theme} onChange={handleChange('theme')} size="small">
              <MenuItem value="All">All</MenuItem>
              {themes.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField select label="Sentiment" fullWidth value={filters.sentiment} onChange={handleChange('sentiment')} size="small">
              <MenuItem value="All">All</MenuItem>
              {sentiments.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField select label="Platform" fullWidth value={filters.platform} onChange={handleChange('platform')} size="small">
              <MenuItem value="All">All</MenuItem>
              {platforms.map((p) => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField select label="Week" fullWidth value={filters.week} onChange={handleChange('week')} size="small">
              <MenuItem value="All">All</MenuItem>
              {weeks.map((w) => (
                <MenuItem key={w} value={w}>{w}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField select label="Intent" fullWidth value={filters.purchaseIntent} onChange={handleChange('purchaseIntent')} size="small">
              <MenuItem value="All">All</MenuItem>
              {purchaseIntents.map((pi) => (
                <MenuItem key={pi} value={pi}>{pi}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField select label="Competitor" fullWidth value={filters.competitor} onChange={handleChange('competitor')} size="small">
              <MenuItem value="All">All</MenuItem>
              {competitors.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
          {quotes.map((q) => (
            <Box key={q.id} sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontFamily: 'BMW Motorrad', mb: 0.5 }}>
                "{q.text}"
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={q.theme} size="small" />
                <Chip label={q.sentiment} size="small" />
                <Chip label={q.platform} size="small" />
                {q.week && <Chip label={`Week ${q.week}`} size="small" />}
                <Chip label={q.purchaseIntent} size="small" />
                {q.competitorMentioned !== 'NONE' && <Chip label={q.competitorMentioned} size="small" />}
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuoteExplorer;
