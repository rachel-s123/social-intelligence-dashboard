import React, { useMemo } from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { marketData } from '../data/wriData';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const ScoreBar = ({ score, maxScore = 100, color = '#FFD700' }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mt: 1 }}>
    <Box
      sx={{
        height: 8,
        width: '100%',
        bgcolor: '#f0f0f0',
        borderRadius: 4,
        position: 'relative',
      }}
    >
      <Box
        sx={{
          height: '100%',
          width: `${Math.max(0, Math.min(100, (score / maxScore) * 100))}%`,
          bgcolor: color,
          borderRadius: 4,
        }}
      />
    </Box>
  </Box>
);

const MarketScoreCards = ({ selectedMarket }) => {
  // Memoize calculations to improve performance
  const topScores = useMemo(() => {
    if (!selectedMarket || !marketData.markets.includes(selectedMarket)) {
      return [];
    }

    try {
      return Object.entries(marketData.scores)
        .map(([attribute, markets]) => ({
          attribute,
          score: markets[selectedMarket.toLowerCase()] || 0
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
    } catch (error) {
      console.error('Error calculating top scores:', error);
      return [];
    }
  }, [selectedMarket]);

  const deviations = useMemo(() => {
    if (!selectedMarket || !marketData.markets.includes(selectedMarket)) {
      return { positive: [], negative: [] };
    }

    try {
      const devs = {};
      marketData.attributes.forEach(attr => {
        const scores = marketData.markets.map(market => 
          marketData.scores[attr]?.[market.toLowerCase()] || 0
        );
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        devs[attr] = (marketData.scores[attr]?.[selectedMarket.toLowerCase()] || 0) - mean;
      });
      
      const sortedDeviations = Object.entries(devs)
        .map(([attribute, deviation]) => ({ attribute, deviation }))
        .sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));
      
      return {
        positive: sortedDeviations.filter(item => item.deviation > 0).slice(0, 3),
        negative: sortedDeviations.filter(item => item.deviation < 0).slice(0, 3)
      };
    } catch (error) {
      console.error('Error calculating deviations:', error);
      return { positive: [], negative: [] };
    }
  }, [selectedMarket]);

  // Validate selectedMarket and data
  if (!selectedMarket || !marketData.markets.includes(selectedMarket)) {
    return (
      <Typography color="error">
        Error: Invalid market selected
      </Typography>
    );
  }

  if (!topScores.length || (!deviations.positive.length && !deviations.negative.length)) {
    return (
      <Typography color="error">
        Error: Could not calculate scores for the selected market
      </Typography>
    );
  }

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {/* Top Resonance Card */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <StarIcon sx={{ color: '#FFD700' }} />
            Top Resonance
          </Typography>
          {topScores.map((item) => (
            <Box key={item.attribute} sx={{ my: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body1" sx={{ flexGrow: 1 }}>
                  {item.attribute}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {item.score.toFixed(1)}
                </Typography>
              </Box>
              <ScoreBar score={item.score} />
            </Box>
          ))}
        </Paper>
      </Grid>

      {/* Positive Deviations Card */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon sx={{ color: '#ef5350' }} />
            Above Average
          </Typography>
          {deviations.positive.map((item) => (
            <Box key={item.attribute} sx={{ my: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography>{item.attribute}</Typography>
                <Typography sx={{ fontWeight: 'bold', color: '#ef5350' }}>
                  +{item.deviation.toFixed(2)}
                </Typography>
              </Box>
              <ScoreBar 
                score={item.deviation} 
                maxScore={10} 
                color="#ef5350" 
              />
            </Box>
          ))}
        </Paper>
      </Grid>

      {/* Negative Deviations Card */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingDownIcon sx={{ color: '#42a5f5' }} />
            Below Average
          </Typography>
          {deviations.negative.map((item) => (
            <Box key={item.attribute} sx={{ my: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography>{item.attribute}</Typography>
                <Typography sx={{ fontWeight: 'bold', color: '#42a5f5' }}>
                  {item.deviation.toFixed(2)}
                </Typography>
              </Box>
              <ScoreBar 
                score={Math.abs(item.deviation)} 
                maxScore={10} 
                color="#42a5f5" 
              />
            </Box>
          ))}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default MarketScoreCards; 