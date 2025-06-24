import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import { modelInsights } from '../data/modelInsights';

const defaultModels = [
  'R 12 G/S',
  'R 1300 GS Adventure',
  'F 900 GS Adventure'
];

const ModelSelector = ({ selectedModel, onModelChange }) => {
  const modelsFromData = Object.keys(modelInsights);
  const models = modelsFromData.length > 0 ? modelsFromData : defaultModels;

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
