import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: '"BMW Motorrad", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
    subtitle1: {
      fontWeight: 400,
    },
    subtitle2: {
      fontWeight: 400,
    },
    body1: {
      fontWeight: 400,
    },
    body2: {
      fontWeight: 400,
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
    },
  },
  palette: {
    primary: {
      main: '#0066B1', // BMW Blue
      light: '#3384C1',
      dark: '#004780',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#666666', // BMW Gray
      light: '#848484',
      dark: '#474747',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F7F7F7',
    },
    text: {
      primary: '#262626',
      secondary: '#666666',
    },
  },
  components: {
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          h1: 'h1',
          h2: 'h2',
          h3: 'h3',
          h4: 'h4',
          h5: 'h5',
          h6: 'h6',
          subtitle1: 'p',
          subtitle2: 'p',
          body1: 'p',
          body2: 'p',
        },
      },
    },
  },
});

export default theme; 