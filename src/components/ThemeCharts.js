import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Card, CardContent, Typography } from '@mui/material';

const ThemeCharts = ({ data }) => (
  <Card elevation={3} sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" sx={{ fontFamily: 'BMW Motorrad', mb: 2, color: '#1a1a1a' }}>
        Themes
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={90} domain={[0, 25]} />
          <Radar name="Themes" dataKey="A" stroke="#1976d2" fill="#1976d2" fillOpacity={0.3} />
        </RadarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export default ThemeCharts;
