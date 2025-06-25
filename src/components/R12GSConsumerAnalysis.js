import React from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

const R12GSConsumerAnalysis = ({ selectedMarket, data }) => {
  const marketKey = selectedMarket.toLowerCase();
  const marketData = data[marketKey];

  if (!marketData) {
    return (
      <Typography sx={{ fontFamily: 'BMW Motorrad' }}>
        No R 12 G/S consumer data available for {selectedMarket}.
      </Typography>
    );
  }

  const { consumerReactionThemes = {}, sentimentAnalysis = {}, keyInsights = {} } = marketData;

  return (
    <Box>
      <Typography variant="h6" sx={{ fontFamily: 'BMW Motorrad', mb: 2 }}>
        Consumer Reaction Themes
      </Typography>
      <List dense>
        {Object.entries(consumerReactionThemes).map(([theme, value]) => (
          <ListItem key={theme}>
            <ListItemText primary={`${theme}: ${value}%`} />
          </ListItem>
        ))}
      </List>

      <Typography variant="h6" sx={{ fontFamily: 'BMW Motorrad', mt: 4, mb: 2 }}>
        Sentiment Analysis
      </Typography>
      <List dense>
        {Object.entries(sentimentAnalysis).map(([sent, value]) => (
          <ListItem key={sent}>
            <ListItemText primary={`${sent}: ${value}%`} />
          </ListItem>
        ))}
      </List>

      <Typography variant="h6" sx={{ fontFamily: 'BMW Motorrad', mt: 4, mb: 2 }}>
        Key Insights
      </Typography>
      <List dense>
        {Object.entries(keyInsights).map(([k, v]) => (
          <ListItem key={k}>
            <ListItemText primary={v} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default R12GSConsumerAnalysis;
