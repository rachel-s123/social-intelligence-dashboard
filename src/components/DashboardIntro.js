import React, { useState, useRef, useEffect } from 'react';
import { Paper, Typography, Grid, Box, Tabs, Tab, Card, CardContent, Divider, Link, IconButton, Button, Slider, Tooltip, Fade } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InsightsIcon from '@mui/icons-material/Insights';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import GroupsIcon from '@mui/icons-material/Groups';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InfoIcon from '@mui/icons-material/Info';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import DownloadIcon from '@mui/icons-material/Download';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { getMarketIntroduction, marketIntroductions } from '../data/marketIntroductions';
import { marketSources } from '../data/marketSources';
import { getMarketDisplayName } from '../utils/marketDisplayName';
import LandscapeIcon from '@mui/icons-material/Landscape';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import { r12gsConsumerData } from '../data/r12gsConsumerData';

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const TabPanel = ({ children, value, index }) => (
  <Box hidden={value !== index} sx={{ pt: 3 }}>
    {value === index && children}
  </Box>
);

const sectionData = [
  {
    title: 'Executive Summary',
    description: "High-level overview of market performance, key trends, and strategic implications for BMW's touring motorcycle segment.",
    icon: <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />,
  },
  {
    title: 'Attribute Resonance',
    description: 'Detailed analysis of how different product attributes and features resonate with consumers, helping inform product strategy and marketing focus.',
    icon: <InsightsIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />,
  },
  {
    title: 'Conversation Insights',
    description: 'In-depth analysis of consumer conversations, sentiment, and key discussion themes across platforms.',
    icon: <ShowChartIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />,
  },
  {
    title: 'Competitor Analysis',
    description: "Comprehensive evaluation of competitor positioning, market share, and strategic implications for BMW's touring motorcycle portfolio.",
    icon: <GroupsIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />,
  },
  {
    title: 'Recommendations',
    description: 'Actionable marketing, strategy, and communications recommendations based on segment and model-level insights.',
    icon: <LightbulbIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />,
  },
  {
    title: 'Model Specific Insights: R 12 G/S',
    description: 'Specialized research into authentic consumer conversations and model-level insights for the R 12 G/S, focusing on sentiment, themes, and purchase intent from March to June 2025.',
    icon: <AnalyticsIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />,
  },
];

const methodologyData = [
  {
    title: 'Conversation Analysis',
    description: 'Monitors volume and sentiment of online discussions, tracks share of voice across competitors, analyzes key themes and consumer concerns, and identifies emerging trends and pain points.',
    icon: <AnalyticsIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />,
  },
  {
    title: 'Weighted Resonance Index',
    description: 'Evaluates 20 key market attributes, weights importance across sales data, social discussions, consumer reviews, and expert analysis, provides quantitative measure of attribute significance, and identifies critical market drivers and barriers.',
    icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />,
  },
  {
    title: 'R 12 G/S Consumer Analysis',
    description: 'R 12 G/S Consumer Analysis uses specialised research prompts to gather authentic consumer conversations specifically from social media and forums, focusing exclusively on genuine consumer discussions about the R 12 G/S from March to June 2025.',
    icon: <GroupsIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />,
  },
];

const scopeData = [
  {
    title: 'Dashboard Scope',
    description: 'This dashboard provides comprehensive insights into the entire touring motorcycle segment, with a specific focus on the R 1300 RT launch and now the R 12 G/S consumer analysis. All attribute scores and sentiment analysis are derived from conversations and data across the entire segment, including dedicated R 12 G/S consumer insights from March to June 2025, offering a holistic view of market dynamics and consumer preferences.',
    icon: <InfoIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />,
  }
];

const usageData = [
  {
    title: 'Strategic Applications',
    description: 'The insights provided in this dashboard can be leveraged to support key business decisions including: targeting specific consumer segments, developing effective messaging strategies, refining market positioning, and making informed strategic decisions about product development and market entry.',
    icon: <LightbulbIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />,
  }
];

const SourceItem = ({ source }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
      {source.name}
      {source.type && (
        <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
          ({source.type})
        </Typography>
      )}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {source.description}
    </Typography>
  </Box>
);

