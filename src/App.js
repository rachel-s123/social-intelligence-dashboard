import React, { useState, lazy, Suspense } from "react";
import { ThemeProvider } from "@mui/material/styles";
import {
  Container,
  CssBaseline,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import theme from "./theme";
import "./styles/fonts.css";
import DashboardIntro from "./components/DashboardIntro";
import AttributeHeatmap from "./components/AttributeHeatmap";
import MarketSelector from "./components/MarketSelector";
import ConversationInsights from "./components/ConversationInsights";
import CompetitorAnalysis from "./components/CompetitorAnalysis";
import ExecutiveSummary from "./components/ExecutiveSummary";
import MarketWRIScoreCards from "./components/MarketWRIScoreCards";
import WRIStrategicDirection from "./components/WRIStrategicDirection";
import AttributeResonanceDefinition from "./components/AttributeResonanceDefinition";
import MarketRecommendations from "./components/MarketRecommendations";
import AIChatPanel from "./components/AIChatPanel";
import AIFloatingButton from "./components/AIFloatingButton";
import bmwLogo from "./assets/bmw-black.jpg";
import Login from "./components/Login";
import { r12gsConsumerData } from './data/r12gsConsumerData';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import LandscapeIcon from '@mui/icons-material/Landscape';

const R12GSConsumerAnalysis = lazy(() => import("./components/R12GSConsumerAnalysis"));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [selectedMarket, setSelectedMarket] = useState("france");
  const [currentTab, setCurrentTab] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
  };

  if (!loggedIn) {
    return <Login onLogin={setLoggedIn} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          transition: "all 0.3s ease-in-out",
        }}
      >
        {/* Main Content Area */}
        <Box
          sx={{
            flex: 1,
            transition: "margin-right 0.3s ease-in-out",
            marginRight: isChatOpen ? { xs: 0, sm: "400px", md: "450px" } : 0,
            overflow: "hidden",
          }}
        >
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  mb: { xs: 2, md: 0 },
                }}
              >
                <img
                  src={bmwLogo}
                  alt="BMW Motorrad Logo"
                  style={{
                    height: "40px",
                    width: "auto",
                    objectFit: "contain",
                  }}
                />
                <Box>
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                      fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                      fontWeight: 700,
                      color: "primary.main",
                      fontFamily: "BMW Motorrad",
                      letterSpacing: "-0.02em",
                      mb: 0.5,
                    }}
                  >
                    Adventure Segment Insights: Pre-Launch R 12 G/S
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                      color: "text.secondary",
                      fontFamily: "BMW Motorrad",
                      fontWeight: 400,
                    }}
                  >
                    V2 Region Analysis
                  </Typography>
                </Box>
              </Box>
              <MarketSelector
                selectedMarket={selectedMarket}
                onMarketChange={setSelectedMarket}
              />
            </Box>

            <Paper sx={{ mb: 3 }}>
              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  "& .MuiTab-root": {
                    fontSize: "0.9rem",
                    minHeight: 48,
                    fontFamily: "BMW Motorrad",
                    textTransform: "none",
                    fontWeight: 500,
                    color: "text.secondary",
                    "&.Mui-selected": {
                      color: (theme) =>
                        currentTab === 6
                          ? theme.palette.primary.main
                          : '#388e3c', // green accent for segment tabs
                      fontWeight: 700,
                      backgroundColor: (theme) =>
                        currentTab === 6
                          ? 'rgba(25, 118, 210, 0.08)' // blue accent for model tab
                          : 'rgba(56, 142, 60, 0.08)', // green accent for segment tabs
                      borderRadius: 2,
                    },
                  },
                }}
              >
                <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><LandscapeIcon fontSize="small" /><TwoWheelerIcon fontSize="small" sx={{ color: '#1976d2' }} />Market Overview</Box>} />
                <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><LandscapeIcon fontSize="small" />Executive Summary</Box>} />
                <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><LandscapeIcon fontSize="small" />Attribute Resonance</Box>} />
                <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><LandscapeIcon fontSize="small" />Market Insights</Box>} />
                <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><LandscapeIcon fontSize="small" />Competitor Analysis</Box>} />
                <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><LandscapeIcon fontSize="small" />Recommendations</Box>} />
                <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><TwoWheelerIcon fontSize="small" sx={{ color: '#1976d2' }} />Model Specific Insights: R 12 G/S</Box>} />
              </Tabs>
            </Paper>

            <TabPanel value={currentTab} index={0}>
              <DashboardIntro selectedMarket={selectedMarket} />
            </TabPanel>

            <TabPanel value={currentTab} index={1}>
              <ExecutiveSummary selectedMarket={selectedMarket} />
            </TabPanel>

            <TabPanel value={currentTab} index={2}>
              <AttributeResonanceDefinition selectedMarket={selectedMarket} />
              <Box sx={{ mt: 4 }}>
                <MarketWRIScoreCards selectedMarket={selectedMarket} />
              </Box>
              <Box sx={{ mt: 4 }}>
                <AttributeHeatmap selectedMarket={selectedMarket} />
              </Box>
              <Box sx={{ mt: 4 }}>
                <WRIStrategicDirection selectedMarket={selectedMarket} />
              </Box>
            </TabPanel>

            <TabPanel value={currentTab} index={3}>
              <ConversationInsights selectedMarket={selectedMarket} />
            </TabPanel>

            <TabPanel value={currentTab} index={4}>
              <CompetitorAnalysis selectedMarket={selectedMarket} />
            </TabPanel>

            <TabPanel value={currentTab} index={5}>
              <MarketRecommendations selectedMarket={selectedMarket} />
            </TabPanel>

            <TabPanel value={currentTab} index={6}>
              <Suspense fallback={<div>Loading...</div>}>
                <R12GSConsumerAnalysis
                  key={selectedMarket}
                  selectedMarket={selectedMarket}
                  data={r12gsConsumerData}
                />
              </Suspense>
            </TabPanel>

            <Box
              component="footer"
              sx={{
                mt: 6,
                py: 3,
                borderTop: 1,
                borderColor: "divider",
                textAlign: "center",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontFamily: "BMW Motorrad" }}
              >
                © {new Date().getFullYear()} BMW Motorrad. All rights reserved.
              </Typography>
            </Box>
          </Container>
        </Box>

        {/* AI Chat Components */}
        <AIFloatingButton onClick={handleChatToggle} isOpen={isChatOpen} />
        <AIChatPanel isOpen={isChatOpen} onClose={handleChatClose} />
      </Box>
    </ThemeProvider>
  );
}

export default App;
