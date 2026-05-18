import { Card, CardContent, Typography, Box, Grid, Divider, Chip } from '@mui/material';
import { CeapgResponse } from '../../../types';
import { Person, CalendarToday, AttachMoney, Comment } from '@mui/icons-material';

const CompletedReviewsTab = ({ completedReviews, formatNumberToBRL, formatDate }: any) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {completedReviews.map((request: CeapgResponse) => (
        <Card key={request.id} variant="outlined" sx={{ borderLeft: '6px solid #2e7d32' }}>
          <CardContent>
            {/* Cabeçalho do Card */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">Solicitação #{request.id}</Typography>
              <Chip label="Avaliada pelo CEAPG" color="success" variant="outlined" size="small" />
            </Box>

            <Grid container spacing={3}>
              {/* 1. VALOR FINAL (custoFinalCeapg) */}
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary" display="block">VALOR FINAL REAL</Typography>
                <Typography variant="body1" fontWeight="bold" color="success.main">
                  {formatNumberToBRL(request.custoFinalCeapg)}
                </Typography>
              </Grid>

              {/* 2. OBSERVAÇÃO (observacoesCeapg) */}
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary" display="block">OBSERVAÇÃO</Typography>
                <Typography variant="body2">{request.observacoesCeapg || 'Nenhuma observação'}</Typography>
              </Grid>

              {/* 3. AVALIADOR (avaliadorCeapg - como string) */}
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary" display="block">AVALIADOR CEAPG</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Person sx={{ fontSize: 16 }} />
                  <Typography variant="body2">{request.avaliadorCeapg}</Typography>
                </Box>
              </Grid>

              {/* 4. DATA (dataAvaliacaoCeapg) */}
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary" display="block">DATA DA AVALIAÇÃO</Typography>
                <Typography variant="body2">{formatDate(request.dataAvaliacaoCeapg)}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};