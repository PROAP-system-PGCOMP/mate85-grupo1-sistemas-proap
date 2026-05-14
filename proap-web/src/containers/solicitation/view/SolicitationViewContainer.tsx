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
} from '@mui/material';
import styled from '@emotion/styled';
import { BASE_PDF_URL } from '../../../helpers/api';
import useSolicitation from '../../../hooks/solicitation/useSolicitation';
import { booleanToYesOrNo, dateToLocalDate } from '../../../helpers/conversion';
import {
  Person,
  Event,
  AttachMoney,
  School,
  CheckCircle,
  Cancel,
  PendingOutlined,
} from '@mui/icons-material';
import { formatNumberToBRL } from '../../../helpers/formatter';
import { TruncatedText } from '../SolicitationFormContainer.style';

interface InfoItemProps {
  label: string;
  value: React.ReactNode;
  showTooltip?: boolean;
  tooltipText?: string;
}

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

    return <Typography variant="body1">{value || '-'}</Typography>;
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      {renderValue()}
    </Box>
  );
};

const SectionPaper = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 3,
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      {icon}
      <Typography
        variant="h6"
        sx={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flexShrink: 0,
        }}
      >
        {title}
      </Typography>
    </Box>
    {children}
  </Paper>
);

// Custom Link component with text truncation for URLs
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

