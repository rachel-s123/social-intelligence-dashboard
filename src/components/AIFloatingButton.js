import React from "react";
import { Fab, Tooltip, Zoom, Typography, Box } from "@mui/material";
import { SmartToy as AIIcon } from "@mui/icons-material";

const AIFloatingButton = ({ onClick, isOpen }) => {
  return (
    <Zoom in={!isOpen}>
      <Tooltip
        title={
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              BMW Motorrad AI Assistant
            </Typography>
            <Typography variant="body2">
              Access deeper market insights and analysis through our AI-powered assistant. Get detailed information about market performance, trends, and strategic recommendations.
            </Typography>
          </Box>
        }
        placement="left"
        arrow
      >
        <Fab
          color="primary"
          onClick={onClick}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1200,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            "&:hover": {
              transform: "scale(1.1)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
            },
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
          }}
        >
          <AIIcon sx={{ fontSize: 28 }} />
        </Fab>
      </Tooltip>
    </Zoom>
  );
};

export default AIFloatingButton;
