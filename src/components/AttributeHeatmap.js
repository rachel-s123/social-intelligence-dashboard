import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Tooltip,
  useTheme,
  Stack,
  Grid,
  IconButton,
  Fade,
  Divider,
  Card,
  Chip,
  FormControl,
  Select,
  MenuItem,
  OutlinedInput
} from '@mui/material';
import { marketData } from '../data/wriData';
import { attributeResonance } from '../data/attributeResonance';
import { getMarketDisplayName } from '../utils/marketDisplayName';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';

// Utility function to normalize attribute names for matching
const normalizeAttributeName = (name) =>
  name
    .toLowerCase()
    .replace(/\b(for|and|of|the|in|on|at|by|to|with|a|an)\b/g, '') // remove small words
    .replace(/[^a-z0-9]/g, ''); // remove non-alphanumeric

// Commentary component for attribute insights
const AttributeCommentary = ({ attribute, selectedMarket, onClose }) => {
  const theme = useTheme();
  
  // Find the correct key in attributeAnalysis using normalization
  const analysis = attributeResonance[selectedMarket.toLowerCase()]?.attributeAnalysis;
  let insights;
  if (analysis) {
    const normalizedAttr = normalizeAttributeName(attribute);
    const foundKey = Object.keys(analysis).find(
      key => normalizeAttributeName(key) === normalizedAttr
    );
    insights = foundKey ? analysis[foundKey] : undefined;
  }
  
  // If no insights found, show a message
  if (!insights) {
    return (
      <Fade in timeout={300}>
        <Paper 
          sx={{ 
            p: 3, 
            mt: 3,
            position: 'relative',
            backgroundColor: theme.palette.background.default
          }}
          elevation={3}
        >
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8
            }}
          >
            <CloseIcon />
          </IconButton>
          
          <Typography variant="h6" gutterBottom className="bmw-motorrad-bold" sx={{ mb: 3 }}>
            {attribute} Analysis for {getMarketDisplayName(selectedMarket)}
          </Typography>
          
          <Typography variant="body1" className="bmw-motorrad-regular">
            No specific insights available for this attribute in the selected market.
          </Typography>
        </Paper>
      </Fade>
    );
  }

  return (
    <Fade in timeout={300}>
      <Paper 
        sx={{ 
          p: 3, 
          mt: 3,
          position: 'relative',
          backgroundColor: theme.palette.background.default
        }}
        elevation={3}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8
          }}
        >
          <CloseIcon />
        </IconButton>
        
        <Typography variant="h6" gutterBottom className="bmw-motorrad-bold" sx={{ mb: 3 }}>
          {attribute} Analysis for {getMarketDisplayName(selectedMarket)}
        </Typography>

        <Grid container spacing={2}>
          {/* Left side - Score */}
          <Grid item xs={4}>
            <Card 
              elevation={1} 
              sx={{ 
                p: 2,
                height: '100%',
                backgroundColor: theme.palette.primary.main + '08',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Typography variant="subtitle1" gutterBottom className="bmw-motorrad-bold" color="primary">
                WRI Score
              </Typography>
              <Typography variant="h4" className="bmw-motorrad-bold" color="primary.dark" sx={{ mb: 1 }}>
                {insights.score?.toFixed(1)}
                <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 1 }}>
                  / 100
                </Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary" className="bmw-motorrad-regular">
                {(() => {
                  const scores = Object.values(marketData.scores[attribute]);
                  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
                  const deviation = insights.score - avgScore;
                  const sign = deviation > 0 ? '+' : '';
                  return `${sign}${deviation.toFixed(1)} vs. regional average of ${avgScore.toFixed(1)}`;
                })()}
              </Typography>
            </Card>
          </Grid>

          {/* Right side - Combined Insights */}
          <Grid item xs={8}>
            <Card 
              elevation={1} 
              sx={{ 
                p: 2,
                height: '100%',
                backgroundColor: theme.palette.background.paper,
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Typography 
                variant="subtitle2" 
                className="bmw-motorrad-bold"
                sx={{ mb: 1, color: theme.palette.text.secondary }}
              >
                Market Insight
              </Typography>
              <Typography variant="body2" className="bmw-motorrad-regular" sx={{ mb: 2 }}>
                {insights.insight}
              </Typography>

              <Typography 
                variant="subtitle2" 
                className="bmw-motorrad-bold"
                sx={{ mb: 1, color: theme.palette.text.secondary }}
              >
                Strategic Recommendation
              </Typography>
              <Typography variant="body2" className="bmw-motorrad-regular">
                {insights.recommendation}
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Fade>
  );
};

