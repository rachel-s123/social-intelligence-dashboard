const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Import AI configuration
const { getSystemMessage, getAIConfig } = require("./ai/system-prompt");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, "build")));

// OpenAI setup
const OpenAI = require("openai").default;
const { getReportVectorStoreId } = require("./config/getReportVectorStoreId");

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Prefer VS_STORE_ID but fall back to REACT_APP_VS_STORE_ID for client and server environments
const VECTOR_STORE_ID =
  process.env.VS_STORE_ID || process.env.REACT_APP_VS_STORE_ID;

// Prefer VS_REPORTS_STORE_ID but fall back to client-side variable
const REPORTS_VECTOR_STORE_ID = getReportVectorStoreId();

// Test chat endpoint (simple, no vector store)
app.post("/api/test-chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    if (!openai) {
      return res.status(500).json({ 
        error: "OpenAI client not initialized", 
        details: "OPENAI_API_KEY environment variable is not set" 
      });
    }

    // Simple test without vector store
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant for BMW Motorrad market analysis. Keep responses brief and focused."
        },
        ...messages
      ],
      stream: false,
      temperature: 0.2,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || "No response generated";
    
    res.json({
      choices: [{
        message: {
          content: content
        }
      }]
    });

  } catch (error) {
    console.error("Test chat API error:", error);
    res.status(500).json({
      error: "Failed to get AI response",
      details: error.message,
    });
  }
});

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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// AI Insights endpoint
app.post("/api/insights", require("./api/insights"));

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
    console.log(
      `🔑 OpenAI API Key configured: ${process.env.OPENAI_API_KEY ? "Yes" : "No"}`
    );
    console.log(
      `📊 Vector Store ID configured: ${process.env.VS_STORE_ID ? "Yes" : "No"}`
    );
    console.log(
      `🎯 Vector Store ID: ${process.env.VS_STORE_ID || "Not configured"}`
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
      `\n✅ Server ready! Visit http://localhost:${PORT} to use the application`
    );
  });
}

// Export the Express API
module.exports = app;
