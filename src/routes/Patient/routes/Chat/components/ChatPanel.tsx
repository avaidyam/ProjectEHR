import * as React from 'react';
import { Box, Button, Stack, Autocomplete } from "components/ui/Core";
import { useGeminiAPIContext } from "../utils/GeminiAPI";

export function ChatPanel() {
  const { sendMessage, getHistory } = useGeminiAPIContext();
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const sendMessage2 = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", parts: [{ text: input }] }]);
    setLoading(true);
    try {
      await sendMessage(input)
      setMessages(getHistory())
    } catch (error) {
      console.error("LLM error:", error);
      setMessages((prev: any) => [...prev, {
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
      <Box paper variant="outlined" sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
        <Stack spacing={1.5}>
          {messages.map((msg: any, i: number) => (
            <Box key={i} display="flex" justifyContent={msg.role === "user" ? "flex-end" : "flex-start"}>
              <Box paper
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
                {msg.parts.map((x: any) => x.text).join("\n")}
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
      <Autocomplete
        freeSolo
        fullWidth
        placeholder="Ask the patient..."
        value={input}
        onInputChange={(_e, newValue) => setInput(newValue)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage2()}
        disabled={loading}
        options={[]}
        TextFieldProps={{
          size: "small",
          InputProps: {
            endAdornment: (
              <Button
                color="primary"
                onClick={sendMessage2}
                disabled={loading}
              >
                {loading ? "..." : "Send"}
              </Button>
            )
          } as any
        }}
      />
    </Stack>
  );
}
