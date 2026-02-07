import React, { useState } from "react";
import { Paper, Box, TextField, Button, Typography, Stack } from "@mui/material";
import { useGeminiAPIContext } from "../utils/GeminiAPI";

export default function ChatPanel() {
  const { sendMessage, getHistory } = useGeminiAPIContext();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage2 = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", parts: [{ text: input }] }]);
    setLoading(true);
    try {
      await sendMessage(input)
      setMessages(getHistory())
    } catch (error) {
      console.error("LLM error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        parts: [{ text: "(Error fetching response)" }],
      }]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
      <Paper variant="outlined" sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
        <Stack spacing={1.5}>
          {messages.map((msg, i) => (
            <Box key={i} display="flex" justifyContent={msg.role === "user" ? "flex-end" : "flex-start"}>
              <Typography
                sx={{
                  bgcolor: msg.role === "user" ? "primary.main" : "secondary.main",
                  color: "white",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  maxWidth: "85%",
                  wordBreak: "break-word",
                  fontSize: '0.9rem'
                }}
              >
                {msg.parts.map(x => x.text).join("\n")}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>
      <TextField
        fullWidth
        size="small"
        variant="outlined"
        placeholder="Ask the patient..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage2()}
        disabled={loading}
        slotProps={{
          input: {
            endAdornment: (
              <Button
                color="primary"
                onClick={sendMessage2}
                disabled={loading}
              >
                {loading ? "..." : "Send"}
              </Button>
            )
          }
        }}
      />
    </Stack>
  );
}



