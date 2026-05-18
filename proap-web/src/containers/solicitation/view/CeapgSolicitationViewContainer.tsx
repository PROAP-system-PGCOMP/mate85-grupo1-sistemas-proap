import type React from 'react';
import {
  Box,
  Paper,
  Typography,
  Link,
  LinearProgress,
  Container,
  Fade,
  Stack,
  Tooltip,
  Grid,
  Divider,
} from '@mui/material';
import { BASE_PDF_URL } from '../../../helpers/api';
import useSolicitation from '../../../hooks/solicitation/useSolicitation';
import { booleanToYesOrNo, dateToLocalDate } from '../../../helpers/conversion';
import {
  Person,
  Event,
  AttachMoney,
  School,
  CheckCircle,
} from '@mui/icons-material';
import { formatNumberToBRL } from '../../../helpers/formatter';
import { TruncatedText } from '../SolicitationFormContainer.style';

interface InfoItemProps {
  label: string;
  value: React.ReactNode;
  showTooltip?: boolean;
  tooltipText?: string;
}

// InfoItem otimizado para o Grid do Painel Unificado
const InfoItem = ({
  label,
  value,
  showTooltip = false,
  tooltipText,
}: InfoItemProps) => {
  const renderValue = () => {
    if (typeof value === 'string' && value.length > 50) {
      const content = <TruncatedText variant="body1">{value}</TruncatedText>;

      return showTooltip ? (
        <Tooltip title={tooltipText || value} arrow placement="top">
          {content}
        </Tooltip>
      ) : (
        content
      );
    }

    return <Typography variant="body1" fontWeight="500">{value || '-'}</Typography>;
  };

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      {renderValue()}
    </Box>
  );
};

// Componente de Link Truncado para URLs longas de Homepages
const TruncatedLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <Tooltip title={href} arrow placement="top">
    <Link
      href={href}
      target="_blank"
      rel="noopener"
      sx={{
        color: 'primary.main',
        textDecoration: 'none',
        fontWeight: 'bold',
        '&:hover': {
          opacity: 0.8,
        },
        maxWidth: '100%',
        display: 'block',
      }}
    >
      <TruncatedText variant="body1">{children}</TruncatedText>
    </Link>
  </Tooltip>
);

// Helper local para aplicar máscara legível ao telefone
const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return 'Não informado';
  const cleaned = phone.replace(/\D/g, '');
  const digits = cleaned.startsWith('55') && cleaned.length > 10 ? cleaned.slice(2) : cleaned;

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  } else if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
};

