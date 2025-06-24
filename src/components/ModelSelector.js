import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import { modelInsights } from '../data/modelInsights';

const ModelSelector = ({ selectedMarket, selectedModel, onModelChange }) => {
  // Only show models that exist for the selected market
  const models = Object.keys(modelInsights)
    .filter(key => key.toLowerCase().startsWith(`${selectedMarket.toLowerCase()}-`))
    .map(key => key.replace(new RegExp(`^${selectedMarket}-`, 'i'), ''));

  return (
    <Box sx={{ mb: 4 }}>
      <FormControl fullWidth>
        <InputLabel id="model-select-label">Select Model</InputLabel>
        <Select
          labelId="model-select-label"
          id="model-select"
          value={selectedModel}
          label="Select Model"
          onChange={(e) => onModelChange(e.target.value)}
        >
          {models.map((model) => (
            <MenuItem
              key={model}
              value={model}
              sx={{ fontFamily: 'BMW Motorrad', textTransform: 'none' }}
            >
              {model}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default ModelSelector;
