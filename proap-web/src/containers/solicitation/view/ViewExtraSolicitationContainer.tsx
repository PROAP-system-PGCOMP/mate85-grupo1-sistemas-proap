import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Divider,
  Container,
  Fade,
  Chip,
  Tooltip,
} from '@mui/material';
import { CheckCircle, Cancel, PendingOutlined } from '@mui/icons-material';
import { formatNumberToBRL } from '../../../helpers/formatter';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

interface ViewExtraSolicitationContainerProps {
  extraRequest: any;
}

// ----------------------------------------------------------------------
// Componentes de Layout Reutilizáveis
// ----------------------------------------------------------------------

interface InfoItemProps {
  label: string;
  value: any;
  isTotal?: boolean;
  showTooltip?: boolean;
}

const InfoItem = ({ label, value, isTotal = false, showTooltip = false }: InfoItemProps) => {
  const displayValue = value === null || value === undefined || value === '' ? '-' : value;

  const content = isTotal ? (
    <Typography variant="h5" fontWeight="700" color="text.primary">
      {displayValue}
    </Typography>
  ) : (
    <Typography variant="body1" fontWeight="500" sx={{ wordBreak: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis', display: showTooltip ? '-webkit-box' : 'block', WebkitLineClamp: showTooltip ? 2 : 'unset', WebkitBoxOrient: 'vertical' }}>
      {displayValue}
    </Typography>
  );

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      {showTooltip ? (
        <Tooltip title={displayValue} arrow placement="top">
          <Box>{content}</Box>
        </Tooltip>
      ) : (
        content
      )}
    </Box>
  );
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Typography
    variant="subtitle2"
    fontWeight="700"
    color="primary"
    sx={{ mb: 2.5, textTransform: 'uppercase', letterSpacing: 0.8 }}
  >
    {children}
  </Typography>
);

// ----------------------------------------------------------------------
// Componente Principal
// ----------------------------------------------------------------------

const ViewExtraSolicitationContainer: React.FC<ViewExtraSolicitationContainerProps> = ({ 
  extraRequest 
}) => {
  const requestData = extraRequest?.data || extraRequest || {};
  
  const {
    id,
    userName,
    userEmail,
    valorSolicitado,
    createdAt,
    situacao,
    valorAprovado,
    dataAvaliacaoProap,
    numeroAta,
    observacao,
    justificativa,
    itemSolicitado,
    titulo,
    nomeSolicitacao,
    nomeAgenciaFomento,
  } = requestData;

  // Lógica padronizada de Status
  const getStatusProps = () => {
    switch (situacao) {
      case 1:
        return { label: 'Aprovada', color: 'success' as const, icon: <CheckCircle /> };
      case 2:
        return { label: 'Reprovada', color: 'error' as const, icon: <Cancel /> };
      default:
        return { label: 'Pendente', color: 'warning' as const, icon: <HourglassEmptyIcon /> };
    }
  };

  const statusProps = getStatusProps();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Fade in timeout={500}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
          }}
        >
          {/* CABEÇALHO GERAL DA SOLICITAÇÃO E STATUS */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight="700" color="primary">
                Demanda Extra #{id}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Detalhes e status da solicitação de recurso adicional.
              </Typography>
            </Box>
            <Chip
              label={statusProps.label}
              icon={statusProps.icon}
              color={statusProps.color}
              sx={{ fontWeight: 600, px: 1, py: 2.5, borderRadius: 2, fontSize: '0.95rem', color: 'white'}}
            />
          </Box>

          {/* STATUS E AVALIAÇÃO */}
          <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
             <SectionTitle>Status da Avaliação PROAP</SectionTitle>
             <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <InfoItem 
                    label="Valor Solicitado" 
                    value={valorSolicitado ? formatNumberToBRL(valorSolicitado) : '-'} 
                  />
                </Grid>

                {situacao === 1 && (
                  <>
                    <Grid item xs={12} sm={6} md={3}>
                      <InfoItem 
                        label="Valor Aprovado" 
                        value={valorAprovado ? formatNumberToBRL(valorAprovado) : '-'} 
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <InfoItem label="Data de Aprovação" value={dataAvaliacaoProap} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <InfoItem label="Número da ATA" value={numeroAta} />
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <InfoItem 
                    label="Observação do Avaliador" 
                    value={observacao || 'Nenhuma observação registrada.'} 
                    showTooltip={(observacao?.length ?? 0) > 100}
                  />
                </Grid>
             </Grid>
          </Box>

          <Divider />

          {/* 1. SEÇÃO DO SOLICITANTE */}
          <Box>
            <SectionTitle>Detalhes do Solicitante</SectionTitle>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <InfoItem label="Nome do Solicitante" value={userName} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <InfoItem label="E-mail" value={userEmail} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <InfoItem label="Data de Solicitação" value={createdAt} />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* 2. SEÇÃO DOS DETALHES DA DEMANDA */}
          <Box>
            <SectionTitle>Detalhes da Solicitação</SectionTitle>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <InfoItem label="Título / Nome da Solicitação" value={nomeSolicitacao || titulo} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem label="Item Solicitado" value={itemSolicitado} />
              </Grid>
              <Grid item xs={12}>
                <InfoItem label="Justificativa" value={justificativa} />
              </Grid>
              {nomeAgenciaFomento && (
                <Grid item xs={12}>
                  <InfoItem label="Agência de Fomento (Outras Fontes)" value={nomeAgenciaFomento} />
                </Grid>
              )}
            </Grid>
          </Box>

        </Paper>
      </Fade>
    </Container>
  );
};

export default ViewExtraSolicitationContainer;