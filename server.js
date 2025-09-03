const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

console.log("DEBUG: OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "✅ Found" : "❌ Not found");


// Import AI configuration
const { getSystemMessage, getAIConfig } = require("./ai/system-prompt");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Increase header size limits to prevent 431 errors
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  next();
});

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, "build")));

// Serve R 12 G/S PDF reports
app.use('/vector_reports', express.static(path.join(__dirname, 'vector_reports')));

// Serve public assets
app.use('/public', express.static(path.join(__dirname, 'public')));

// OpenAI setup
const OpenAI = require("openai").default;
const { getReportVectorStoreId } = require("./config/getReportVectorStoreId");

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Use VS_REPORTS_STORE_ID for vector store configuration
const VECTOR_STORE_ID = process.env.VS_REPORTS_STORE_ID;

// Prefer R12GS_REPORTS_VECTOR_STORE_ID but fall back to client-side variable
const REPORTS_VECTOR_STORE_ID = getReportVectorStoreId();

// Chat API endpoint using Chat Completions with vector store retrieval
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    console.log("Received chat request with messages:", messages);

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    if (!VECTOR_STORE_ID) {
      throw new Error("VECTOR_STORE_ID is not configured");
    }

    // Set headers for streaming
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Get the latest user message for vector store search
    const latestUserMessage = messages[messages.length - 1];

    console.log("Latest user message:", latestUserMessage.content);

    // Search vector store for relevant context
    let contextFromVectorStore = "";
    try {
      console.log("Starting vector store search with ID:", VECTOR_STORE_ID);
      
      // Add timeout to vector store search
      const searchTimeout = setTimeout(() => {
        console.log("Vector store search timed out, proceeding without context");
        throw new Error("Vector store search timeout");
      }, 15000); // 15 second timeout
      
      // Create a temporary assistant just for file search
      const searchAssistant = await openai.beta.assistants.create({
        name: "Search Assistant",
        instructions:
          "You are a search assistant. Extract relevant information from the files.",
        model: "gpt-4o-mini",
        tools: [{ type: "file_search" }],
        tool_resources: {
          file_search: {
            vector_store_ids: [VECTOR_STORE_ID],
          },
        },
      });

      console.log("Created search assistant:", searchAssistant.id);

      // Create thread and search
      const thread = await openai.beta.threads.create();
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: `Search for information relevant to: ${latestUserMessage.content}`,
      });

      console.log("Created thread and message, starting run...");

      const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
        assistant_id: searchAssistant.id,
        poll_interval_ms: 1000, // Poll every second
      });

      console.log("Run completed with status:", run.status);

      if (run.status === "completed") {
        const threadMessages = await openai.beta.threads.messages.list(
          thread.id
        );
        const assistantMessage = threadMessages.data.find(
          (msg) => msg.role === "assistant"
        );
        if (assistantMessage && assistantMessage.content[0]) {
          contextFromVectorStore = assistantMessage.content[0].text.value;
          console.log("Found context from vector store:", contextFromVectorStore.substring(0, 200) + "...");
        }
      } else {
        console.log("Run failed or timed out with status:", run.status);
      }

      // Clean up
      await openai.beta.assistants.del(searchAssistant.id);
      console.log("Cleaned up search assistant");
      
      clearTimeout(searchTimeout);
    } catch (searchError) {
      console.log(
        "Vector store search failed, proceeding without context:",
        searchError.message
      );
    }

    // Get AI configuration
    const aiConfig = getAIConfig();

    // Prepare messages with vector store context
    const systemMessage = getSystemMessage();
    if (contextFromVectorStore) {
      systemMessage.content += `\n\nRelevant information from vector store ${VECTOR_STORE_ID}:\n${contextFromVectorStore}`;
    }

    // Create streaming response using Chat Completions
    const stream = await openai.chat.completions.create({
      model: aiConfig.model,
      messages: [systemMessage, ...messages],
      stream: aiConfig.stream,
      temperature: aiConfig.temperature,
      max_tokens: aiConfig.max_tokens,
    });

    // Stream the response
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(
          `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`
        );
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Chat API error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        error: "Failed to get AI response",
        details: error.message,
      });
    } else {
      res.write(
        `data: ${JSON.stringify({ error: "Stream error occurred" })}\n\n`
      );
      res.end();
    }
  }
});

// AI Insights endpoint
app.post("/api/insights", require("./api/insights"));

// Data Refresh endpoint
app.post("/api/refresh-data", async (req, res) => {
  console.log("🔄 Data refresh endpoint called");

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { runWeeklyRefresh } = require("./scripts/weekly-refresh");

    // Start the refresh process (async, don't wait)
    runWeeklyRefresh()
      .then(() => {
        console.log("✅ Data refresh completed successfully");
      })
      .catch(error => {
        console.error("❌ Data refresh failed:", error);
      });

    // Respond immediately with success
    res.json({
      success: true,
      message: "Data refresh started. This may take several minutes to complete.",
      status: "in_progress"
    });

  } catch (error) {
    console.error("❌ Data refresh endpoint error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to start data refresh",
      details: error.message
    });
  }
});

// Data Refresh Status endpoint
app.get("/api/refresh-status", async (req, res) => {
  console.log("📊 Refresh status endpoint called");

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { getLastRefreshTime, shouldRunRefresh } = require("./scripts/weekly-refresh");

    const lastRefresh = getLastRefreshTime();
    const shouldRun = shouldRunRefresh();

    res.json({
      success: true,
      lastRefresh: lastRefresh ? lastRefresh.toISOString() : null,
      shouldRunRefresh: shouldRun,
      nextRefreshDue: lastRefresh ? new Date(lastRefresh.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() : null
    });

  } catch (error) {
    console.error("❌ Refresh status endpoint error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get refresh status",
      details: error.message
    });
  }
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 Server URL: http://localhost:${PORT}`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`🔌 API Endpoints: http://localhost:${PORT}/api/*`);
    console.log(
      `🔑 OpenAI API Key configured: ${process.env.OPENAI_API_KEY ? "Yes" : "No"}`
    );
    console.log(
      `📊 Vector Store ID configured: ${process.env.VS_REPORTS_STORE_ID ? "Yes" : "No"}`
    );
    console.log(
      `🎯 Vector Store ID: ${process.env.VS_REPORTS_STORE_ID || "Not configured"}`
    );
    console.log(
      `📑 Reports Vector Store ID configured: ${
        REPORTS_VECTOR_STORE_ID ? "Yes" : "No"
      }`
    );
    console.log(
      `📂 Reports Vector Store ID: ${REPORTS_VECTOR_STORE_ID || "Not configured"}`
    );
    console.log(
      `🤖 AI Model: ${require("./ai/system-prompt").getAIConfig().model}`
    );
    console.log(
      `\n✅ Everything is running on ONE PORT! Visit http://localhost:${PORT} to use the application`
    );
    console.log(`📱 Frontend + Backend consolidated into single server process`);
  });
}

// Export the Express API
module.exports = app;
