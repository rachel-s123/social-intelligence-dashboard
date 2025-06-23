import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  useTheme,
  Alert
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import bmwLogo from '../assets/bmw-black.jpg';

const Login = ({ onLogin }) => {
  const theme = useTheme();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const expectedPassword = process.env.REACT_APP_LOGIN_PASSWORD;

    if (!expectedPassword) {
      setError('Login password not configured.');
      return;
    }

    if (password === expectedPassword) {
      onLogin(true);
    } else {
      setError('Invalid password. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            backgroundColor: 'white',
          }}
        >
          <img
            src={bmwLogo}
            alt="BMW Motorrad Logo"
            style={{ width: '120px', marginBottom: 16, marginTop: 8 }}
          />
          <Box
            sx={{
              backgroundColor: theme.palette.primary.main,
              borderRadius: '50%',
              padding: 1,
              marginBottom: 2
            }}
          >
            <LockOutlinedIcon sx={{ color: 'white' }} />
          </Box>

          <Typography 
            component="h1" 
            variant="h5" 
            className="bmw-motorrad-bold"
            sx={{ mb: 3 , textAlign: 'center'}}
          >
            BMW Motorrad 
            <br />
            Social Intelligence Dashboard
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{ mb: 3, color: 'text.secondary', textAlign: 'center' }}
          >
            AI-powered segment analysis for V2 Region markets
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                mb: 2,
                py: 1.5,
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
                fontFamily: 'BMWMotorrad-Bold'
              }}
            >
              Sign In
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 