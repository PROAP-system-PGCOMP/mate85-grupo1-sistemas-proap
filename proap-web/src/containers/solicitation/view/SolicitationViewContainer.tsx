import type React from 'react';
import {
  Box,
  Paper,
  Typography,
  Link,
  LinearProgress,
  Container,
  Fade,
  Tooltip,
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import { BASE_PDF_URL } from '../../../helpers/api';
import useSolicitation from '../../../hooks/solicitation/useSolicitation';
import { booleanToYesOrNo, dateToLocalDate } from '../../../helpers/conversion';
import { formatNumberToBRL } from '../../../helpers/formatter';
import { TruncatedText } from '../SolicitationFormContainer.style';
import { CheckCircle, Cancel, PendingOutlined, LowPriority} from '@mui/icons-material';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

interface InfoItemProps {
  label: string;
  value: React.ReactNode;
  showTooltip?: boolean;
  tooltipText?: string;
  isTotal?: boolean;
}

// InfoItem adaptado para o novo layout (Caption cinza + Value em destaque)
const InfoItem = ({
  label,
  value,
  showTooltip = false,
  tooltipText,
  isTotal = false,
}: InfoItemProps) => {
  const renderValue = () => {
    if (typeof value === 'string' && value.length > 50) {
      const content = <TruncatedText variant="body1" fontWeight="500">{value}</TruncatedText>;

      return showTooltip ? (
        <Tooltip title={tooltipText || value} arrow placement="top">
          {content}
        </Tooltip>
      ) : (
        content
      );
    }

    if (isTotal) {
      return (
        <Typography variant="h5" fontWeight="700" color="text.primary">
          {value || 'Não informado'}
        </Typography>
      );
    }

    return (
      <Typography variant="body1" fontWeight="500">
        {value || (value === 0 ? '0' : 'Não informado')}
      </Typography>
    );
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

// Componente para padronizar os títulos das seções
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

// Link customizado para o layout
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
        wordBreak: 'break-all',
      }}
    >
      <TruncatedText variant="body1">{children}</TruncatedText>
    </Link>
  </Tooltip>
);

