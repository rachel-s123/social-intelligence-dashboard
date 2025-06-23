import React, { useState, useEffect } from 'react';
import { Typography, Grid, Card, CardContent, Box, Divider, Paper, Tooltip as MuiTooltip, IconButton, CircularProgress } from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CampaignIcon from '@mui/icons-material/Campaign';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MessageIcon from '@mui/icons-material/Message';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getCompetitorData } from '../data/competitorData';

const ICONS = [
  <TrendingUpIcon color="primary" />, // 0
  <LightbulbIcon color="primary" />, // 1
  <CampaignIcon color="primary" />, // 2
  <MessageIcon color="primary" />, // 3
];

const SOV_CONTEXT = (market) =>
  `Share of Voice is based on the proportion of online conversations mentioning each brand in 2025 for ${market}.`;

// Custom label for pie slices
const renderPieLabel = ({ cx, cy, midAngle, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 20;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#222"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontWeight="bold"
      fontSize={14}
      style={{ fontFamily: 'inherit' }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Custom legend (vertical column)
const CustomLegend = ({ payload }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mt: 2 }}>
    {payload.map((entry) => (
      <Box key={entry.value} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box 
          sx={{ 
            width: 16, 
            height: 16, 
            borderRadius: '50%', 
            background: entry.color, 
            mr: 1,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: entry.value === 'BMW Motorrad' ? '2px solid #0066B1' : 'none'
          }} 
        />
        <Typography 
          variant="body2" 
          fontWeight={entry.value === 'BMW Motorrad' ? 700 : 400} 
          color={entry.value === 'BMW Motorrad' ? 'primary.main' : 'text.primary'}
        >
          {entry.value}
        </Typography>
      </Box>
    ))}
  </Box>
);

// Custom tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload;
    return (
      <Paper elevation={3} sx={{ p: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={700}>{name}</Typography>
        <Typography variant="body2">{value}% of mentions</Typography>
      </Paper>
    );
  }
  return null;
};

// Color palette for competitors
const COMPETITOR_COLORS = {
  bmw: '#0066B1',  // BMW blue
  honda: '#E2001A', // Honda red
  harley: '#000000', // Harley black
  yamaha: '#003399', // Yamaha blue
  ducati: '#FF0000', // Ducati red
  kawasaki: '#00A0DE', // Kawasaki teal
  suzuki: '#E4002B', // Suzuki red
  others: '#757575'  // Grey for others
};

// Function to assign colors to competitors
const getCompetitorColor = (name) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('bmw')) return COMPETITOR_COLORS.bmw;
  if (lowerName.includes('honda')) return COMPETITOR_COLORS.honda;
  if (lowerName.includes('harley')) return COMPETITOR_COLORS.harley;
  if (lowerName.includes('yamaha')) return COMPETITOR_COLORS.yamaha;
  if (lowerName.includes('ducati')) return COMPETITOR_COLORS.ducati;
  if (lowerName.includes('kawasaki')) return COMPETITOR_COLORS.kawasaki;
  if (lowerName.includes('suzuki')) return COMPETITOR_COLORS.suzuki;
  return COMPETITOR_COLORS.others;
};

const CompetitorAnalysis = ({ selectedMarket }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (selectedMarket) {
      const competitorData = getCompetitorData(selectedMarket);
      setData(competitorData);
    }
  }, [selectedMarket]);

  if (!data) {
    return null;
  }

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Paper elevation={2} sx={{ mb: 4, p: 3, background: '#f8fafc' }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight={700} color="primary.main" sx={{ mr: 1 }}>
            Share of Voice (Q1 2025)
          </Typography>
          {selectedMarket && (
            <MuiTooltip title={SOV_CONTEXT(selectedMarket)} arrow>
              <IconButton size="small" sx={{ color: 'primary.main' }}>
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </MuiTooltip>
          )}
        </Box>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          {/* Pie Chart */}
          <Grid item xs={12} md={7}>
            <Box sx={{ 
              width: '100%', 
              maxWidth: 1000, 
              height: 325,
              mx: 'auto',
              position: 'relative',
              left: '-10%'
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.shareOfVoice}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    label={renderPieLabel}
                    isAnimationActive={true}
                    paddingAngle={2}
                  >
                    {data.shareOfVoice.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getCompetitorColor(entry.name)}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          {/* Legend */}
          <Grid item xs={12} md={5}>
            <CustomLegend payload={data.shareOfVoice.map((entry) => ({ 
              value: entry.name, 
              color: getCompetitorColor(entry.name)
            }))} />
          </Grid>
        </Grid>
      </Paper>

      {/* Competitor cards */}
      <Typography variant="h4" fontWeight={700} gutterBottom color="primary.main">
        Competitor Analysis
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Key strengths, weaknesses, and opportunities for each major competitor in {selectedMarket}.
      </Typography>
      <Grid container spacing={3}>
        {Object.entries(data.competitorStrengths).map(([competitor, strengths], idx) => (
          <Grid item xs={12} md={6} key={competitor}>
            <Card elevation={2} sx={{ borderLeft: `6px solid ${getCompetitorColor(competitor)}` }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Box mr={1}>{ICONS[idx % ICONS.length]}</Box>
                  <Typography variant="h6" fontWeight={700} color={competitor.toLowerCase().includes('bmw') ? '#0066B1' : 'text.primary'}>
                    {competitor}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box mb={2}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom color="success.main" display="flex" alignItems="center">
                    <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />Strengths
                  </Typography>
                  {strengths.map((s, i) => (
                    <Typography key={i} variant="body2" sx={{ mb: 0.5, pl: 3 }}>
                      {s}
                    </Typography>
                  ))}
                </Box>
                {data.competitorWeaknesses[competitor] && data.competitorWeaknesses[competitor].length > 0 && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom color="error.main" display="flex" alignItems="center">
                      <WarningIcon fontSize="small" sx={{ mr: 1 }} />Weaknesses
                    </Typography>
                    {data.competitorWeaknesses[competitor].map((w, i) => (
                      <Typography key={i} variant="body2" sx={{ mb: 0.5, pl: 3 }}>
                        {w}
                      </Typography>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {data.gapsToExploit && data.gapsToExploit.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom color="primary.main">
            Market Opportunities
          </Typography>
          <Grid container spacing={3}>
            {data.gapsToExploit.map((gap, idx) => (
              <Grid item xs={12} md={6} key={gap.title}>
                <Card elevation={1} sx={{ borderLeft: '6px solid #1c69d4' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <LightbulbIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle1" fontWeight={600} color="primary.main">
                        {gap.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {gap.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default CompetitorAnalysis; 