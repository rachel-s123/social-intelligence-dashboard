import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CampaignIcon from '@mui/icons-material/Campaign';
import GroupsIcon from '@mui/icons-material/Groups';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { marketRecommendations } from '../data/marketRecommendations';

const RecommendationCard = ({ title, content, icon: Icon }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Icon sx={{ 
            mr: 1, 
            color: 'primary.main',
            fontSize: 28 
          }} />
          <Typography variant="h6" className="bmw-motorrad-bold">
            {title}
          </Typography>
        </Box>
        {Array.isArray(content) ? (
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            {content.map((point, index) => (
              <li key={index}>
                <Typography variant="body1" className="bmw-motorrad-regular">
                  {point}
                </Typography>
              </li>
            ))}
          </ul>
        ) : (
          <Typography variant="body1" className="bmw-motorrad-regular">
            {content}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const MarketRecommendations = ({ selectedMarket }) => {
  const normalizedMarket = selectedMarket?.toLowerCase().replace(/\s+/g, '_');
  if (!normalizedMarket || !marketRecommendations[normalizedMarket]) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Please select a market to view recommendations.
        </Alert>
      </Box>
    );
  }

  const recommendations = marketRecommendations[normalizedMarket];

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} gutterBottom color="primary.main">
        Market Recommendations
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Strategic insights and recommendations for {selectedMarket} based on comprehensive market analysis.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <RecommendationCard
            title="Strategic Positioning"
            content={recommendations.strategicPositioning}
            icon={TrendingUpIcon}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <RecommendationCard
            title="Content & Messaging"
            content={recommendations.contentMessaging}
            icon={CampaignIcon}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <RecommendationCard
            title="Audience Targeting"
            content={recommendations.audienceTargeting}
            icon={GroupsIcon}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <RecommendationCard
            title="Opportunities"
            content={recommendations.opportunities}
            icon={LightbulbIcon}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default MarketRecommendations; 