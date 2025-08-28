const OpenAI = require("openai").default;
const { getSystemMessage, getAIConfig } = require("../ai/system-prompt");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Use VS_REPORTS_STORE_ID as primary, with fallbacks for compatibility
const VECTOR_STORE_ID =
  process.env.VS_REPORTS_STORE_ID || process.env.R12GS_VECTOR_STORE_ID || process.env.REACT_APP_R12GS_VECTOR_STORE_ID;

module.exports = async (req, res) => {
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

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
}; 