const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Import AI configuration
const { getSystemMessage, getAIConfig } = require("./ai/system-prompt");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, "build")));

// OpenAI setup
const OpenAI = require("openai").default;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const VECTOR_STORE_ID = process.env.VS_STORE_ID;

// Chat API endpoint using Chat Completions with vector store retrieval
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    // Set headers for streaming
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Get the latest user message for vector store search
    const latestUserMessage = messages[messages.length - 1];

    // Search vector store for relevant context
    let contextFromVectorStore = "";
    try {
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

      // Create thread and search
      const thread = await openai.beta.threads.create();
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: `Search for information relevant to: ${latestUserMessage.content}`,
      });

      const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
        assistant_id: searchAssistant.id,
      });

      if (run.status === "completed") {
        const threadMessages = await openai.beta.threads.messages.list(
          thread.id
        );
        const assistantMessage = threadMessages.data.find(
          (msg) => msg.role === "assistant"
        );
        if (assistantMessage && assistantMessage.content[0]) {
          contextFromVectorStore = assistantMessage.content[0].text.value;
        }
      }

      // Clean up
      await openai.beta.assistants.del(searchAssistant.id);
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
      `🤖 AI Model: ${require("./ai/system-prompt").getAIConfig().model}`
    );
    console.log(
      `\n✅ Server ready! Visit http://localhost:${PORT} to use the application`
    );
  });
}

// Export the Express API
module.exports = app;
