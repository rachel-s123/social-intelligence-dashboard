import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import { marketData } from '../data/wriData';

const MarketSelector = ({ selectedMarket, onMarketChange }) => {
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
          {marketData.markets.map((market) => (
            <MenuItem 
              key={market} 
              value={market}
              sx={{ 
                fontFamily: 'BMW Motorrad',
                textTransform: market === 'CS' ? 'none' : 'capitalize'
              }}
            >
              {market === 'CS' ? 'Central & Southern Europe' : market}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default MarketSelector; 