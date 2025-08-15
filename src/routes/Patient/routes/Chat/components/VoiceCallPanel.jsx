import React from "react"
import { Box, Paper, Typography, Button, Avatar, Stack, Icon } from "@mui/material";
import { useVoice, VoiceReadyState } from "@humeai/voice-react";

export default function VoiceCallPanel({ accessToken }) {
  const { connect, disconnect, readyState, messages } = useVoice();
  const inCall = readyState === VoiceReadyState.OPEN;

  const handleToggleCall = () => {
    if (!inCall) {
      connect({
        auth: { type: "accessToken", value: accessToken },
        configId: "e4f8eee2-beff-4fa5-aeca-9172e427f323"
      }).catch(console.error);
    } else {
      disconnect();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        textAlign: "center",
      }}
    >
      <Avatar
        sx={{
          width: 100,
          height: 100,
          bgcolor: "secondary.main",
          fontSize: 36,
        }}
      >
        JM
      </Avatar>

      <Box>
        <Typography variant="h6" fontWeight="bold">
          John Miller
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {inCall ? "Call in progress..." : "Ready to start call"}
        </Typography>
      </Box>

      <Button
        variant="contained"
        size="large"
        color={inCall ? "error" : "secondary"}
        startIcon={inCall ? <Icon>call_end</Icon> : <Icon>call</Icon>}
        onClick={handleToggleCall}
      >
        {inCall ? "End Call" : "Start Call"}
      </Button>

      {inCall && (
        <Stack alignItems="center" spacing={1}>
          <Icon sx={{ fontSize: 40, color: "primary.main" }}>phone_in_talk</Icon>
          <Typography variant="caption" color="text.secondary">
            Connected
          </Typography>
        </Stack>
      )}
    </Paper>
  );
}
