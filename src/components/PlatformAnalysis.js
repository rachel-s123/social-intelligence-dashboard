import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card, CardContent, Typography } from '@mui/material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8e24aa', '#607d8b'];

const PlatformAnalysis = ({ data }) => (
  <Card elevation={3} sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" sx={{ fontFamily: 'BMW Motorrad', mb: 2, color: '#1a1a1a' }}>
        Platform Analysis
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="platform" outerRadius={100} label>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export default PlatformAnalysis;
