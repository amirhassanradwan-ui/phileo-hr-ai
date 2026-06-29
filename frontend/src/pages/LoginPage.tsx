import LockIcon from '@mui/icons-material/Lock';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (token) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const response = await api.post('/auth/login', { username, password });
    localStorage.setItem('access_token', response.data.access_token);
    navigate('/');
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}>
      <Paper component="form" onSubmit={handleSubmit} sx={{ width: 420, p: 4 }}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <LockIcon color="primary" />
            <Typography variant="h5">Login</Typography>
          </Stack>
          <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" variant="contained" size="large">
            Login
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
