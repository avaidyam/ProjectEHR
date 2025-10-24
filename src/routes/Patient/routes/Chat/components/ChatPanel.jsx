import React, { useState } from "react";
import { Paper, Box, TextField, Button, Typography, Stack } from "@mui/material";
import { useGeminiAPIContext } from "../utils/GeminiAPI";

export default function ChatPanel() {
  const { sendMessage, getHistory } =
    useGeminiAPIContext();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage2 = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", parts: [{ text: input }] }]);
    setLoading(true);
    try {
      const response = await sendMessage(input)
      setMessages(getHistory())
    } catch (error) {
      console.error("LLM error:", error);
      setMessages([...updatedMessages, {
        role: "assistant",
        parts: [{ text: "(Error fetching response)" }],
      }]);
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
                  {msg.parts.map(x => x.text).join("\n")}
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
          onKeyDown={(e) => e.key === "Enter" && sendMessage2()}
          disabled={loading}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={sendMessage2}
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </Button>
      </Box>
    </Box>
  );
}



