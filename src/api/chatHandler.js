import OpenAI from "openai";

// Import AI configuration
const { getSystemMessage, getAIConfig } = require("../../ai/system-prompt");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
});

const VECTOR_STORE_ID =
  process.env.REACT_APP_VS_STORE_ID || process.env.VS_STORE_ID;

export const handleChatRequest = async (messages) => {
  try {
    // Create a thread for the conversation
    const thread = await openai.beta.threads.create();

    // Add the user's message to the thread
    const lastMessage = messages[messages.length - 1];
    await openai.beta.threads.messages.create(thread.id, {
      role: lastMessage.role,
      content: lastMessage.content,
    });

    // Create an assistant with access to the vector store
    const assistant = await openai.beta.assistants.create({
      name: "BMW Motorrad Market Analysis Assistant",
      instructions: getSystemMessage().content,
      model: "gpt-4-1106-preview",
      tools: [{ type: "file_search" }],
      tool_resources: {
        file_search: {
          vector_store_ids: [VECTOR_STORE_ID],
        },
      },
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });

    // Poll for completion
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

    while (runStatus.status !== "completed" && runStatus.status !== "failed") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    if (runStatus.status === "failed") {
      throw new Error("Assistant run failed");
    }

    // Get the assistant's response
    const threadMessages = await openai.beta.threads.messages.list(thread.id);
    const assistantMessage = threadMessages.data.find(
      (msg) => msg.role === "assistant"
    );

    // Clean up
    await openai.beta.assistants.del(assistant.id);

    return assistantMessage.content[0].text.value;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to get AI response");
  }
};

// Streaming version for real-time responses
export const handleStreamingChatRequest = async (messages, onChunk) => {
  try {
    const aiConfig = getAIConfig();

    const stream = await openai.chat.completions.create({
      model: aiConfig.model,
      messages: [getSystemMessage(), ...messages],
      stream: aiConfig.stream,
      temperature: aiConfig.temperature,
      max_tokens: aiConfig.max_tokens,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        onChunk(content);
      }
    }
  } catch (error) {
    console.error("OpenAI streaming error:", error);
    throw new Error("Failed to get streaming AI response");
  }
};
