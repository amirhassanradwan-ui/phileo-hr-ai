import MailIcon from '@mui/icons-material/Mail';
import SaveIcon from '@mui/icons-material/Save';
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
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../services/api';

type CurrentUser = {
  username: string;
  role: string;
};

type ImapSettings = {
  is_configured: boolean;
  host: string;
  port: number;
  username: string;
  mailbox: string;
  use_ssl: boolean;
  only_unseen: boolean;
  mark_seen: boolean;
  password_saved: boolean;
};

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

const emptySettingsForm = {
  host: '',
  port: '993',
  username: '',
  password: '',
  mailbox: 'INBOX',
  use_ssl: true,
  only_unseen: true,
  mark_seen: false,
};

export default function EmailSyncPage() {
  const [settingsForm, setSettingsForm] = useState(emptySettingsForm);
  const [settings, setSettings] = useState<ImapSettings | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [limit, setLimit] = useState('10');
  const [result, setResult] = useState<EmailSyncResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  async function loadPageData() {
    const [userResponse, settingsResponse] = await Promise.all([
      api.get<CurrentUser>('/auth/me'),
      api.get<ImapSettings>('/email-sync/settings'),
    ]);
    setCurrentUser(userResponse.data);
    applySettings(settingsResponse.data);
  }

  function applySettings(nextSettings: ImapSettings) {
    setSettings(nextSettings);
    setSettingsForm({
      host: nextSettings.host,
      port: String(nextSettings.port),
      username: nextSettings.username,
      password: '',
      mailbox: nextSettings.mailbox,
      use_ssl: nextSettings.use_ssl,
      only_unseen: nextSettings.only_unseen,
      mark_seen: nextSettings.mark_seen,
    });
  }

  useEffect(() => {
    void loadPageData();
  }, []);

  function updateSettingsField(field: keyof typeof settingsForm, value: string | boolean) {
    setSettingsForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSaveSettings(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSaving(true);

    try {
      const response = await api.put<ImapSettings>('/email-sync/settings', {
        ...settingsForm,
        port: Number(settingsForm.port),
        password: settingsForm.password || null,
      });
      applySettings(response.data);
      setMessage('IMAP settings saved');
    } catch {
      setError('Could not save IMAP settings. Admin access is required.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSync() {
    setError(null);
    setMessage(null);
    setResult(null);
    setIsSyncing(true);

    try {
      const response = await api.post<EmailSyncResult>('/email-sync/imap', { limit: Number(limit) });
      setResult(response.data);
    } catch {
      setError('Email sync failed. Check the saved IMAP settings and mailbox password.');
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Email Sync</Typography>
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      {!isAdmin && <Alert severity="info">IMAP settings are managed by admin users only.</Alert>}

      <Paper component="form" onSubmit={handleSaveSettings} sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <MailIcon color="primary" />
            <Typography variant="h6">Saved IMAP Settings</Typography>
          </Stack>

          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                required
                disabled={!isAdmin}
                label="IMAP Host"
                placeholder="imap.gmail.com"
                value={settingsForm.host}
                onChange={(event) => updateSettingsField('host', event.target.value)}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                required
                disabled={!isAdmin}
                label="Port"
                type="number"
                value={settingsForm.port}
                onChange={(event) => updateSettingsField('port', event.target.value)}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                required
                disabled={!isAdmin}
                label="Mailbox"
                value={settingsForm.mailbox}
                onChange={(event) => updateSettingsField('mailbox', event.target.value)}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                disabled={!isAdmin}
                label="Email Username"
                value={settingsForm.username}
                onChange={(event) => updateSettingsField('username', event.target.value)}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                disabled={!isAdmin}
                label={settings?.password_saved ? 'New Password' : 'Email Password'}
                type="password"
                helperText={settings?.password_saved ? 'Leave blank to keep saved password' : 'Required the first time'}
                value={settingsForm.password}
                onChange={(event) => updateSettingsField('password', event.target.value)}
              />
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
                <FormControlLabel
                  control={
                    <Checkbox
                      disabled={!isAdmin}
                      checked={settingsForm.use_ssl}
                      onChange={(event) => updateSettingsField('use_ssl', event.target.checked)}
                    />
                  }
                  label="Use SSL"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      disabled={!isAdmin}
                      checked={settingsForm.only_unseen}
                      onChange={(event) => updateSettingsField('only_unseen', event.target.checked)}
                    />
                  }
                  label="Only unread"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      disabled={!isAdmin}
                      checked={settingsForm.mark_seen}
                      onChange={(event) => updateSettingsField('mark_seen', event.target.checked)}
                    />
                  }
                  label="Mark as read"
                />
              </Stack>
            </Grid2>
          </Grid2>

          {isSaving && <LinearProgress />}
          {isAdmin && (
            <Box>
              <Button type="submit" variant="contained" disabled={isSaving} startIcon={<SaveIcon />}>
                Save Settings
              </Button>
            </Box>
          )}
        </Stack>
      </Paper>

      <Paper sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Typography variant="h6">Fetch CVs</Typography>
          {!settings?.is_configured && <Alert severity="warning">IMAP settings are not configured yet.</Alert>}
          {settings?.is_configured && !settings.password_saved && (
            <Alert severity="warning">Admin must save the mailbox password before fetching CVs.</Alert>
          )}
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                required
                label="Email Limit"
                type="number"
                value={limit}
                onChange={(event) => setLimit(event.target.value)}
              />
            </Grid2>
          </Grid2>
          {isSyncing && <LinearProgress />}
          <Box>
            <Button
              variant="contained"
              disabled={isSyncing || !settings?.is_configured || !settings.password_saved}
              startIcon={<MailIcon />}
              onClick={handleSync}
            >
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
