import React, { useMemo } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Divider,
  useTheme
} from '@mui/material';
import { marketInsights } from '../data/wriInsights';

const StrategyCard = ({ content }) => {
  const theme = useTheme();
  return (
    <Card 
      sx={{ 
        height: '100%',
        backgroundColor: theme.palette.background.paper,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <CardContent>
        <Typography 
          variant="body1" 
          color="text.primary"
          sx={{ 
            lineHeight: 1.5,
            fontWeight: 500
          }}
        >
          {content}
        </Typography>
      </CardContent>
    </Card>
  );
};

const PriorityCard = ({ priority }) => {
  const theme = useTheme();
  return (
    <Card 
      sx={{ 
        height: '100%',
        backgroundColor: theme.palette.background.paper,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <CardContent>
        <Typography 
          variant="body1" 
          color="text.primary"
          sx={{ 
            lineHeight: 1.5,
            fontWeight: 500
          }}
        >
          {priority}
        </Typography>
      </CardContent>
    </Card>
  );
};

const StrategicDirection = ({ selectedMarket }) => {
  const theme = useTheme();
  const marketData = useMemo(() => {
    return marketInsights[selectedMarket?.toLowerCase()];
  }, [selectedMarket]);

  if (!marketData) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          No strategic data available for {selectedMarket}
        </Typography>
      </Paper>
    );
  }

  const { recommendations, priorities } = marketData;

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        mb: 4,
        backgroundColor: theme.palette.background.default
      }}
    >
      {/* Recommendations Section */}
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          color: theme.palette.primary.main,
          fontWeight: 600,
          mb: 3
        }}
      >
        Strategic Recommendations for {selectedMarket}
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {recommendations.map((rec) => (
          <Grid item xs={12} md={6} lg={4} key={rec.details}>
            <StrategyCard content={rec.details} />
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Priorities Section */}
      <Typography 
        variant="h5" 
        gutterBottom
        sx={{ 
          color: theme.palette.primary.main,
          fontWeight: 600,
          mb: 3
        }}
      >
        Market Priorities
      </Typography>
      <Grid container spacing={3}>
        {priorities.map((priority) => (
          <Grid item xs={12} md={6} lg={4} key={priority}>
            <PriorityCard priority={priority} />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default StrategicDirection; 