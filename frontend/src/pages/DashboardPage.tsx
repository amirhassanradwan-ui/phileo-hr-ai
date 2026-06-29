import { Grid2, Paper, Stack, Typography } from '@mui/material';

const metrics = [
  ['Candidates', '0'],
  ['Jobs', '0'],
  ['CV Uploads', '0'],
  ['Duplicates', '0'],
];

export default function DashboardPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">Dashboard</Typography>
      <Grid2 container spacing={2}>
        {metrics.map(([label, value]) => (
          <Grid2 key={label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 3 }}>
              <Typography color="text.secondary">{label}</Typography>
              <Typography variant="h4">{value}</Typography>
            </Paper>
          </Grid2>
        ))}
      </Grid2>
    </Stack>
  );
}
