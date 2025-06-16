import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Divider,
  Slide,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Send as SendIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Add as NewChatIcon,
  SmartToy as AIIcon,
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css"; // You can choose different themes

const AIChatPanel = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Add initial welcome message when chat panel opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        role: "assistant",
        content: `# Welcome to the BMW Motorrad AI Assistant

I can help you:
- Access and analyze the original long-form market reports
- Provide deeper insights based on the comprehensive market data
- Answer specific questions about market performance and trends
- Help navigate and understand the detailed market analysis

To get started, simply type your question about the market data or reports. I'll reference the original market reports to provide detailed answers, and you can ask follow-up questions to explore specific aspects of the market analysis.`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleUserInteraction = () => {
    if (isStreaming) {
      setUserInteracted(true);
      // Abort current streaming
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  };

  const sendMessage = async (message) => {
    if (!message.trim() || isStreaming) return;

    const userMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsStreaming(true);
    setUserInteracted(false);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Add assistant message placeholder
      const assistantMessage = {
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        // Check if user interacted during streaming
        if (userInteracted) {
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        // Process each line outside the loop to avoid the warning
        const processLine = (line) => {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              return false; // Signal to break
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || "";
              if (content) {
                accumulatedContent += content;

                // Update the last message with accumulated content
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage.role === "assistant") {
                    lastMessage.content = accumulatedContent;
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
          return true; // Continue processing
        };

        let shouldContinue = true;
        for (const line of lines) {
          if (!processLine(line)) {
            shouldContinue = false;
            break;
          }
        }

        if (!shouldContinue) break;
      }

      // Mark streaming as complete
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === "assistant") {
          lastMessage.isStreaming = false;
        }
        return newMessages;
      });
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Chat error:", error);
        const errorMessage = {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      setIsStreaming(false);
      setUserInteracted(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputValue("");
    setIsStreaming(false);
    setUserInteracted(false);
  };

  const handleDownloadChat = () => {
    const chatContent = messages
      .map(
        (msg) =>
          `${msg.role.toUpperCase()}: ${msg.content}\n${new Date(
            msg.timestamp
          ).toLocaleString()}\n\n`
      )
      .join("");

    const blob = new Blob([chatContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit>
      <Paper
        sx={{
          position: "fixed",
          top: 0,
          right: 0,
          width: { xs: "100vw", sm: "400px", md: "450px" },
          height: "100vh",
          zIndex: 1300,
          display: "flex",
          flexDirection: "column",
          borderRadius: 0,
          boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
        }}
        onClick={handleUserInteraction}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "primary.main",
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AIIcon />
            <Typography
              variant="h6"
              sx={{ fontFamily: "BMW Motorrad", fontWeight: 600 }}
            >
              AI Assistant
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Download Chat">
              <IconButton
                size="small"
                onClick={handleDownloadChat}
                disabled={messages.length === 0}
                sx={{ color: "white" }}
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="New Chat">
              <IconButton
                size="small"
                onClick={handleNewChat}
                disabled={messages.length === 0}
                sx={{ color: "white" }}
              >
                <NewChatIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Close">
              <IconButton
                size="small"
                onClick={onClose}
                sx={{ color: "white" }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Messages Area */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {messages.length === 0 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              <AIIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography
                variant="h6"
                sx={{ mb: 1, fontFamily: "BMW Motorrad" }}
              >
                BMW Motorrad AI Assistant
              </Typography>
              <Typography variant="body2">
                Ask me anything about the market analysis, insights, or
                recommendations.
              </Typography>
            </Box>
          )}

          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent:
                  message.role === "user" ? "flex-end" : "flex-start",
                mb: 1,
              }}
            >
              <Paper
                sx={{
                  p: 2,
                  maxWidth: "80%",
                  bgcolor:
                    message.role === "user"
                      ? "primary.main"
                      : message.isError
                      ? "error.light"
                      : "grey.100",
                  color: message.role === "user" ? "white" : "text.primary",
                  borderRadius: 2,
                  position: "relative",
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const langMatch = /language-(\w+)/.exec(className || "");
                      return !inline && langMatch ? (
                        <pre {...props}>
                          <code
                            className={`language-${langMatch[1]} ${className}`}
                            {...props}
                          >
                            {children}
                          </code>
                        </pre>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    p: ({ children }) => (
                      <Typography
                        variant="body2"
                        component="p"
                        sx={{ mb: 1, "&:last-child": { mb: 0 } }}
                      >
                        {children}
                      </Typography>
                    ),
                    h1: ({ children }) => (
                      <Typography
                        variant="h6"
                        component="h1"
                        sx={{ mb: 1, fontWeight: "bold" }}
                      >
                        {children}
                      </Typography>
                    ),
                    h2: ({ children }) => (
                      <Typography
                        variant="subtitle1"
                        component="h2"
                        sx={{ mb: 1, fontWeight: "bold" }}
                      >
                        {children}
                      </Typography>
                    ),
                    h3: ({ children }) => (
                      <Typography
                        variant="subtitle2"
                        component="h3"
                        sx={{ mb: 1, fontWeight: "bold" }}
                      >
                        {children}
                      </Typography>
                    ),
                    ul: ({ children }) => (
                      <Box component="ul" sx={{ pl: 2, mb: 1 }}>
                        {children}
                      </Box>
                    ),
                    ol: ({ children }) => (
                      <Box component="ol" sx={{ pl: 2, mb: 1 }}>
                        {children}
                      </Box>
                    ),
                    li: ({ children }) => (
                      <Typography
                        component="li"
                        variant="body2"
                        sx={{ mb: 0.5 }}
                      >
                        {children}
                      </Typography>
                    ),
                    blockquote: ({ children }) => (
                      <Box
                        component="blockquote"
                        sx={{
                          borderLeft: 3,
                          borderColor: "primary.main",
                          pl: 2,
                          ml: 1,
                          fontStyle: "italic",
                          opacity: 0.8,
                          mb: 1,
                        }}
                      >
                        {children}
                      </Box>
                    ),
                    table: ({ children }) => (
                      <Box sx={{ overflowX: "auto", mb: 1 }}>
                        <Box
                          component="table"
                          sx={{ width: "100%", borderCollapse: "collapse" }}
                        >
                          {children}
                        </Box>
                      </Box>
                    ),
                    th: ({ children }) => (
                      <Box
                        component="th"
                        sx={{
                          border: 1,
                          borderColor: "divider",
                          p: 1,
                          bgcolor: "grey.100",
                          fontWeight: "bold",
                        }}
                      >
                        <Typography variant="body2">{children}</Typography>
                      </Box>
                    ),
                    td: ({ children }) => (
                      <Box
                        component="td"
                        sx={{ border: 1, borderColor: "divider", p: 1 }}
                      >
                        <Typography variant="body2">{children}</Typography>
                      </Box>
                    ),
                  }}
                  sx={{
                    "& pre": {
                      backgroundColor: "rgba(0,0,0,0.05)",
                      padding: 1,
                      borderRadius: 1,
                      overflow: "auto",
                      fontSize: "0.875rem",
                      mb: 1,
                    },
                    "& code": {
                      backgroundColor: "rgba(0,0,0,0.05)",
                      padding: "2px 4px",
                      borderRadius: "3px",
                      fontSize: "0.875rem",
                      fontFamily: "monospace",
                    },
                    "& pre code": {
                      backgroundColor: "transparent",
                      padding: 0,
                    },
                    "& a": {
                      color: "primary.main",
                      textDecoration: "underline",
                    },
                    "& strong": {
                      fontWeight: "bold",
                    },
                    "& em": {
                      fontStyle: "italic",
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>

                {message.isStreaming && (
                  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <CircularProgress size={12} sx={{ mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      Typing...
                    </Typography>
                  </Box>
                )}

                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 1,
                    opacity: 0.7,
                    fontSize: "0.7rem",
                  }}
                >
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Typography>
              </Paper>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        <Divider />

        {/* Input Area */}
        <Box sx={{ p: 2 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything about the market analysis..."
              disabled={isStreaming}
              variant="outlined"
              size="small"
              InputProps={{
                endAdornment: (
                  <IconButton
                    type="submit"
                    disabled={!inputValue.trim() || isStreaming}
                    size="small"
                    sx={{ ml: 1 }}
                  >
                    {isStreaming ? (
                      <CircularProgress size={20} />
                    ) : (
                      <SendIcon />
                    )}
                  </IconButton>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </form>
        </Box>
      </Paper>
    </Slide>
  );
};

export default AIChatPanel;
