import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, Typography } from '@mui/material';

const CompetitiveIntelCharts = ({ data }) => (
  <Card elevation={3} sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" sx={{ fontFamily: 'BMW Motorrad', mb: 2, color: '#1a1a1a' }}>
        Competitor Mentions
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="competitor" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#1976d2" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export default CompetitiveIntelCharts;
