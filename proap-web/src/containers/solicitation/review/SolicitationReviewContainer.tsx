import React from 'react';
import {
  Box,
  Link,
  Typography,
  Divider,
  Chip,
  Tooltip,
  Grid,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { SolicitationFormValues } from '../SolicitationFormSchema';
import { booleanToYesOrNo, dateToLocalDate } from '../../../helpers/conversion';
import { BASE_PDF_URL } from '../../../helpers/api';
import { formatNumberToBRL } from '../../../helpers/formatter';

export default function SolicitationReviewContainer() {
  const { values } = useFormikContext<SolicitationFormValues>();

  return (
    <Box sx={{ width: '100%' }}>
      {/* Container Principal com Estilo Unificado */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          p: { xs: 4, md: 6 },
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.02)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Typography variant="h5" fontWeight="600">
            Resumo da Solicitação
          </Typography>
          <Chip
            label={values.eventoInternacional ? 'Internacional' : 'Nacional'}
            color={values.eventoInternacional ? 'primary' : 'default'}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          
          {/* 1. SEÇÃO DO SOLICITANTE E DADOS DA SOLICITAÇÃO (Dividido em duas colunas grandes no Desktop) */}
          <Grid container spacing={4}>
            
            {/* Coluna Esquerda: Detalhes do Solicitante */}
            <Grid item xs={12} md={7}>
              <Typography
                variant="subtitle2"
                fontWeight="700"
                color="primary"
                sx={{ mb: 2.5, textTransform: 'uppercase', letterSpacing: 0.8 }}
              >
                Detalhes do Solicitante
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Solicitante
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {values.user.name || 'Não informado'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {values.user.email || 'Não informado'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Telefone
                  </Typography>
                  <Typography variant="body1">
                    {values.user.phone || 'Não informado'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Tipo de Solicitante
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {values.solicitanteDocente ? 'Docente' : 'Discente'}
                  </Typography>
                </Grid>

                {values.nomeDiscente && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Nome do Discente PGCOMP
                    </Typography>
                    <Typography variant="body1">
                      {values.nomeDiscente}
                    </Typography>
                  </Grid>
                )}

                {values.nomeDocente && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Docente Orientador
                    </Typography>
                    <Typography variant="body1">
                      {values.nomeDocente}
                    </Typography>
                  </Grid>
                )}

                {!values.solicitanteDocente && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        No prazo regular do curso?
                      </Typography>
                      <Typography variant="body1">
                        {booleanToYesOrNo(values.discenteNoPrazoDoCurso!)}
                      </Typography>
                    </Grid>
                    {!values.discenteNoPrazoDoCurso && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Meses de atraso
                        </Typography>
                        <Typography variant="body1" color="error">
                          {values.mesesAtrasoCurso} meses
                        </Typography>
                      </Grid>
                    )}
                  </>
                )}
              </Grid>
            </Grid>

            {/* Coluna Direita: Dados da Solicitação */}
            <Grid item xs={12} md={5}>
              <Typography
                variant="subtitle2"
                fontWeight="700"
                color="primary"
                sx={{ mb: 2.5, textTransform: 'uppercase', letterSpacing: 0.8 }}
              >
                Dados da Solicitação
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Título da Publicação
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {values.tituloPublicacao}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Co-autores
                  </Typography>
                  <Typography variant="body1">
                    {values.coautores.length > 0
                      ? values.coautores.join(', ')
                      : 'Nenhum co-autor informado'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Coautores PGCOMP?
                  </Typography>
                  <Typography variant="body1">
                    {booleanToYesOrNo(values.algumCoautorPGCOMP ?? false)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Carta de Aceite
                  </Typography>
                  {values.cartaAceite ? (
                    <Link
                      href={BASE_PDF_URL + values.cartaAceite}
                      target="_blank"
                      rel="noopener"
                      variant="body1"
                      sx={{ fontWeight: 500 }}
                    >
                      Visualizar Documento
                    </Link>
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      Não enviado
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Divider />

          {/* 2. SEÇÃO DOS DETALHES DO EVENTO */}
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight="700"
              color="primary"
              sx={{ mb: 2.5, textTransform: 'uppercase', letterSpacing: 0.8 }}
            >
              Detalhamento do Evento
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Nome do Evento
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {values.nomeEvento}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Data de Início
                </Typography>
                <Typography variant="body1">
                  {dateToLocalDate(values.dataInicio)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Data de Término
                </Typography>
                <Typography variant="body1">
                  {dateToLocalDate(values.dataFim)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Dias de Evento
                </Typography>
                <Typography variant="body1">
                  {`${values.qtdDiasEvento} dia${values.qtdDiasEvento === 1 ? '' : 's'}`}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Qualis
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {values.qualis || 'Não informado'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Localização (Cidade / País)
                </Typography>
                <Typography variant="body1">
                  {values.cidade} — {values.pais}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Modalidade
                </Typography>
                <Typography variant="body1">
                  {values.modalidadeParticipacao.charAt(0).toUpperCase() +
                    values.modalidadeParticipacao.slice(1)}
                </Typography>
              </Grid>

              <Grid item xs={12} md={2}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Homepage do Evento
                </Typography>
                <Tooltip title={values.linkHomePageEvento} arrow placement="top">
                  <Link
                    href={values.linkHomePageEvento}
                    target="_blank"
                    rel="noopener"
                    variant="body1"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      wordBreak: 'break-all',
                    }}
                  >
                    {values.linkHomePageEvento}
                  </Link>
                </Tooltip>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Link da Inscrição
                </Typography>
                <Tooltip title={values.linkPaginaInscricao} arrow placement="top">
                  <Link
                    href={values.linkPaginaInscricao}
                    target="_blank"
                    rel="noopener"
                    variant="body1"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      wordBreak: 'break-all',
                    }}
                  >
                    {values.linkPaginaInscricao}
                  </Link>
                </Tooltip>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* 3. DETALHAMENTO FINANCEIRO */}
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight="700"
              color="primary"
              sx={{ mb: 2.5, textTransform: 'uppercase', letterSpacing: 0.8 }}
            >
              Detalhamento Financeiro
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Valor da Inscrição
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {formatNumberToBRL(values.valorInscricao)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Diárias Solicitadas
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {values.quantidadeDiariasSolicitadas}x
                </Typography>
              </Grid>

              {values.quantidadeDiariasSolicitadas > 0 && (
                <>
                  <Grid item xs={12} sm={6} md={2}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Valor da Diária
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      {values.isDolar
                        ? `$ ${values.valorDiaria?.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : formatNumberToBRL(values.valorDiaria)}
                    </Typography>
                  </Grid>

                  {values.isDolar && (
                    <Grid item xs={12} sm={6} md={2}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Cotação do Dólar
                      </Typography>
                      <Typography variant="body1">
                        {formatNumberToBRL(values.cotacaoMoeda)}
                      </Typography>
                    </Grid>
                  )}

                  {values.quantidadeDiariasSolicitadas > 1 && (
                    <Grid item xs={12} sm={6} md={2}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Última diária integral?
                      </Typography>
                      <Typography variant="body1">
                        {booleanToYesOrNo(values.ultimaDiariaIntegral ?? false)}
                      </Typography>
                    </Grid>
                  )}
                </>
              )}

              {values.solicitanteDocente && (
                <Grid item xs={12} sm={6} md={2}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Valor da Passagem
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {formatNumberToBRL(values.valorPassagem)}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Valor Total da Solicitação
                </Typography>
                <Typography variant="h5" fontWeight="700" color="text.primary">
                  {formatNumberToBRL(values.valorTotal)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}