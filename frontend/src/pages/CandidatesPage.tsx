import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Box,
  Button,
  Grid2,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../services/api';

type Candidate = {
  id: number;
  full_name: string;
  phone?: string;
  email?: string;
  city?: string;
  current_company?: string;
  current_position?: string;
  status: string;
};

const columns: GridColDef[] = [
  { field: 'full_name', headerName: 'Name', flex: 1 },
  { field: 'phone', headerName: 'Phone', flex: 1 },
  { field: 'email', headerName: 'Email', flex: 1 },
  { field: 'city', headerName: 'City', width: 140 },
  { field: 'current_company', headerName: 'Last Company', flex: 1 },
  { field: 'current_position', headerName: 'Position', flex: 1 },
  { field: 'status', headerName: 'Status', width: 130 },
];

const emptyForm = {
  full_name: '',
  phone: '',
  email: '',
  city: '',
  current_company: '',
  current_position: '',
};

export default function CandidatesPage() {
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<Candidate[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function loadCandidates(search = query) {
    const response = await api.get('/candidates', { params: { q: search || undefined } });
    setRows(response.data);
  }

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      await loadCandidates(query);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [query]);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    await api.post('/candidates', {
      ...form,
      phone: form.phone || null,
      email: form.email || null,
      city: form.city || null,
      current_company: form.current_company || null,
      current_position: form.current_position || null,
    });
    setForm(emptyForm);
    setMessage('Candidate added');
    await loadCandidates();
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Candidates</Typography>
      {message && <Alert severity="success">{message}</Alert>}
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Typography variant="h6">Add Candidate</Typography>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                required
                label="Full Name"
                value={form.full_name}
                onChange={(event) => updateField('full_name', event.target.value)}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Phone"
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="City"
                value={form.city}
                onChange={(event) => updateField('city', event.target.value)}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Current Company"
                value={form.current_company}
                onChange={(event) => updateField('current_company', event.target.value)}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Current Position"
                value={form.current_position}
                onChange={(event) => updateField('current_position', event.target.value)}
              />
            </Grid2>
          </Grid2>
          <Box>
            <Button type="submit" variant="contained">
              Add Candidate
            </Button>
          </Box>
        </Stack>
      </Paper>
      <TextField
        placeholder="Search candidates"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      <Paper sx={{ height: 560 }}>
        <Box sx={{ height: '100%' }}>
          <DataGrid rows={rows} columns={columns} disableRowSelectionOnClick />
        </Box>
      </Paper>
    </Stack>
  );
}
