import { Paper, Stack, Typography } from '@mui/material';

export default function SettingsPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">Settings</Typography>
      <Paper sx={{ p: 3 }}>
        <Typography color="text.secondary">System settings will be added in a later sprint.</Typography>
      </Paper>
    </Stack>
  );
}
