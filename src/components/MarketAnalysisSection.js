import React from 'react';
import { Box, Typography, Paper, Card, CardContent, Grid, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const MarketAnalysisSection = ({ data }) => {
  if (!data) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" color="primary.main">Market Analysis</Typography>
        <Typography color="text.secondary">No market analysis data available.</Typography>
      </Paper>
    );
  }

  const purchaseIntentData = data.purchaseIntentIndicators || [];
  const barrierData = data.barrierAnalysis || [];
  const opportunityData = data.opportunityIdentification || [];

  return (
    <Paper sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 2 }}>
      <Typography variant="h6" color="primary.main" gutterBottom fontWeight={600}>
        Market Analysis
      </Typography>
      
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Key market indicators, barriers, and opportunities for the R 12 G/S
      </Typography>

      <Grid container spacing={3}>
        {/* Purchase Intent Indicators */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', border: '1px solid', borderColor: 'success.light' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h6" color="success.main" fontWeight={600}>
                  Purchase Intent
                </Typography>
              </Box>
              
              {purchaseIntentData.length > 0 ? (
                purchaseIntentData.map((item, index) => (
                  <Box key={index} sx={{ mb: 2, p: 1.5, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600} color="success.dark" gutterBottom>
                      {item.indicator}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.value}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No purchase intent data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Barrier Analysis */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', border: '1px solid', borderColor: 'warning.light' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon sx={{ color: 'warning.main', mr: 1 }} />
                <Typography variant="h6" color="warning.main" fontWeight={600}>
                  Barriers
                </Typography>
              </Box>
              
              {barrierData.length > 0 ? (
                barrierData.map((item, index) => (
                  <Box key={index} sx={{ mb: 2, p: 1.5, bgcolor: 'warning.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600} color="warning.dark" gutterBottom>
                      {item.barrier}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.value}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No barrier data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Opportunity Identification */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', border: '1px solid', borderColor: 'info.light' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LightbulbIcon sx={{ color: 'info.main', mr: 1 }} />
                <Typography variant="h6" color="info.main" fontWeight={600}>
                  Opportunities
                </Typography>
              </Box>
              
              {opportunityData.length > 0 ? (
                opportunityData.map((item, index) => (
                  <Box key={index} sx={{ mb: 2, p: 1.5, bgcolor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600} color="info.dark" gutterBottom>
                      {item.opportunity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No opportunity data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Summary Stats */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
              <Typography variant="body2" color="success.main" fontWeight={600}>
                {purchaseIntentData.length} Purchase Indicators
              </Typography>
            </Box>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CancelIcon sx={{ color: 'warning.main', mr: 1 }} />
              <Typography variant="body2" color="warning.main" fontWeight={600}>
                {barrierData.length} Barriers Identified
              </Typography>
            </Box>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EmojiEventsIcon sx={{ color: 'info.main', mr: 1 }} />
              <Typography variant="body2" color="info.main" fontWeight={600}>
                {opportunityData.length} Opportunities
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default MarketAnalysisSection; 