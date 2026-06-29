import { Paper, Stack, Typography } from '@mui/material';

export default function ReportsPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">Reports</Typography>
      <Paper sx={{ p: 3 }}>
        <Typography color="text.secondary">Reports will be added after candidate workflows stabilize.</Typography>
      </Paper>
    </Stack>
  );
}