// Helper to extract only the dashboard scope from introduction
const getScopeText = (intro) => {
  if (!intro) return '';
  const split = intro.split('## Dashboard Sections');
  return split[0].trim();
};

const DashboardIntro = ({ selectedMarket }) => {
  const [tabValue, setTabValue] = useState(0);
  const [subTabValue, setSubTabValue] = useState(0);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef(null);
  
  // Updated market key matching logic to handle all formats
  const normalizedMarket = (selectedMarket || '').toLowerCase().replace(/\s+/g, '_');
  const introMarketKey = Object.keys(marketIntroductions).find(key =>
    key.toLowerCase().endsWith(normalizedMarket)
  );
  const marketData = introMarketKey ? marketIntroductions[introMarketKey] : null;
  const marketKey = Object.keys(marketSources).find(key =>
    key.toLowerCase().endsWith(normalizedMarket)
  );
  const sources = marketKey && marketSources[marketKey]?.sources?.[''] || [];
  const displayMarketName = getMarketDisplayName(selectedMarket);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSubTabChange = (event, newValue) => setSubTabValue(newValue);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handlePreviousPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    const market = selectedMarket.toLowerCase();
    link.href = `/vector_reports/r12gs/${market}-r12gs.pdf`;
    link.download = `${getMarketDisplayName(selectedMarket)}-r12gs.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (isFullscreen) {
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  };
  return (
    <Box sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 4 }, background: '#f8fafc' }}>
      {/* Icon Legend for Market Overview */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2, mt: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LandscapeIcon fontSize="small" sx={{ color: '#388e3c' }} />
          <Typography variant="body2" sx={{ fontFamily: 'BMW Motorrad', color: '#388e3c', fontWeight: 500 }}>
            Segment-level data
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TwoWheelerIcon fontSize="small" sx={{ color: '#1976d2' }} />
          <Typography variant="body2" sx={{ fontFamily: 'BMW Motorrad', color: '#1976d2', fontWeight: 500 }}>
            Model-level data
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LandscapeIcon fontSize="small" sx={{ color: '#388e3c' }} />
          <TwoWheelerIcon fontSize="small" sx={{ color: '#1976d2' }} />
          <Typography variant="body2" sx={{ fontFamily: 'BMW Motorrad', color: '#333', fontWeight: 500 }}>
            Both segment & model-level data
          </Typography>
        </Box>
      </Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Understanding the Data" />
          <Tab label="Data Sources" />
          <Tab label="Full Report" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {/* Top: Dashboard Scope & Strategic Applications */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          <Card sx={{ flex: '1 1 0', minWidth: 300, maxWidth: 600, boxShadow: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {scopeData[0].icon}
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, mt: 1, textAlign: 'center' }}>
                {scopeData[0].title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                {marketData ? getScopeText(marketData.introduction) : scopeData[0].description}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: '1 1 0', minWidth: 300, maxWidth: 600, boxShadow: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {usageData[0].icon}
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, mt: 1, textAlign: 'center' }}>
                {usageData[0].title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                {usageData[0].description}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        {/* Dashboard Sections */}
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: '1.1rem',
            fontWeight: 500,
            mb: 3,
            px: { xs: 0, md: 0 }
          }}
        >
          Dashboard Sections
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'nowrap', overflowX: 'auto', justifyContent: 'space-between', alignItems: 'stretch', height: '100%' }}>
          {sectionData.map((section, idx) => (
            <Card key={section.title} sx={{ flex: '1 1 0', minWidth: 180, maxWidth: 240, minHeight: '100%', boxShadow: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3, px: 2 }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {section.icon}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, mt: 1, textAlign: 'center' }}>
                  {section.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  {section.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
        {/* Methodology Header */}
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: '1.1rem',
            fontWeight: 500,
            mb: 3,
            px: { xs: 0, md: 0 }
          }}
        >
          Methodology
        </Typography>
        {/* Methodology Section in two boxes */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {methodologyData.map((m, idx) => (
            <Card key={m.title} sx={{ flex: '1 1 30%', minWidth: 220, maxWidth: 1, boxShadow: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {m.icon}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, mt: 1, textAlign: 'center' }}>
                  {m.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  {m.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* New: Sub-tabs for Segment vs Model Data Sources */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={subTabValue} onChange={handleSubTabChange}>
            <Tab label="Segment Data Sources" />
            <Tab label="Model Data Sources" />
          </Tabs>
        </Box>
        {/* Segment Data Sources */}
        <TabPanel value={subTabValue} index={0}>
          {selectedMarket && sources.length > 0 ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Segment Data Sources for {getMarketDisplayName(selectedMarket)}
              </Typography>
              {sources.map((source, index) => (
                <SourceItem key={index} source={source} />
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary">
              Please select a market to view its segment data sources.
            </Typography>
          )}
        </TabPanel>
        {/* Model Data Sources */}
        <TabPanel value={subTabValue} index={1}>
          {selectedMarket && r12gsConsumerData[selectedMarket.toLowerCase()] && r12gsConsumerData[selectedMarket.toLowerCase()].consumerQuotes.length > 0 ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Model Data Sources for {getMarketDisplayName(selectedMarket)}
              </Typography>
              {r12gsConsumerData[selectedMarket.toLowerCase()].consumerQuotes.map((quote, idx) => (
                <Box key={idx} sx={{ mb: 2, p: 2, border: '1px solid #e3f2fd', borderRadius: 2, background: '#fafdff' }}>
                  <Typography variant="body2" sx={{ fontFamily: 'BMW Motorrad', fontWeight: 500, mb: 0.5 }}>
                    "{quote.text}"
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Platform: {quote.platform}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary">
              No model data sources available for this market.
            </Typography>
          )}
        </TabPanel>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            p: 2,
            position: isFullscreen ? 'fixed' : 'relative',
            top: isFullscreen ? 0 : 'auto',
            left: isFullscreen ? 0 : 'auto',
            right: isFullscreen ? 0 : 'auto',
            bottom: isFullscreen ? 0 : 'auto',
            zIndex: isFullscreen ? 9999 : 'auto',
            bgcolor: isFullscreen ? 'white' : 'transparent',
            height: isFullscreen ? '100vh' : 'auto',
            overflow: isFullscreen ? 'auto' : 'visible'
          }}
        >
          <Card sx={{ 
            width: '100%', 
            maxWidth: isFullscreen ? '100%' : 800, 
            boxShadow: 3, 
            borderRadius: 2,
            mb: 2,
            position: 'relative',
            overflow: 'visible'
          }}>
            <Fade in={showControls}>
              <Box sx={{ 
                position: 'sticky',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 2,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(4px)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                p: 1
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PictureAsPdfIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                    <Typography variant="h6">Full Market Report</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Download PDF">
                      <IconButton onClick={handleDownload}>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
                      <IconButton onClick={toggleFullscreen}>
                        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            </Fade>

            <CardContent sx={{ pt: isFullscreen ? 8 : 2 }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 2,
                mb: 2,
                bgcolor: '#f5f5f5',
                p: 2,
                borderRadius: 1,
                position: 'relative'
              }}>
                <Document
                  file={`/vector_reports/r12gs/${selectedMarket.toLowerCase()}-r12gs.pdf`}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography>Loading PDF...</Typography>
                    </Box>
                  }
                  error={
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography color="error">Failed to load PDF. Please try again later.</Typography>
                    </Box>
                  }
                >
                  {Array.from(new Array(numPages), (el, index) => (
                    <Page 
                      key={`page_${index + 1}`}
                      pageNumber={index + 1}
                      scale={scale}
                      width={isFullscreen ? window.innerWidth * 0.8 : 700}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      style={{ marginBottom: '20px' }}
                    />
                  ))}
                </Document>
              </Box>

              <Fade in={showControls}>
                <Box sx={{ 
                  position: 'sticky',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  gap: 2,
                  mt: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(4px)',
                  p: 1,
                  borderRadius: 1,
                  zIndex: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={handleZoomOut} title="Zoom Out">
                      <ZoomOutIcon />
                    </IconButton>
                    <Typography sx={{ minWidth: 40, textAlign: 'center' }}>
                      {Math.round(scale * 100)}%
                    </Typography>
                    <IconButton onClick={handleZoomIn} title="Zoom In">
                      <ZoomInIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Fade>
            </CardContent>
          </Card>
        </Box>
      </TabPanel>
    </Box>
  );
};

export default DashboardIntro;