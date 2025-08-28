import React, { useState, lazy, Suspense } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { Container, CssBaseline, Typography, Box } from "@mui/material";
import theme from "./theme";
import "./styles/fonts.css";
import MarketSelector from "./components/MarketSelector";
import AIChatPanel from "./components/AIChatPanel";
import AIFloatingButton from "./components/AIFloatingButton";
import bmwLogo from "./assets/bmw-black.jpg";
import Login from "./components/Login";
import { r12gsConsumerData } from "./data/r12gsConsumerData";

const R12GSConsumerAnalysis = lazy(() => import("./components/R12GSConsumerAnalysis"));

function App() {
  const [selectedMarket, setSelectedMarket] = useState("france");
  const [loggedIn, setLoggedIn] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

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
                    Model Insights: R 12 G/S
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
                    Explore market insights for the R 12 G/S
                  </Typography>
                </Box>
              </Box>
              <MarketSelector
                selectedMarket={selectedMarket}
                onMarketChange={setSelectedMarket}
              />
            </Box>


            <Suspense fallback={<div>Loading...</div>}>
              <R12GSConsumerAnalysis
                key={selectedMarket}
                selectedMarket={selectedMarket}
                data={r12gsConsumerData}
              />
            </Suspense>

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
