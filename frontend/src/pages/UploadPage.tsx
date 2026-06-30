import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { ChangeEvent, useState } from 'react';
import { api } from '../services/api';

type DuplicateMatch = {
  candidate_id: number;
  reason: string;
  confidence: number;
};

type UploadResult = {
  status: 'done' | 'duplicate_found';
  candidate?: {
    id: number;
    full_name: string;
    email?: string;
    phone?: string;
  } | null;
  duplicates: DuplicateMatch[];
  stored_file?: string | null;
};

const reasonLabels: Record<string, string> = {
  phone: 'Phone match',
  email: 'Email match',
  name_similarity: 'Name similarity',
  name_similarity_and_company_history: 'Name and company history',
};

export default function UploadPage() {
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function uploadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setFileName(file.name);
    setResult(null);
    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post<UploadResult>('/uploads/cv', formData);
      setResult(response.data);
    } catch {
      setError('Upload failed. Check the file type and try again.');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Upload CV</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {result?.status === 'done' && (
        <Alert severity="success">
          Candidate created: {result.candidate?.full_name || 'Unknown Candidate'}
        </Alert>
      )}
      {result?.status === 'duplicate_found' && (
        <Alert severity="warning">Duplicate candidate found. Review the matches below.</Alert>
      )}
      <Paper
        sx={{
          minHeight: 360,
          display: 'grid',
          placeItems: 'center',
          border: '2px dashed',
          borderColor: 'primary.light',
          bgcolor: 'background.default',
          p: 3,
        }}
      >
        <Stack spacing={2} alignItems="center" sx={{ width: '100%', maxWidth: 520 }}>
          <CloudUploadIcon color="primary" sx={{ fontSize: 64 }} />
          <Typography variant="h5">Drag CV Here</Typography>
          <Typography color="text.secondary">or</Typography>
          <Button variant="contained" component="label" disabled={isUploading}>
            Browse
            <input hidden type="file" accept=".pdf,.doc,.docx,.zip" onChange={uploadFile} />
          </Button>
          <Typography color="text.secondary">Supported: PDF, DOC, DOCX, ZIP</Typography>
          {fileName && <Chip label={fileName} />}
          {isUploading && <LinearProgress sx={{ width: '100%' }} />}
        </Stack>
      </Paper>
      {result && (
        <Paper sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Processing Result</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={`Status: ${result.status}`} color={result.status === 'done' ? 'success' : 'warning'} />
              {result.stored_file && <Chip label="CV stored" />}
              {result.candidate?.id && <Chip label={`Candidate #${result.candidate.id}`} />}
            </Stack>
            {result.duplicates.length > 0 && (
              <Stack spacing={1}>
                {result.duplicates.map((duplicate) => (
                  <Paper key={`${duplicate.candidate_id}-${duplicate.reason}`} variant="outlined" sx={{ p: 1.5 }}>
                    <Typography fontWeight={600}>Candidate #{duplicate.candidate_id}</Typography>
                    <Typography color="text.secondary">
                      {reasonLabels[duplicate.reason] || duplicate.reason} - {Math.round(duplicate.confidence * 100)}%
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            )}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
