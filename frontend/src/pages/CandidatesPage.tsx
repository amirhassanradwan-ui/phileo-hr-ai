import SearchIcon from '@mui/icons-material/Search';
import { Box, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { api } from '../services/api';

type Candidate = {
  id: number;
  full_name: string;
  phone?: string;
  email?: string;
  current_company?: string;
  current_position?: string;
  status: string;
};

const columns: GridColDef[] = [
  { field: 'full_name', headerName: 'Name', flex: 1 },
  { field: 'phone', headerName: 'Phone', flex: 1 },
  { field: 'email', headerName: 'Email', flex: 1 },
  { field: 'current_company', headerName: 'Company', flex: 1 },
  { field: 'current_position', headerName: 'Position', flex: 1 },
  { field: 'status', headerName: 'Status', width: 130 },
];

export default function CandidatesPage() {
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<Candidate[]>([]);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      const response = await api.get('/candidates', { params: { q: query || undefined } });
      setRows(response.data);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [query]);

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Candidates</Typography>
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
