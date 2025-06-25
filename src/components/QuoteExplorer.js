import React, { useState, useRef, useEffect } from 'react';
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
  const listRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rowHeight = 80;
  const containerHeight = 300;

  const handleChange = (field) => (event) => {
    onFilterChange({ ...filters, [field]: event.target.value });
  };

  const handleScroll = () => {
    if (listRef.current) {
      setScrollTop(listRef.current.scrollTop);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, quotes.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      listRef.current.scrollTo({ top: activeIndex * rowHeight, behavior: 'smooth' });
    }
  }, [activeIndex]);

  const startIndex = Math.floor(scrollTop / rowHeight);
  const visibleCount = Math.ceil(containerHeight / rowHeight) + 1;
  const visibleQuotes = quotes.slice(startIndex, startIndex + visibleCount);
  const offsetY = startIndex * rowHeight;

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
        <Box
          ref={listRef}
          role="list"
          aria-label="Quote results"
          tabIndex={0}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          sx={{ maxHeight: { xs: 200, md: 300 }, overflowY: 'auto', outline: 'none' }}
        >
          <Box sx={{ height: quotes.length * rowHeight, position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: offsetY, left: 0, right: 0 }}>
              {visibleQuotes.map((q, i) => {
                const actualIndex = startIndex + i;
                const selected = actualIndex === activeIndex;
                return (
                  <Box
                    key={q.id}
                    role="listitem"
                    tabIndex={selected ? 0 : -1}
                    aria-selected={selected}
                    sx={{
                      mb: 2,
                      px: 1,
                      backgroundColor: selected ? 'action.hover' : 'inherit',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'BMW Motorrad', mb: 0.5 }}
                    >
                      "{q.text}"
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label={q.theme} size="small" />
                      <Chip label={q.sentiment} size="small" />
                      <Chip label={q.platform} size="small" />
                      {q.week && <Chip label={`Week ${q.week}`} size="small" />}
                      <Chip label={q.purchaseIntent} size="small" />
                      {q.competitorMentioned !== 'NONE' && (
                        <Chip label={q.competitorMentioned} size="small" />
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuoteExplorer;
