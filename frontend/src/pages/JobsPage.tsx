import AddIcon from '@mui/icons-material/Add';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid2,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../services/api';

type Job = {
  id: number;
  job_name: string;
  department?: string;
  description?: string;
  is_active: boolean;
};

const emptyForm = {
  job_name: '',
  department: '',
  description: '',
  is_active: true,
};

export default function JobsPage() {
  const [rows, setRows] = useState<Job[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string | null>(null);

  const columns: GridColDef<Job>[] = [
    { field: 'job_name', headerName: 'Job Name', flex: 1 },
    { field: 'department', headerName: 'Department', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1.5 },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          variant={params.value ? 'filled' : 'outlined'}
        />
      ),
    },
  ];

  async function loadJobs() {
    const response = await api.get('/jobs');
    setRows(response.data);
  }

  useEffect(() => {
    void loadJobs();
  }, []);

  function updateField(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    await api.post('/jobs', {
      ...form,
      department: form.department || null,
      description: form.description || null,
    });
    setForm(emptyForm);
    setMessage('Job added');
    await loadJobs();
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Jobs</Typography>
      {message && <Alert severity="success">{message}</Alert>}

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Typography variant="h6">Add Job</Typography>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                required
                label="Job Name"
                value={form.job_name}
                onChange={(event) => updateField('job_name', event.target.value)}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Department"
                value={form.department}
                onChange={(event) => updateField('department', event.target.value)}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ height: '100%' }}>
                <Switch
                  checked={form.is_active}
                  onChange={(event) => updateField('is_active', event.target.checked)}
                />
                <Typography>{form.is_active ? 'Active' : 'Inactive'}</Typography>
              </Stack>
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Description"
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
              />
            </Grid2>
          </Grid2>
          <Box>
            <Button type="submit" variant="contained" startIcon={<AddIcon />}>
              Add Job
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ height: 520 }}>
        <Box sx={{ height: '100%' }}>
          <DataGrid rows={rows} columns={columns} disableRowSelectionOnClick />
        </Box>
      </Paper>
    </Stack>
  );
}
