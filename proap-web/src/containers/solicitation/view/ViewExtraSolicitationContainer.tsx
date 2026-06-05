import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Divider,
} from '@mui/material';
import { formatNumberToBRL } from '../../../helpers/formatter';
import { StatusChip } from '../../../containers/home/solicitation-table/components';

interface ViewExtraSolicitationContainerProps {
  extraRequest: any;
}


const ViewExtraSolicitationContainer: React.FC<
  ViewExtraSolicitationContainerProps
> = ({ extraRequest }) => {
  
  const requestData = extraRequest?.data || extraRequest || {};
  
  const {
    id,
    userName,
    userEmail,
    valorSolicitado,
    createdAt,
    situacao,
    valorAprovado,
    automaticDecText,
    dataAvaliacaoProap,
    observacao,
    justificativa,
    itemSolicitado,
    titulo,
    nomeSolicitacao,
    nomeAgenciaFomento,
  } = requestData;

  const InfoField = ({
    label,
    value,
    valueFormatter,
  }: {
    label: string;
    value: any;
    valueFormatter?: (val: any) => string;
  }) => (
    <Box mb={2}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Typography variant="body1">
        {value === null || value === undefined || value === ''
          ? '-'
          : valueFormatter
            ? valueFormatter(value)
            : value}
      </Typography>
    </Box>
  );

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Cabeçalho com informações principais */}
        <Grid item xs={12}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h5" fontWeight="medium">
              Solicitação #{id}
            </Typography>
            <StatusChip status={situacao ?? 0} />
          </Box>
          <Divider sx={{ mb: 3 }} />
        </Grid>

        {/* Informações do solicitante */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Informações do Solicitante
            </Typography>
            <InfoField label="Nome" value={userName} />
            <InfoField label="E-mail" value={userEmail} />
            <InfoField label="Data de Solicitação" value={createdAt} />
          </Paper>
        </Grid>

        {/* Informações financeiras */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Informações Financeiras
            </Typography>
            <InfoField
              label="Valor Solicitado"
              value={valorSolicitado}
              valueFormatter={formatNumberToBRL}
            />
            <InfoField
              label="Valor Aprovado"
              value={valorAprovado}
              valueFormatter={formatNumberToBRL}
            />
            <InfoField label="Data de Aprovação" value={dataAvaliacaoProap} />
          </Paper>
        </Grid>

        {/* Detalhes da solicitação */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Detalhes da Solicitação
            </Typography>
            <InfoField label="Nome da Solicitação / Título" value={nomeSolicitacao || titulo} />
            <InfoField label="Item Solicitado" value={itemSolicitado} />
            <InfoField label="Justificativa" value={justificativa} />
            {nomeAgenciaFomento && (
              <InfoField label="Agência de Fomento (Outras Fontes)" value={nomeAgenciaFomento} />
            )}
            <InfoField label="Observações" value={observacao} />
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default ViewExtraSolicitationContainer;