import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, Typography } from '@mui/material';

const SentimentTimeline = ({ data }) => (
  <Card elevation={3} sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" sx={{ fontFamily: 'BMW Motorrad', mb: 2, color: '#1a1a1a' }}>
        Sentiment Timeline
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="week" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="positive" stroke="#4caf50" />
          <Line type="monotone" dataKey="neutral" stroke="#ff9800" />
          <Line type="monotone" dataKey="negative" stroke="#f44336" />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export default SentimentTimeline;
