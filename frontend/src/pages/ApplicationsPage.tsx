import AddIcon from '@mui/icons-material/Add';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  Grid2,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../services/api';

type CandidateOption = {
  id: number;
  full_name: string;
};

type JobOption = {
  id: number;
  job_name: string;
  is_active: boolean;
};

type Application = {
  id: number;
  candidate_id: number;
  job_id: number;
  candidate_name: string;
  job_name: string;
  application_date: string;
  status: string;
  score?: number | null;
};

const emptyForm = {
  candidate_id: '',
  job_id: '',
  status: 'new',
  score: '',
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [candidates, setCandidates] = useState<CandidateOption[]>([]);
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string | null>(null);

  const columns: GridColDef<Application>[] = [
    { field: 'candidate_name', headerName: 'Candidate', flex: 1 },
    { field: 'job_name', headerName: 'Job', flex: 1 },
    {
      field: 'application_date',
      headerName: 'Date',
      width: 170,
      valueFormatter: (value) => new Date(value).toLocaleDateString(),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => <Chip size="small" label={params.value} color="primary" variant="outlined" />,
    },
    {
      field: 'score',
      headerName: 'Score',
      width: 110,
      valueFormatter: (value) => (value == null ? '-' : value),
    },
  ];

  async function loadData() {
    const [applicationsResponse, candidatesResponse, jobsResponse] = await Promise.all([
      api.get('/applications'),
      api.get('/candidates'),
      api.get('/jobs'),
    ]);
    setApplications(applicationsResponse.data);
    setCandidates(candidatesResponse.data);
    setJobs(jobsResponse.data);
  }

  useEffect(() => {
    void loadData();
  }, []);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    await api.post('/applications', {
      candidate_id: Number(form.candidate_id),
      job_id: Number(form.job_id),
      status: form.status || 'new',
      score: form.score ? Number(form.score) : null,
    });
    setForm(emptyForm);
    setMessage('Application added');
    await loadData();
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Applications</Typography>
      {message && <Alert severity="success">{message}</Alert>}

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Typography variant="h6">Add Application</Typography>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth required>
                <InputLabel>Candidate</InputLabel>
                <Select
                  label="Candidate"
                  value={form.candidate_id}
                  onChange={(event) => updateField('candidate_id', event.target.value)}
                >
                  {candidates.map((candidate) => (
                    <MenuItem key={candidate.id} value={String(candidate.id)}>
                      {candidate.full_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth required>
                <InputLabel>Job</InputLabel>
                <Select label="Job" value={form.job_id} onChange={(event) => updateField('job_id', event.target.value)}>
                  {jobs.map((job) => (
                    <MenuItem key={job.id} value={String(job.id)} disabled={!job.is_active}>
                      {job.job_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                label="Status"
                value={form.status}
                onChange={(event) => updateField('status', event.target.value)}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                label="Score"
                type="number"
                value={form.score}
                onChange={(event) => updateField('score', event.target.value)}
              />
            </Grid2>
          </Grid2>
          <Box>
            <Button type="submit" variant="contained" startIcon={<AddIcon />}>
              Add Application
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ height: 520 }}>
        <Box sx={{ height: '100%' }}>
          <DataGrid rows={applications} columns={columns} disableRowSelectionOnClick />
        </Box>
      </Paper>
    </Stack>
  );
}