export default function CeapgSolicitationViewContainer({ id }: { id: string }) {
  const { solicitation, isLoading, hasError } = useSolicitation(id);

  if (isLoading) return <LinearProgress />;
  if (hasError) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        color="primary.main"
        fontWeight="700"
        sx={{ pt: 2, mb: 4 }}
      >
        Consulta de Solicitação — CEAPG
      </Typography>

      {/* PAINEL 1: Status Definitivo da Avaliação do CEAPG */}
      <Fade in timeout={400}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            mb: 4,
            bgcolor: '#ffffff',
          }}
        >
          <Typography variant="subtitle2" fontWeight="700" color="primary.main" sx={{ mb: 3, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Status da Avaliação CEAPG
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>Situação</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle sx={{ color: 'success.main' }} />
                <Typography variant="body1" fontWeight="600" color="success.main">
                  Avaliada
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <InfoItem label="Número da ATA" value={solicitation.numeroAta} />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <InfoItem label="Data da Avaliação" value={dateToLocalDate(solicitation.dataAvaliacaoProap)} />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <InfoItem label="Avaliador" value={solicitation.avaliadorProap?.name || 'Não informado'} />
            </Grid>
            <Grid item xs={12} sm={12} md={3}>
              <Typography variant="caption" color="text.secondary" display="block">Valor Final Real Aprovado</Typography>
              <Typography variant="h5" fontWeight="700" color="primary.main">
                {formatNumberToBRL(solicitation.valorAprovado)}
              </Typography>
            </Grid>

            {solicitation.observacoesCeapg && (
              <Grid item xs={12}>
                <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
                <InfoItem
                  label="Observações do CEAPG"
                  value={solicitation.observacoesCeapg}
                  showTooltip={solicitation.observacoesCeapg.length > 100}
                />
              </Grid>
            )}
          </Grid>
        </Paper>
      </Fade>

      {/* PAINEL 2: Ficha Cadastral Unificada */}
      <Fade in timeout={700}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 5 },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: '#ffffff',
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.01)',
          }}
        >
          <Stack spacing={5}>
            
            {/* SEÇÃO 1: DETALHES DO SOLICITANTE */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Person color="primary" fontSize="small" />
                <Typography variant="subtitle2" fontWeight="700" color="primary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Detalhes do Solicitante
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem label="Quem abriu a solicitação" value={solicitation.user.name} showTooltip={solicitation.user.name.length > 50} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem label="Email do Solicitante" value={solicitation.user.email} showTooltip={solicitation.user.email.length > 50} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem label="Telefone de Contato" value={formatPhoneNumber(solicitation.user.phone)} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem label="Solicitação em nome do" value={solicitation.solicitanteDocente ? 'Docente' : 'Discente'} />
                </Grid>
                {solicitation.nomeDiscente && (
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoItem label="Nome do Discente PGCOMP" value={solicitation.nomeDiscente} showTooltip={solicitation.nomeDiscente.length > 50} />
                  </Grid>
                )}
                {solicitation.nomeDocente && (
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoItem label="Nome do Docente PGCOMP" value={solicitation.nomeDocente} showTooltip={solicitation.nomeDocente.length > 50} />
                  </Grid>
                )}
                {!solicitation.solicitanteDocente && (
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoItem label="Está no prazo regular do curso?" value={booleanToYesOrNo(solicitation.discenteNoPrazoDoCurso!)} />
                  </Grid>
                )}
                {!solicitation.solicitanteDocente && !solicitation.discenteNoPrazoDoCurso && (
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoItem label="Quantidade de meses de atraso" value={solicitation.mesesAtrasoCurso} />
                  </Grid>
                )}
              </Grid>
            </Box>

            <Divider />

            {/* SEÇÃO 2: DADOS DA PUBLICAÇÃO */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <School color="primary" fontSize="small" />
                <Typography variant="subtitle2" fontWeight="700" color="primary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Dados da Publicação
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <InfoItem label="Título da Publicação" value={solicitation.tituloPublicacao} showTooltip={solicitation.tituloPublicacao.length > 50} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <InfoItem
                    label="Coautores"
                    value={
                      solicitation.coautores.length > 0 ? (
                        <Tooltip
                          title={solicitation.coautores.join(', ')}
                          arrow
                          placement="top"
                          disableHoverListener={solicitation.coautores.join(', ').length <= 50}
                        >
                          <TruncatedText variant="body1">
                            {solicitation.coautores.join(', ')}
                          </TruncatedText>
                        </Tooltip>
                      ) : (
                        'Nenhum coautor informado'
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <InfoItem label="Há coautores PGCOMP?" value={booleanToYesOrNo(solicitation.algumCoautorPGCOMP ?? false)} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <InfoItem
                    label="Arquivo da Carta de Aceite"
                    value={
                      solicitation.cartaAceite ? (
                        <Link
                          href={`${BASE_PDF_URL}${solicitation.cartaAceite}`}
                          target="_blank"
                          rel="noopener"
                          sx={{
                            color: 'primary.main',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            '&:hover': { opacity: 0.8 },
                          }}
                        >
                          Visualizar PDF
                        </Link>
                      ) : (
                        'Nenhum arquivo enviado'
                      )
                    }
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* SEÇÃO 3: DETALHAMENTO DO EVENTO */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Event color="primary" fontSize="small" />
                <Typography variant="subtitle2" fontWeight="700" color="primary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Detalhamento do Evento
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem label="Nome do Evento" value={solicitation.nomeEvento} showTooltip={solicitation.nomeEvento.length > 50} />
                </Grid>
                <Grid item xs={12} sm={3} md={2}>
                  <InfoItem label="Natureza" value={solicitation.eventoInternacional ? 'Internacional' : 'Nacional'} />
                </Grid>
                <Grid item xs={12} sm={3} md={2}>
                  <InfoItem label="Qualis" value={solicitation.qualis} />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <InfoItem label="Data de Início" value={dateToLocalDate(solicitation.dataInicio)} />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <InfoItem label="Data de Término" value={dateToLocalDate(solicitation.dataFim)} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem label="Localização" value={`${solicitation.cidade || 'Não informada'} — ${solicitation.pais || 'Não informado'}`} />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <InfoItem label="Dias do Evento" value={`${solicitation.qtdDiasEvento} dia${solicitation.qtdDiasEvento === 1 ? '' : 's'}`} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <InfoItem label="Modalidade de Participação" value={solicitation.modalidadeParticipacao} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem
                    label="Homepage do Evento"
                    value={
                      <TruncatedLink href={solicitation.linkHomePageEvento}>
                        {solicitation.linkHomePageEvento}
                      </TruncatedLink>
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <InfoItem
                    label="Página de Inscrição"
                    value={
                      <TruncatedLink href={solicitation.linkPaginaInscricao}>
                        {solicitation.linkPaginaInscricao}
                      </TruncatedLink>
                    }
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* SEÇÃO 4: DETALHAMENTO FINANCEIRO SOLICITADO */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <AttachMoney color="primary" fontSize="small" />
                <Typography variant="subtitle2" fontWeight="700" color="primary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Detalhamento Financeiro Solicitado
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4} md={3}>
                  <InfoItem label="Valor da Inscrição" value={formatNumberToBRL(solicitation.valorInscricao)} />
                </Grid>
                {solicitation.quantidadeDiariasSolicitadas > 0 && (
                  <Grid item xs={12} sm={4} md={2}>
                    <InfoItem label="Número de Diárias" value={`${solicitation.quantidadeDiariasSolicitadas}x`} />
                  </Grid>
                )}
                {solicitation.quantidadeDiariasSolicitadas > 0 && (
                  <Grid item xs={12} sm={4} md={3}>
                    <InfoItem
                      label="Valor da Diária"
                      value={
                        solicitation.isDolar
                          ? `$ ${solicitation.valorDiaria?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (USD)`
                          : formatNumberToBRL(solicitation.valorDiaria)
                      }
                    />
                  </Grid>
                )}
                {solicitation.quantidadeDiariasSolicitadas > 0 && solicitation.isDolar && (
                  <Grid item xs={12} sm={4} md={2}>
                    <InfoItem
                      label="Cotação do Dólar"
                      value={`R$ ${solicitation.cotacaoMoeda?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    />
                  </Grid>
                )}
                {solicitation.quantidadeDiariasSolicitadas > 1 && (
                  <Grid item xs={12} sm={6} md={2}>
                    <InfoItem label="Última diária integral?" value={booleanToYesOrNo(solicitation.ultimaDiariaIntegral ?? false)} />
                  </Grid>
                )}
                {solicitation.solicitanteDocente && (
                  <Grid item xs={12} sm={6} md={3}>
                    <InfoItem label="Valor da Passagem Aérea" value={formatNumberToBRL(solicitation.valorPassagem)} />
                  </Grid>
                )}
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>Total Solicitado</Typography>
                  <Typography variant="h6" fontWeight="700" color="text.primary">
                    {formatNumberToBRL(solicitation.valorTotal)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

          </Stack>
        </Paper>
      </Fade>
    </Container>
  );
}