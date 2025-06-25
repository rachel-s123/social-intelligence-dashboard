import React, { useState, useRef, useEffect, useMemo } from 'react';
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
import useDebounce from '../utils/useDebounce';

const QuoteExplorer = ({ filters, onFilterChange, quotes, themes, sentiments, platforms, weeks, purchaseIntents, competitors }) => {
  const listRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const rowHeight = 80;
  const containerHeight = 300;

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
      setActiveIndex((prev) => Math.min(prev + 1, searchedQuotes.length - 1));
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

  useEffect(() => {
    setActiveIndex(-1);
  }, [debouncedSearch, filters]);

  const searchedQuotes = useMemo(() => {
    if (!debouncedSearch) return quotes;
    const lower = debouncedSearch.toLowerCase();
    return quotes.filter((q) => q.text.toLowerCase().includes(lower));
  }, [quotes, debouncedSearch]);

  const startIndex = Math.floor(scrollTop / rowHeight);
  const visibleCount = Math.ceil(containerHeight / rowHeight) + 1;
  const visibleQuotes = searchedQuotes.slice(startIndex, startIndex + visibleCount);
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
          <Grid item xs={12} md={4}>
            <TextField
              label="Search"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
            />
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
          <Box sx={{ height: searchedQuotes.length * rowHeight, position: 'relative' }}>
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
                      <Chip 
                        label={q.theme} 
                        size="small" 
                        sx={{ backgroundColor: getTagColor(q.theme), color: 'white' }}
                      />
                      <Chip 
                        label={q.sentiment} 
                        size="small" 
                        sx={{ backgroundColor: getTagColor(q.sentiment), color: 'white' }}
                      />
                      <Chip 
                        label={q.platform} 
                        size="small" 
                        sx={{ backgroundColor: getTagColor(q.platform), color: 'white' }}
                      />
                      {q.week && (
                        <Chip 
                          label={`Week ${q.week}`} 
                          size="small" 
                          sx={{ backgroundColor: '#1976d2', color: 'white' }}
                        />
                      )}
                      <Chip 
                        label={q.purchaseIntent} 
                        size="small" 
                        sx={{ backgroundColor: getTagColor(q.purchaseIntent), color: 'white' }}
                      />
                      {q.competitorMentioned !== 'NONE' && (
                        <Chip 
                          label={q.competitorMentioned} 
                          size="small" 
                          sx={{ backgroundColor: getTagColor(q.competitorMentioned), color: 'white' }}
                        />
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