export default function SolicitationViewContainer({ id }: { id: string }) {
  const { solicitation, isLoading, hasError } = useSolicitation(id);

  if (isLoading) return <LinearProgress />;
  if (hasError || !solicitation) return null;

  // Define as propriedades do Chip de Status
  const getStatusProps = () => {
    switch (solicitation.situacao) {
      case 1:
        return { label: 'Aprovada', color: 'success' as const, icon: <CheckCircle /> };
      case 2:
        return { label: 'Reprovada', color: 'error' as const, icon: <Cancel /> };
      case 3:
        return {label: 'Em espera', color: 'secondary' as const, icon: <LowPriority />};
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
                Consulta da Solicitação
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Acompanhe os detalhes e o status atual da sua requisição.
              </Typography>
            </Box>
            <Chip
              label={statusProps.label}
              icon={statusProps.icon}
              color={statusProps.color}
              sx={{ fontWeight: 600, px: 1, py: 2.5, borderRadius: 2, fontSize: '0.95rem', color: 'white', '& .MuiChip-icon': { color: 'white' } }}
            />
          </Box>

          {/* STATUS E AVALIAÇÃO (Visível apenas se já foi avaliado ou se houver info pertinente) */}
          <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
             <SectionTitle>Status da Avaliação PROAP</SectionTitle>
             <Grid container spacing={3}>
                {solicitation.situacao === 1 && (
                  <>
                    <Grid item xs={12} sm={4} md={3}>
                      <InfoItem label="Data de Aprovação" value={dateToLocalDate(solicitation.dataAvaliacaoProap)} />
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                      <InfoItem label="Número da ATA" value={solicitation.numeroAta} />
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                      <InfoItem label="Diárias Aprovadas" value={solicitation.numeroDiariasAprovadas} />
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                      <InfoItem label="Valor Total Aprovado" value={formatNumberToBRL(solicitation.valorAprovado)} />
                    </Grid>
                  </>
                )}
                <Grid item xs={12}>
                  <InfoItem 
                    label="Observação do Avaliador" 
                    value={solicitation.observacao || 'Nenhuma observação registrada.'} 
                    showTooltip={(solicitation.observacao?.length ?? 0) > 100}                  />
                </Grid>
             </Grid>
          </Box>

          <Divider />

          <Grid container spacing={4}>
            {/* 1. SEÇÃO DO SOLICITANTE */}
            <Grid item xs={12} md={8}>
              <SectionTitle>Detalhes do Solicitante</SectionTitle>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <InfoItem label="Quem abriu a solicitação" value={solicitation.user.name} showTooltip={solicitation.user.name?.length > 50} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem label="Email do Solicitante" value={solicitation.user.email} showTooltip={solicitation.user.email?.length > 50} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem label="Telefone de Contato" value={solicitation.user.phone} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem label="Tipo de Solicitante" value={solicitation.solicitanteDocente ? 'Docente' : 'Discente'} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem label="Nome do Discente PGCOMP" value={solicitation.nomeDiscente} showTooltip={solicitation.nomeDiscente?.length > 50} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem label="Nome do Docente PGCOMP" value={solicitation.nomeDocente} showTooltip={solicitation.nomeDocente?.length > 50} />
                </Grid>

                {!solicitation.solicitanteDocente && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <InfoItem label="No prazo regular do curso?" value={booleanToYesOrNo(solicitation.discenteNoPrazoDoCurso!)} />
                    </Grid>
                    {!solicitation.discenteNoPrazoDoCurso && (
                      <Grid item xs={12} sm={6}>
                        <InfoItem label="Meses de atraso" value={solicitation.mesesAtrasoCurso} />
                      </Grid>
                    )}
                  </>
                )}
              </Grid>
            </Grid>

            {/* 2. SEÇÃO DOS DADOS DA SOLICITAÇÃO (Trabalho/Anexos) */}
            <Grid item xs={12} md={4}>
              <SectionTitle>Dados da Publicação</SectionTitle>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <InfoItem label="Título da Publicação" value={solicitation.tituloPublicacao} showTooltip={solicitation.tituloPublicacao?.length > 50} />
                </Grid>
                <Grid item xs={12}>
                  <InfoItem 
                    label="Coautores" 
                    value={
                      solicitation.coautores && solicitation.coautores.length > 0 
                      ? solicitation.coautores.join(', ') 
                      : 'Nenhum coautor informado'
                    } 
                    showTooltip 
                    tooltipText={solicitation.coautores?.join(', ')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <InfoItem label="Há coautores PGCOMP?" value={booleanToYesOrNo(solicitation.algumCoautorPGCOMP ?? false)} />
                </Grid>
                <Grid item xs={12}>
                  <InfoItem 
                    label="Carta de Aceite" 
                    value={
                      solicitation.cartaAceite ? (
                        <Link
                          href={`${BASE_PDF_URL}${solicitation.cartaAceite}`}
                          target="_blank"
                          rel="noopener"
                          sx={{ color: 'primary.main', fontWeight: 'bold', textDecoration: 'none', '&:hover': { opacity: 0.8 } }}
                        >
                          Visualizar Arquivo PDF
                        </Link>
                      ) : 'Nenhum arquivo enviado'
                    }
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Divider />

          {/* 3. SEÇÃO DO DETALHAMENTO DO EVENTO */}
          <Box>
            <SectionTitle>Detalhamento do Evento</SectionTitle>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <InfoItem label="Nome do Evento" value={solicitation.nomeEvento} showTooltip={solicitation.nomeEvento?.length > 50} />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <InfoItem label="Natureza" value={solicitation.eventoInternacional ? 'Internacional' : 'Nacional'} />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <InfoItem label="Data de Início" value={dateToLocalDate(solicitation.dataInicio)} />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <InfoItem label="Data de Término" value={dateToLocalDate(solicitation.dataFim)} />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <InfoItem label="Dias de Evento" value={`${solicitation.qtdDiasEvento} dia(s)`} />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <InfoItem label="Modalidade de Participação" value={solicitation.modalidadeParticipacao} />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <InfoItem label="Localização (País)" value={solicitation.pais} />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <InfoItem label="Cidade" value={solicitation.cidade} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InfoItem label="Qualis" value={solicitation.qualis} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <InfoItem 
                  label="Link da Homepage do Evento" 
                  value={
                    solicitation.linkHomePageEvento 
                    ? <TruncatedLink href={solicitation.linkHomePageEvento}>{solicitation.linkHomePageEvento}</TruncatedLink> 
                    : '-'
                  } 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem 
                  label="Link da Página de Inscrição" 
                  value={
                    solicitation.linkPaginaInscricao 
                    ? <TruncatedLink href={solicitation.linkPaginaInscricao}>{solicitation.linkPaginaInscricao}</TruncatedLink> 
                    : '-'
                  } 
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* 4. SEÇÃO DO DETALHAMENTO FINANCEIRO */}
          <Box>
            <SectionTitle>Detalhamento Financeiro</SectionTitle>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={3}>
                <InfoItem label="Valor da Inscrição" value={formatNumberToBRL(solicitation.valorInscricao)} />
              </Grid>
              
              {solicitation.quantidadeDiariasSolicitadas > 0 && (
                <>
                  <Grid item xs={12} sm={3}>
                    <InfoItem label="Diárias Solicitadas" value={`${solicitation.quantidadeDiariasSolicitadas}x`} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <InfoItem 
                      label="Valor da Diária" 
                      value={
                        solicitation.isDolar
                          ? `$ ${solicitation.valorDiaria?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (USD)`
                          : formatNumberToBRL(solicitation.valorDiaria)
                      } 
                    />
                  </Grid>
                </>
              )}

              {solicitation.quantidadeDiariasSolicitadas > 0 && solicitation.isDolar && (
                <Grid item xs={12} sm={3}>
                  <InfoItem label="Cotação do Dólar" value={`R$ ${solicitation.cotacaoMoeda?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                </Grid>
              )}

              {solicitation.quantidadeDiariasSolicitadas > 1 && (
                <Grid item xs={12} sm={3}>
                  <InfoItem label="Última diária integral?" value={booleanToYesOrNo(solicitation.ultimaDiariaIntegral ?? false)} />
                </Grid>
              )}

              {solicitation.solicitanteDocente && (
                <Grid item xs={12} sm={3}>
                  <InfoItem label="Valor da Passagem Aérea" value={formatNumberToBRL(solicitation.valorPassagem)} />
                </Grid>
              )}

              <Grid item xs={12} sm={3}>                
                <InfoItem 
                  label="Valor Total Solicitado" 
                  value={formatNumberToBRL(solicitation.valorTotal)} 
                />
              </Grid>

            </Grid>
          </Box>

        </Paper>
      </Fade>
    </Container>
  );
}