export default function SolicitationViewContainer({ id }: { id: string }) {
  const { solicitation, isLoading, hasError } = useSolicitation(id);

  if (isLoading) return <LinearProgress />;
  if (hasError) return null;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        color="primary"
        fontWeight="bold"
        paddingTop={4}
        marginBottom={4}
      >
        Consulta da Solicitação
      </Typography>

      <Fade in timeout={900}>
        <Box sx={{ mb: 3 }}>
          {' '}
          {/* Added margin top */}
          <SectionPaper
            title="Status da Avaliação"
            icon={<Event color="primary" />}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                <InfoItem
                  label="Situação"
                  value={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {solicitation.situacao === 1 ? (
                        <CheckCircle sx={{ color: 'success.main' }} />
                      ) : solicitation.situacao === 2 ? (
                        <Cancel sx={{ color: 'error.main' }} />
                      ) : (
                        <PendingOutlined sx={{ color: 'warning.main' }} />
                      )}
                      <Typography variant="body1">
                        {solicitation.situacao === 1
                          ? 'Aprovado'
                          : solicitation.situacao === 2
                            ? 'Reprovado'
                            : 'Pendente'}
                      </Typography>
                    </Box>
                  }
                />
                {solicitation.situacao === 1 && (
                  <>
                    <InfoItem
                      label="Data de Aprovação"
                      value={dateToLocalDate(solicitation.dataAvaliacaoProap)}
                    />
                    <InfoItem
                      label="Valor Total Aprovado"
                      value={formatNumberToBRL(solicitation.valorAprovado)}
                    />
                  </>
                )}
              </Box>
              <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                {solicitation.situacao === 1 && (
                  <>
                    <InfoItem
                      label="Número da ATA"
                      value={solicitation.numeroAta}
                    />
                    <InfoItem
                      label="Diárias Aprovadas"
                      value={solicitation.numeroDiariasAprovadas}
                    />
                  </>
                )}
                {solicitation.observacao && (
                  <InfoItem
                    label="Observação"
                    value={solicitation.observacao}
                    showTooltip={solicitation.observacao.length > 100}
                  />
                )}
              </Box>
            </Stack>
          </SectionPaper>
        </Box>
      </Fade>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ mb: 3 }}>
        <Fade in timeout={500}>
          <Box sx={{ width: { xs: '100%', lg: '25%' } }}>
            <SectionPaper
              title="Detalhes do Solicitante"
              icon={<Person color="primary" />}
            >
              <InfoItem
                label="Quem abriu a solicitação"
                value={solicitation.user.name}
                showTooltip={solicitation.user.name.length > 50}
              />
              <InfoItem
                label="Email do Solicitante"
                value={solicitation.user.email}
                showTooltip={solicitation.user.email.length > 50}
              />
              <InfoItem
                label="Telefone de Contato"
                value={solicitation.user.phone}
              />
              <InfoItem
                label="Solicitação em nome do"
                value={solicitation.solicitanteDocente ? 'Docente' : 'Discente'}
              />
              <InfoItem
                label="Nome do Discente PGCOMP"
                value={solicitation.nomeDiscente}
                showTooltip={solicitation.nomeDiscente.length > 50}
              />
              <InfoItem
                label="Nome do Docente PGCOMP"
                value={solicitation.nomeDocente}
                showTooltip={solicitation.nomeDocente.length > 50}
              />
              {!solicitation.solicitanteDocente && (
                <InfoItem
                  label="Está no prazo regular do curso?"
                  value={booleanToYesOrNo(solicitation.discenteNoPrazoDoCurso!)}
                />
              )}
              {!solicitation.solicitanteDocente &&
                !solicitation.discenteNoPrazoDoCurso && (
                  <InfoItem
                    label="Quantidade de meses de atraso do curso"
                    value={solicitation.mesesAtrasoCurso}
                  />
                )}
            </SectionPaper>
          </Box>
        </Fade>

        <Fade in timeout={600}>
          <Box sx={{ width: { xs: '100%', lg: '25%' } }}>
            <SectionPaper
              title="Dados da Solicitação"
              icon={<School color="primary" />}
            >
              <InfoItem
                label="Título da Publicação"
                value={solicitation.tituloPublicacao}
                showTooltip={solicitation.tituloPublicacao.length > 50}
              />
              <InfoItem
                label="Coautores"
                value={
                  solicitation.coautores.length > 0 ? (
                    <Tooltip
                      title={solicitation.coautores.join(', ')}
                      arrow
                      placement="top"
                      disableHoverListener={
                        solicitation.coautores.join(', ').length <= 50
                      }
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
              <InfoItem
                label="Há coautores PGCOMP?"
                value={booleanToYesOrNo(
                  solicitation.algumCoautorPGCOMP ?? false,
                )}
              />
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
                        '&:hover': {
                          opacity: 0.8,
                        },
                      }}
                    >
                      Visualizar
                    </Link>
                  ) : (
                    'Nenhum arquivo enviado'
                  )
                }
              />
            </SectionPaper>
          </Box>
        </Fade>

        <Fade in timeout={700}>
          <Box sx={{ width: { xs: '100%', lg: '25%' } }}>
            <SectionPaper
              title="Detalhamento do Evento"
              icon={<Event color="primary" />}
            >
              <InfoItem
                label="Nome do Evento"
                value={solicitation.nomeEvento}
                showTooltip={solicitation.nomeEvento.length > 50}
              />
              <InfoItem
                label="Natureza"
                value={
                  solicitation.eventoInternacional
                    ? 'Internacional'
                    : 'Nacional'
                }
              />
              <InfoItem
                label="Data de Início"
                value={dateToLocalDate(solicitation.dataInicio)}
              />
              <InfoItem
                label="Data de Término"
                value={dateToLocalDate(solicitation.dataFim)}
              />
              <InfoItem
                label="Modalidade de Participação"
                value={solicitation.modalidadeParticipacao}
              />
              <InfoItem
                label="Quantidade de Dias do Evento"
                value={`${solicitation.qtdDiasEvento} dia${solicitation.qtdDiasEvento === 1 ? '' : 's'}`}
              />
              <InfoItem
                label="Link da Homepage do Evento"
                value={
                  <TruncatedLink href={solicitation.linkHomePageEvento}>
                    {solicitation.linkHomePageEvento}
                  </TruncatedLink>
                }
              />
              <InfoItem
                label="Link da Página de Inscrição"
                value={
                  <TruncatedLink href={solicitation.linkPaginaInscricao}>
                    {solicitation.linkPaginaInscricao}
                  </TruncatedLink>
                }
              />
              <InfoItem label="País" value={solicitation.pais} />
              <InfoItem label="Cidade" value={solicitation.cidade} />
              <InfoItem label="Qualis" value={solicitation.qualis} />
            </SectionPaper>
          </Box>
        </Fade>

        <Fade in timeout={800}>
          <Box sx={{ width: { xs: '100%', lg: '25%' } }}>
            <SectionPaper
              title="Detalhamento Financeiro"
              icon={<AttachMoney color="primary" />}
            >
              <InfoItem
                label="Valor da Inscrição"
                value={formatNumberToBRL(solicitation.valorInscricao)}
              />
              {solicitation.quantidadeDiariasSolicitadas > 0 && (
                <InfoItem
                  label="Número de Diárias"
                  value={solicitation.quantidadeDiariasSolicitadas}
                />
              )}
              {solicitation.quantidadeDiariasSolicitadas > 0 && (
                <InfoItem
                  label="Valor da Diária"
                  value={
                    solicitation.isDolar
                      ? `$ ${solicitation.valorDiaria?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (USD)`
                      : formatNumberToBRL(solicitation.valorDiaria)
                  }
                />
              )}
              {solicitation.quantidadeDiariasSolicitadas > 0 &&
                solicitation.isDolar && (
                  <InfoItem
                    label="Cotação do Dólar"
                    value={`R$ ${solicitation.cotacaoMoeda?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  />
                )}

              {solicitation.quantidadeDiariasSolicitadas > 1 && (
                <InfoItem
                  label="Última diária no valor integral?"
                  value={booleanToYesOrNo(
                    solicitation.ultimaDiariaIntegral ?? false,
                  )}
                />
              )}

              {solicitation.solicitanteDocente && (
                <InfoItem
                  label="Valor da Passagem Aérea"
                  value={formatNumberToBRL(solicitation.valorPassagem)}
                />
              )}
              <InfoItem
                label="Valor Total"
                value={formatNumberToBRL(solicitation.valorTotal)}
              />
            </SectionPaper>
          </Box>
        </Fade>
      </Stack>
    </Container>
  );
}
