import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

type Candidate = {
  id: number;
  full_name: string;
  email?: string;
  phone?: string;
  city?: string;
  current_company?: string;
  current_position?: string;
  status: string;
};

const stages = [
  { key: 'new', label: 'New' },
  { key: 'screening', label: 'Screening' },
  { key: 'interview', label: 'Interview' },
  { key: 'offer', label: 'Offer' },
  { key: 'hired', label: 'Hired' },
  { key: 'rejected', label: 'Rejected' },
];

export default function PipelinePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  async function loadCandidates() {
    const response = await api.get('/candidates');
    setCandidates(response.data);
  }

  useEffect(() => {
    void loadCandidates();
  }, []);

  const candidatesByStage = useMemo(
    () =>
      stages.reduce<Record<string, Candidate[]>>((groups, stage) => {
        groups[stage.key] = candidates.filter((candidate) => candidate.status === stage.key);
        return groups;
      }, {}),
    [candidates],
  );

  async function moveCandidate(candidate: Candidate, direction: -1 | 1) {
    const currentIndex = stages.findIndex((stage) => stage.key === candidate.status);
    const nextStage = stages[currentIndex + direction];
    if (!nextStage) {
      return;
    }

    await api.patch(`/candidates/${candidate.id}/status`, { status: nextStage.key });
    await loadCandidates();
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Pipeline</Typography>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: 'repeat(6, minmax(220px, 1fr))',
          overflowX: 'auto',
          pb: 1,
        }}
      >
        {stages.map((stage, stageIndex) => (
          <Paper key={stage.key} sx={{ p: 2, minHeight: 520, bgcolor: 'grey.50' }}>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" fontWeight={700}>
                  {stage.label}
                </Typography>
                <Chip size="small" label={candidatesByStage[stage.key]?.length ?? 0} />
              </Stack>

              <Stack spacing={1.5}>
                {(candidatesByStage[stage.key] ?? []).map((candidate) => (
                  <Paper key={candidate.id} variant="outlined" sx={{ p: 1.5, bgcolor: 'background.paper' }}>
                    <Stack spacing={1}>
                      <Typography fontWeight={700}>{candidate.full_name}</Typography>
                      {candidate.current_position && (
                        <Typography variant="body2" color="text.secondary">
                          {candidate.current_position}
                        </Typography>
                      )}
                      {candidate.current_company && (
                        <Typography variant="caption" color="text.secondary">
                          {candidate.current_company}
                        </Typography>
                      )}
                      <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">
                          {candidate.city || candidate.email || candidate.phone || 'No contact info'}
                        </Typography>
                        <Box>
                          <Tooltip title="Move back">
                            <span>
                              <IconButton
                                size="small"
                                disabled={stageIndex === 0}
                                onClick={() => moveCandidate(candidate, -1)}
                              >
                                <ArrowBackIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Move forward">
                            <span>
                              <IconButton
                                size="small"
                                disabled={stageIndex === stages.length - 1}
                                onClick={() => moveCandidate(candidate, 1)}
                              >
                                <ArrowForwardIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Box>
    </Stack>
  );
}
