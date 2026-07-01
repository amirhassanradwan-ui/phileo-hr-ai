import MailIcon from '@mui/icons-material/Mail';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid2,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FormEvent, useState } from 'react';
import { api } from '../services/api';

type EmailSyncResult = {
  checked_emails: number;
  attachments_found: number;
  processed: Array<{
    email_subject?: string | null;
    email_from?: string | null;
    filename: string;
    result: {
      status: string;
      candidate?: {
        id: number;
        full_name: string;
      } | null;
      duplicates: Array<{
        candidate_id: number;
        reason: string;
        confidence: number;
      }>;
    };
  }>;
};

const emptyForm = {
  host: '',
  port: '993',
  username: '',
  password: '',
  mailbox: 'INBOX',
  limit: '10',
  use_ssl: true,
  only_unseen: true,
  mark_seen: false,
};

export default function EmailSyncPage() {
  const [form, setForm] = useState(emptyForm);
  const [result, setResult] = useState<EmailSyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  function updateField(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setIsSyncing(true);

    try {
      const response = await api.post<EmailSyncResult>('/email-sync/imap', {
        ...form,
        port: Number(form.port),
        limit: Number(form.limit),
      });
      setResult(response.data);
    } catch {
      setError('Email sync failed. Check IMAP host, port, username, password, and mailbox.');
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Email Sync</Typography>
      {error && <Alert severity="error">{error}</Alert>}

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <MailIcon color="primary" />
            <Typography variant="h6">IMAP Mailbox</Typography>
          </Stack>

          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                required
                label="IMAP Host"
                placeholder="imap.gmail.com"
                value={form.host}
                onChange={(event) => updateField('host', event.target.value)}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                required
                label="Port"
                type="number"
                value={form.port}
                onChange={(event) => updateField('port', event.target.value)}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                required
                label="Mailbox"
                value={form.mailbox}
                onChange={(event) => updateField('mailbox', event.target.value)}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                label="Email Username"
                value={form.username}
                onChange={(event) => updateField('username', event.target.value)}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                label="Email Password"
                type="password"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                required
                label="Email Limit"
                type="number"
                value={form.limit}
                onChange={(event) => updateField('limit', event.target.value)}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 9 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ height: '100%' }} flexWrap="wrap" useFlexGap>
                <FormControlLabel
                  control={
                    <Checkbox checked={form.use_ssl} onChange={(event) => updateField('use_ssl', event.target.checked)} />
                  }
                  label="Use SSL"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.only_unseen}
                      onChange={(event) => updateField('only_unseen', event.target.checked)}
                    />
                  }
                  label="Only unread"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.mark_seen}
                      onChange={(event) => updateField('mark_seen', event.target.checked)}
                    />
                  }
                  label="Mark as read"
                />
              </Stack>
            </Grid2>
          </Grid2>

          {isSyncing && <LinearProgress />}
          <Box>
            <Button type="submit" variant="contained" disabled={isSyncing} startIcon={<MailIcon />}>
              Fetch CVs
            </Button>
          </Box>
        </Stack>
      </Paper>

      {result && (
        <Paper sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Sync Result</Typography>
            <Alert severity="info">
              Checked {result.checked_emails} emails and found {result.attachments_found} CV attachments.
            </Alert>

            {result.processed.map((item, index) => (
              <Paper key={`${item.filename}-${index}`} variant="outlined" sx={{ p: 1.5 }}>
                <Stack spacing={0.5}>
                  <Typography fontWeight={700}>{item.filename}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.email_from || 'Unknown sender'} - {item.email_subject || 'No subject'}
                  </Typography>
                  {item.result.status === 'done' ? (
                    <Typography color="success.main">
                      Created: {item.result.candidate?.full_name || 'Unknown Candidate'}
                    </Typography>
                  ) : (
                    <Typography color="warning.main">
                      Duplicate found: {item.result.duplicates.length} match
                      {item.result.duplicates.length === 1 ? '' : 'es'}
                    </Typography>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