const AttributeHeatmap = ({ selectedMarket }) => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState('wri');
  const [sortMode, setSortMode] = useState('alpha');
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [selectedMarkets, setSelectedMarkets] = useState([selectedMarket]);

  // Update selected markets when the main market changes
  useEffect(() => {
    setSelectedMarkets([selectedMarket]);
  }, [selectedMarket]);

  // Calculate European averages and deviations
  const { averages, allDeviations } = useMemo(() => {
    if (!selectedMarket || !marketData.attributes) {
      return { averages: {}, allDeviations: {} };
    }

    const attributes = marketData.attributes;
    const markets = marketData.markets;
    
    // Calculate averages
    const averages = {};
    attributes.forEach(attr => {
      const scores = markets.map(market => marketData.scores[attr][market.toLowerCase()]);
      averages[attr] = scores.reduce((a, b) => a + b, 0) / scores.length;
    });

    // Calculate deviations for all markets
    const allDeviations = {};
    attributes.forEach(attr => {
      allDeviations[attr] = {};
      markets.forEach(market => {
        const score = marketData.scores[attr][market.toLowerCase()];
        allDeviations[attr][market] = score - averages[attr];
      });
    });

    return { averages, allDeviations };
  }, [selectedMarket]);

  // Handle market selection
  const handleMarketChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedMarkets(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const getDeviationColor = (deviation) => {
    const absDeviation = Math.abs(deviation);
    
    if (deviation > 0) {
      // Positive deviations - Red scale
      if (absDeviation >= 15) return { bg: '#ef5350', text: '#ffffff' }; // Strong positive
      if (absDeviation >= 8) return { bg: '#ef9a9a', text: '#c62828' }; // Moderate positive
      if (absDeviation >= 4) return { bg: '#ffcdd2', text: '#c62828' }; // Slight positive
      if (absDeviation >= 2) return { bg: '#ffebee', text: '#c62828' }; // Very slight positive
      return { bg: '#fff5f5', text: '#000000' }; // Near neutral positive
    } else {
      // Negative deviations - Blue scale
      if (absDeviation >= 15) return { bg: '#42a5f5', text: '#ffffff' }; // Strong negative
      if (absDeviation >= 8) return { bg: '#90caf9', text: '#1565c0' }; // Moderate negative
      if (absDeviation >= 4) return { bg: '#bbdefb', text: '#1565c0' }; // Slight negative
      if (absDeviation >= 2) return { bg: '#e3f2fd', text: '#1565c0' }; // Very slight negative
      return { bg: '#f5f9ff', text: '#000000' }; // Near neutral negative
    }
  };

  const formatValue = (value, isDeviation) => {
    if (isDeviation) {
      const sign = value > 0 ? '+' : '';
      return `${sign}${value.toFixed(1)}`;
    }
    return value.toFixed(1);
  };

  const getTooltipContent = (attribute, market, wriScore, deviation) => {
    const avgScore = averages[attribute];
    return (
      <Box sx={{ p: 1 }}>
        <Typography variant="body2" className="bmw-motorrad-bold">
          {getMarketDisplayName(market)} - {attribute}
        </Typography>
        <Typography variant="body2" className="bmw-motorrad-regular">
          WRI Score: {wriScore.toFixed(1)}
        </Typography>
        <Typography variant="body2" className="bmw-motorrad-regular">
          Market Average: {avgScore.toFixed(1)}
        </Typography>
        <Typography variant="body2" className="bmw-motorrad-regular">
          Deviation: {formatValue(deviation, true)}
        </Typography>
      </Box>
    );
  };

  // Early return if no market is selected
  if (!selectedMarket || !marketData.attributes) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" className="bmw-motorrad-regular">
          Please select a market to view the attribute analysis.
        </Typography>
      </Box>
    );
  }

  // Order markets to put selected market first, then selected comparison markets
  const orderedMarkets = [
    selectedMarket,
    ...selectedMarkets.filter(market => market !== selectedMarket)
  ];

  // Sort attributes based on mode
  const sortedAttributes = [...marketData.attributes].sort((a, b) => {
    if (sortMode === 'alpha') {
      return a.localeCompare(b);
    }
    if (viewMode === 'wri') {
      return marketData.scores[b][selectedMarket.toLowerCase()] - marketData.scores[a][selectedMarket.toLowerCase()];
    }
    return Math.abs(allDeviations[b][selectedMarket]) - Math.abs(allDeviations[a][selectedMarket]);
  });

  // Handle row click
  const handleRowClick = (attribute) => {
    setSelectedAttribute(attribute === selectedAttribute ? null : attribute);
  };

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} gutterBottom color="primary.main">
        Attribute Resonance Analysis
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Detailed analysis of attribute resonance for {getMarketDisplayName(selectedMarket)} compared to European markets
      </Typography>

      <Stack 
        direction="row" 
        justifyContent="space-between" 
        alignItems="center"
        spacing={2}
        mb={2}
      >
        <Typography variant="h6" className="bmw-motorrad-bold">
          {viewMode === 'wri' ? 'WRI Scores: comparing across the V2 Region' : 'Market Deviations'}
        </Typography>
        <Stack direction="row" spacing={2}>
          <FormControl sx={{ minWidth: 200 }}>
            <Select
              multiple
              value={selectedMarkets}
              onChange={handleMarketChange}
              input={<OutlinedInput />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={getMarketDisplayName(value)}
                      sx={{
                        fontFamily: 'BMW Motorrad',
                        backgroundColor: value === selectedMarket ?
                          theme.palette.primary.main :
                          theme.palette.primary.light,
                        color: value === selectedMarket ? 
                          theme.palette.primary.contrastText : 
                          theme.palette.primary.dark
                      }}
                    />
                  ))}
                </Box>
              )}
              sx={{ 
                fontFamily: 'BMW Motorrad',
                '& .MuiSelect-select': {
                  py: 1
                }
              }}
            >
              {marketData.markets.map((market) => (
                <MenuItem
                  key={market}
                  value={market}
                  disabled={market === selectedMarket}
                  sx={{
                    fontFamily: 'BMW Motorrad',
                    backgroundColor: market === selectedMarket ?
                      `${theme.palette.primary.main}15` :
                      'inherit',
                    '&.Mui-disabled': {
                      opacity: 1,
                      color: theme.palette.primary.main,
                      fontWeight: 'bold'
                    }
                  }}
                >
                  {getMarketDisplayName(market)}
                  {getMarketDisplayName(market)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <ToggleButtonGroup
            value={sortMode}
            exclusive
            onChange={(e, newValue) => newValue && setSortMode(newValue)}
            size="small"
          >
            <ToggleButton 
              value="alpha"
              sx={{ 
                fontFamily: 'BMW Motorrad',
                textTransform: 'none'
              }}
            >
              Alphabetical
            </ToggleButton>
            <ToggleButton 
              value="value"
              sx={{ 
                fontFamily: 'BMW Motorrad',
                textTransform: 'none'
              }}
            >
              By WRI Score
            </ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newValue) => newValue && setViewMode(newValue)}
            size="small"
          >
            <ToggleButton 
              value="wri"
              sx={{ 
                fontFamily: 'BMW Motorrad',
                textTransform: 'none'
              }}
            >
              WRI Scores
            </ToggleButton>
            <ToggleButton 
              value="deviation"
              sx={{ 
                fontFamily: 'BMW Motorrad',
                textTransform: 'none'
              }}
            >
              Deviations
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      {/* Color Key */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontFamily: 'BMW Motorrad' }}>
          {viewMode === 'wri' ? 'WRI Score Scale' : 'Market Deviation Scale'}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', mb: 2, color: 'text.secondary', fontFamily: 'BMW Motorrad' }}>
          Colors indicate deviation from European market average
        </Typography>
        {viewMode === 'wri' ? (
          <Box sx={{ position: 'relative', width: '100%', height: 40 }}>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 20,
                background: 'linear-gradient(to right, #42a5f5, #f5f9ff, #fff5f5, #ef5350)',
                borderRadius: 1
              }}
            />
            <Box sx={{ 
              position: 'absolute', 
              top: 24, 
              left: 0, 
              right: 0,
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'BMW Motorrad' }}>Negative</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'BMW Motorrad' }}>Average</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'BMW Motorrad' }}>Positive</Typography>
            </Box>
          </Box>
        ) : (
          <Box>
            <Box sx={{ position: 'relative', width: '100%', height: 60, mb: 1 }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: '50%',
                  height: 20,
                  background: 'linear-gradient(to right, #42a5f5, #f5f9ff)',
                  borderRadius: '4px 0 0 4px'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  right: 0,
                  height: 20,
                  background: 'linear-gradient(to right, #fff5f5, #ef5350)',
                  borderRadius: '0 4px 4px 0'
                }}
              />
              <Box sx={{ 
                position: 'absolute', 
                top: 24, 
                left: 0, 
                right: 0,
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'BMW Motorrad' }}>Strong Negative</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'BMW Motorrad' }}>Neutral</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'BMW Motorrad' }}>Strong Positive</Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Paper>

      <TableContainer component={Paper} sx={{ width: '100%', minWidth: 1200 }}>
        <Table size="small" sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{ 
                  width: '30%',
                  minWidth: 300,
                  fontFamily: 'BMW Motorrad',
                  fontWeight: 'bold',
                  backgroundColor: theme.palette.background.default
                }}
              >
                Attribute
              </TableCell>
              {orderedMarkets.map(market => (
                <TableCell
                  key={market}
                  align="center"
                  sx={{ 
                    width: `${70 / orderedMarkets.length}%`,
                    minWidth: 100,
                    fontFamily: 'BMW Motorrad',
                    fontWeight: market === selectedMarket ? 'bold' : 'normal',
                    backgroundColor: market === selectedMarket ? 
                      theme.palette.action.selected : 
                      theme.palette.background.default
                  }}
                >
                  {getMarketDisplayName(market)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedAttributes.map((attribute) => (
              <React.Fragment key={attribute}>
                <TableRow
                  hover
                  onClick={() => handleRowClick(attribute)}
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: theme.palette.action.hover,
                    },
                    cursor: 'pointer',
                    backgroundColor: selectedAttribute === attribute ? 
                      `${theme.palette.primary.main}15` : 
                      'inherit'
                  }}
                >
                  <TableCell 
                    component="th" 
                    scope="row"
                    sx={{ 
                      width: '30%',
                      minWidth: 300,
                      fontFamily: 'BMW Motorrad',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      backgroundColor: theme.palette.action.hover
                    }}
                  >
                    {attribute}
                  </TableCell>
                  {orderedMarkets.map(market => {
                    const score = marketData.scores[attribute][market.toLowerCase()];
                    const deviation = allDeviations[attribute][market];
                    const value = viewMode === 'wri' ? score : deviation;
                    const colors = getDeviationColor(deviation);
                    
                    return (
                      <Tooltip 
                        key={`${market}-${attribute}`}
                        title={getTooltipContent(attribute, market, score, deviation)}
                        arrow
                      >
                        <TableCell 
                          align="center"
                          sx={{ 
                            width: `${70 / orderedMarkets.length}%`,
                            minWidth: 100,
                            fontFamily: 'BMW Motorrad',
                            fontWeight: market === selectedMarket ? 'bold' : 'normal',
                            backgroundColor: colors.bg,
                            color: colors.text,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {formatValue(value, viewMode === 'deviation')}
                        </TableCell>
                      </Tooltip>
                    );
                  })}
                </TableRow>
                {selectedAttribute === attribute && (
                  <TableRow>
                    <TableCell colSpan={orderedMarkets.length + 1} sx={{ p: 0 }}>
                      <AttributeCommentary 
                        attribute={attribute}
                        selectedMarket={selectedMarket}
                        onClose={() => setSelectedAttribute(null)}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AttributeHeatmap; 