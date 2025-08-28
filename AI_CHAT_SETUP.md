# AI Chat Assistant

## Overview

The AI Chat Assistant is integrated into the Model Insights dashboard, providing intelligent analysis based on the selected market.

## Features

### 🤖 AI Chat Panel

- **Sliding Panel**: Opens from the right side of the screen
- **Auto-streaming Responses**: Real-time streaming of AI responses
- **Smart Interruption**: Stop streaming by interacting with the panel during response generation
- **Message History**: Full conversation history with timestamps

### 🎯 Chat Controls

- **Download Chat**: Export conversation history as a text file
- **New Chat**: Clear conversation and start fresh
- **Close Panel**: Slide panel closed while preserving conversation

### 🚀 Floating AI Button

- **Fixed Position**: Always accessible in bottom-right corner
- **Smooth Animations**: Elegant hover effects and transitions
- **Auto-hide**: Disappears when chat panel is open

## How to Use

### 1. Starting a Conversation

- Click the floating AI button (🤖) in the bottom-right corner
- The chat panel will slide in from the right
- Type your question in the input box at the bottom
- Press Enter or click the send button

### 2. During Streaming

- AI responses stream in real-time
- Click anywhere in the panel to stop streaming if needed
- New messages will automatically interrupt ongoing responses

### 3. Managing Conversations

- **Download**: Click the download icon to save your chat
- **New Chat**: Click the + icon to start a fresh conversation
- **Close**: Click the X icon to close the panel

## Technical Setup

### Environment Variables

Make sure your `.env` file contains:

```
OPENAI_API_KEY=your_openai_api_key_here
R12GS_VECTOR_STORE_ID=your_vector_store_id_here
R12GS_REPORTS_VECTOR_STORE_ID=your_reports_vector_store_id_here
```

### Running the Application

#### Development Mode (React only)

```bash
npm start
```

_Note: Chat functionality requires the backend server_

#### Production Mode (with AI Chat)

```bash
# Build the React app
npm run build

# Start the Express server with AI chat
npm run server
```

#### Development with Backend

```bash
# Build and run with backend
npm run dev-server
```

### Server Configuration

- **Port**: 3001 (configurable via PORT environment variable)
- **API Endpoint**: `/api/chat` for streaming responses

## AI Assistant Capabilities

The AI assistant answers questions about R 12 G/S consumer conversations and reports:

- **Market Insights**: Analysis of specific markets
- **Data Interpretation**: Explaining charts, metrics, and trends
- **Report References**: Locating details in the uploaded PDFs

## Example Questions

Try asking the AI assistant questions like:

- "What are the key insights for the French market?"
- "How do riders in Italy feel about the R 12 G/S?"
- "Where in the reports is suspension discussed?"

## Troubleshooting

### Chat Not Working

1. Check that the server is running (`npm run server`)
2. Verify environment variables are set correctly
3. Check browser console for error messages
4. Ensure OpenAI API key has sufficient credits

### Streaming Issues

1. Check network connection
2. Verify API endpoint is accessible
3. Look for CORS issues in browser console

### Performance

- Large conversations may impact performance
- Use "New Chat" to reset for better performance
- Download important conversations before clearing

## Architecture

### Frontend Components

- `AIChatPanel.js`: Main chat interface with streaming support
- `AIFloatingButton.js`: Floating action button
- Integrated into `App.js` with state management

### Backend

- `server.js`: Express server with OpenAI integration
- Streaming API endpoint for real-time responses
- Vector store integration for context-aware responses

### API Integration

- OpenAI GPT-4 for intelligent responses
- Vector store for document-based context
- Streaming responses for better UX
