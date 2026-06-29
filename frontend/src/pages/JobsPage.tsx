import { Paper, Stack, Typography } from '@mui/material';

export default function JobsPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">Jobs</Typography>
      <Paper sx={{ p: 3 }}>
        <Typography color="text.secondary">Job management will be expanded in Sprint 1.</Typography>
      </Paper>
    </Stack>
  );
}
