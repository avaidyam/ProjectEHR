import React, { useState } from "react";
import { Paper, Box, TextField, Button, Typography, Stack } from "@mui/material";

export default function ChatPanel() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newUserMessage = { role: "user", content: input };
    const updatedMessages = [...messages, newUserMessage];

    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/llm/", {
        method: "POST",
        body: JSON.stringify({
            prompt: input,
            history: updatedMessages,
        })
      });

      const aiMessage = {
        role: "assistant",
        content: response.data.reply,
      };

      setMessages([...updatedMessages, aiMessage]);
    } catch (error) {
      console.error("LLM error:", error);
      const errorMessage = {
        role: "assistant",
        content: "(Error fetching response)",
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <Box>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 2,
          height: 400,
          overflowY: "auto",
          bgcolor: "background.paper",
        }}
      >
        <Stack spacing={1}>
          {messages.map((msg, i) => {
            const isUser = msg.role === "user";
            return (
              <Box
                key={i}
                display="flex"
                justifyContent={isUser ? "flex-end" : "flex-start"}
              >
                <Typography
                  sx={{
                    bgcolor: isUser ? "primary.main" : "secondary.main",
                    color: isUser
                      ? "primary.contrastText"
                      : "secondary.contrastText",
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    maxWidth: "75%",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.content}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Paper>

      <Box display="flex" gap={1}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask the patient..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={loading}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={sendMessage}
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </Button>
      </Box>
    </Box>
  );
}
