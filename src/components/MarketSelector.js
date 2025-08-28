import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import { r12gsConsumerData } from '../data/r12gsConsumerData';
import { getMarketDisplayName } from '../utils/marketDisplayName';

const MarketSelector = ({ selectedMarket, onMarketChange }) => {
  const markets = Object.keys(r12gsConsumerData);

  return (
    <Box sx={{ mb: 4 }}>
      <FormControl fullWidth>
        <InputLabel id="market-select-label">Select Market</InputLabel>
        <Select
          labelId="market-select-label"
          id="market-select"
          value={selectedMarket}
          label="Select Market"
          onChange={(e) => onMarketChange(e.target.value)}
        >
          {markets.map((market) => (
            <MenuItem
              key={market}
              value={market}
              sx={{ fontFamily: 'BMW Motorrad', textTransform: 'none' }}
            >
              {getMarketDisplayName(market)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default MarketSelector;
