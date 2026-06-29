import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import { api } from '../services/api';

export default function UploadPage() {
  const [message, setMessage] = useState<string | null>(null);

  async function uploadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/uploads/cv', formData);
    setMessage(response.data.status === 'duplicate_found' ? 'Duplicate candidate found' : 'CV uploaded');
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Upload CV</Typography>
      {message && <Alert severity="info">{message}</Alert>}
      <Paper
        sx={{
          minHeight: 360,
          display: 'grid',
          placeItems: 'center',
          border: '2px dashed',
          borderColor: 'primary.light',
          bgcolor: 'background.default',
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CloudUploadIcon color="primary" sx={{ fontSize: 64 }} />
          <Typography variant="h5">Drag CV Here</Typography>
          <Typography color="text.secondary">or</Typography>
          <Button variant="contained" component="label">
            Browse
            <input hidden type="file" accept=".pdf,.doc,.docx,.zip" onChange={uploadFile} />
          </Button>
          <Box>
            <Typography color="text.secondary">Supported: PDF, DOC, DOCX, ZIP</Typography>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
}
