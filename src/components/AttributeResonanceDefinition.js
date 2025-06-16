import React from 'react';
import { 
  Box, 
  Paper, 
  Typography,
  useTheme,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const AttributeResonanceComparison = ({ selectedMarket }) => {
  const theme = useTheme();

  return (
    <Box sx={{ p: 1 }}>
      <Typography 
        variant="h5" 
        gutterBottom 
        className="bmw-motorrad-bold"
        sx={{ mb: 1 }}
      >
        Attribute Resonance Definition
      </Typography>

      <Paper 
        sx={{ 
          p: 1, 
          mb: 2, 
          maxWidth: '800px',
          backgroundColor: theme.palette.background.default,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Accordion 
          elevation={0}
          sx={{
            backgroundColor: 'transparent',
            '&:before': {
              display: 'none',
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              padding: 0,
              minHeight: '40px',
              '& .MuiAccordionSummary-content': {
                margin: '4px 0',
              },
            }}
          >
            <Box display="flex" alignItems="center">
              <InfoIcon 
                sx={{ 
                  mr: 1.5,
                  fontSize: '1.2rem',
                  color: theme.palette.primary.main,
                }} 
              />
              <Typography 
                variant="subtitle1" 
                className="bmw-motorrad-bold"
              >
                Understanding Attribute Resonance
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: '0 0 0 24px' }}>
            <Typography 
              variant="body1" 
              paragraph 
              className="bmw-motorrad-regular"
              sx={{ mb: 1 }}
            >
              The Weighted Resonance Index (WRI) measures how strongly different product attributes resonate with consumers in each market. This comprehensive score analyzes 20 key attributes across four dimensions:
            </Typography>
            <ul style={{ marginBottom: '12px' }}>
              <li>
                <Typography variant="body1" className="bmw-motorrad-regular">
                  <strong>Social Discussion Importance (30%):</strong> Volume and sentiment of social media conversations and online forums
                </Typography>
              </li>
              <li>
                <Typography variant="body1" className="bmw-motorrad-regular">
                  <strong>Sales & Market Factor Importance (25%):</strong> Impact on purchase decisions and market performance
                </Typography>
              </li>
              <li>
                <Typography variant="body1" className="bmw-motorrad-regular">
                  <strong>Consumer Review Focus (25%):</strong> Frequency and emphasis in customer reviews and feedback
                </Typography>
              </li>
              <li>
                <Typography variant="body1" className="bmw-motorrad-regular">
                  <strong>Expert Analysis Emphasis (20%):</strong> Prominence in professional reviews and industry analysis
                </Typography>
              </li>
            </ul>
            <Typography 
              variant="body1" 
              className="bmw-motorrad-regular"
              paragraph
            >
              Each attribute receives a score from 0-100, with higher scores indicating stronger market resonance. This analysis helps identify which product features and characteristics are most important to consumers in different markets, enabling targeted product development and marketing strategies.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ my: 1.5 }} />

        <Accordion 
          elevation={0}
          sx={{
            backgroundColor: 'transparent',
            '&:before': {
              display: 'none',
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              padding: 0,
              minHeight: '40px',
              '& .MuiAccordionSummary-content': {
                margin: '4px 0',
              },
            }}
          >
            <Box display="flex" alignItems="center">
              <ShowChartIcon 
                sx={{ 
                  mr: 1.5,
                  fontSize: '1.2rem',
                  color: theme.palette.primary.main,
                }} 
              />
              <Typography 
                variant="subtitle1" 
                className="bmw-motorrad-bold"
              >
                Market Deviation Analysis
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: '0 0 0 24px' }}>
            <Typography 
              variant="body1" 
              paragraph 
              className="bmw-motorrad-regular"
              sx={{ mb: 1 }}
            >
              To understand how each market differs from the European average, we calculate and visualize deviations using the following methodology:
            </Typography>
            <ul style={{ marginBottom: '12px' }}>
              <li>
                <Typography variant="body1" paragraph className="bmw-motorrad-regular">
                  <strong>Baseline Calculation:</strong> For each attribute, we establish a European baseline by averaging WRI scores across all markets
                </Typography>
              </li>
              <li>
                <Typography variant="body1" paragraph className="bmw-motorrad-regular">
                  <strong>Deviation Measurement:</strong> Market-specific scores are compared against this baseline, with differences expressed in percentage points (e.g., +15 indicates 15 points above average)
                </Typography>
              </li>
              <li>
                <Typography variant="body1" paragraph className="bmw-motorrad-regular">
                  <strong>Significance Levels:</strong> Deviations are categorized as:
                  • Strong (±15 points or more)
                  • Moderate (±8 to 14 points)
                  • Slight (±3 to 7 points)
                  • Neutral (±2 points)
                </Typography>
              </li>
            </ul>
            <Typography 
              variant="body1" 
              className="bmw-motorrad-regular"
            >
              This comparative analysis helps identify unique market characteristics and opportunities, enabling more targeted market strategies and product positioning. Positive deviations highlight areas of strong attribute importance, while negative deviations may indicate attributes with less significance within a market.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Box>
  );
};

export default AttributeResonanceComparison; 