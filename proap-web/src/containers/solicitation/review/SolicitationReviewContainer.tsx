import React from 'react';
import {
  Box,
  Link,
  Stack,
  Typography,
  Divider,
  Chip,
  Tooltip,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { SolicitationFormValues } from '../SolicitationFormSchema';
import { booleanToYesOrNo, dateToLocalDate } from '../../../helpers/conversion';
import { BASE_PDF_URL } from '../../../helpers/api';
import { StyledData, TruncatedText } from '../SolicitationFormContainer.style';
import { Person, Event, AttachMoney, School } from '@mui/icons-material';
import { formatNumberToBRL } from '../../../helpers/formatter';

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
        maxWidth: '100%',
        display: 'block',
      }}
    >
      <TruncatedText variant="body1">{children}</TruncatedText>
    </Link>
  </Tooltip>
);

export default function SolicitationReviewContainer() {
  const { values } = useFormikContext<SolicitationFormValues>();

  const Section = ({
    title,
    icon,
    children,
  }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <Box
      sx={{
        flex: 1,
        minWidth: 300,
        p: 3,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        height: 'fit-content',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        {icon}
        <Typography
          variant="h6"
          sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}
        >
          {title}
        </Typography>
      </Box>
      <Stack spacing={2}>{children}</Stack>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Resumo da solicitação
        </Typography>
        <Chip
          label={values.eventoInternacional ? 'Internacional' : 'Nacional'}
          color={values.eventoInternacional ? 'primary' : 'default'}
          size="small"
          sx={{ ml: 2 }}
        />
      </Box>

      <Stack spacing={3}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Detalhes do Solicitante */}
          <Section
            title="Detalhes do Solicitante"
            icon={<Person color="primary" />}
          >
            <StyledData>
              <Typography variant="subtitle2" color="text.secondary">
                Solicitante
              </Typography>
              {values.user.name.length > 50 ? (
                <Tooltip title={values.user.name} arrow placement="top">
                  <TruncatedText>{values.user.name}</TruncatedText>
                </Tooltip>
              ) : (
                <Typography>{values.user.name}</Typography>
              )}
            </StyledData>

            <StyledData>
              <Typography variant="subtitle2" color="text.secondary">
                Email
              </Typography>
              {values.user.email.length > 50 ? (
                <Tooltip title={values.user.email} arrow placement="top">
                  <TruncatedText>{values.user.email}</TruncatedText>
                </Tooltip>
              ) : (
                <Typography>{values.user.email}</Typography>
              )}
            </StyledData>

            <StyledData>
              <Typography variant="subtitle2" color="text.secondary">
                Telefone
              </Typography>
              <Typography>{values.user.phone}</Typography>
            </StyledData>

            <Divider sx={{ my: 1 }} />

            <StyledData>
              <Typography variant="subtitle2" color="text.secondary">
                Tipo de Solicitante
              </Typography>
              <Typography>
                {values.solicitanteDocente ? 'Docente' : 'Discente'}
              </Typography>
            </StyledData>

            {values.nomeDiscente && (
              <StyledData>
                <Typography variant="subtitle2" color="text.secondary">
                  Nome do Discente PGCOMP
                </Typography>
                {values.nomeDiscente.length > 50 ? (
                  <Tooltip title={values.nomeDiscente} arrow placement="top">
                    <TruncatedText>{values.nomeDiscente}</TruncatedText>
                  </Tooltip>
                ) : (
                  <Typography>{values.nomeDiscente}</Typography>
                )}
              </StyledData>
            )}

            {values.nomeDocente && (
              <StyledData>
                <Typography variant="subtitle2" color="text.secondary">
                  Nome do Docente PGCOMP
                </Typography>
                {values.nomeDocente.length > 50 ? (
                  <Tooltip title={values.nomeDocente} arrow placement="top">
                    <TruncatedText>{values.nomeDocente}</TruncatedText>
                  </Tooltip>
                ) : (
                  <Typography>{values.nomeDocente}</Typography>
                )}
              </StyledData>
            )}

            {!values.solicitanteDocente && (
              <>
                <StyledData>
                  <Typography variant="subtitle2" color="text.secondary">
                    No prazo regular do curso?
                  </Typography>
                  <Typography>
                    {booleanToYesOrNo(values.discenteNoPrazoDoCurso!)}
                  </Typography>
                </StyledData>

                {!values.discenteNoPrazoDoCurso && (
                  <StyledData>
                    <Typography variant="subtitle2" color="text.secondary">
                      Meses de atraso
                    </Typography>
                    <Typography>{values.mesesAtrasoCurso} meses</Typography>
                  </StyledData>
                )}
              </>
            )}
          </Section>

          {/* Dados da Solicitação */}
          <Section
            title="Dados da Solicitação"
            icon={<School color="primary" />}
          >
            <StyledData>
              <Typography variant="subtitle2" color="text.secondary">
                Título da publicação
              </Typography>
              {values.tituloPublicacao.length > 50 ? (
                <Tooltip title={values.tituloPublicacao} arrow placement="top">
                  <TruncatedText>{values.tituloPublicacao}</TruncatedText>
                </Tooltip>
              ) : (
                <Typography>{values.tituloPublicacao}</Typography>
              )}
            </StyledData>

            <StyledData>
              <Typography variant="subtitle2" color="text.secondary">
                Co-autores
              </Typography>
              {values.coautores.length > 0 ? (
                <Stack spacing={0.5}>
                  {values.coautores.map((coautor, index) =>
                    coautor.length > 50 ? (
                      <Tooltip
                        key={index}
                        title={coautor}
                        arrow
                        placement="top"
                      >
                        <TruncatedText>{coautor}</TruncatedText>
                      </Tooltip>
                    ) : (
                      <Typography key={index}>{coautor}</Typography>
                    ),
                  )}
                </Stack>
              ) : (
                <Typography color="text.secondary">
                  Nenhum co-autor informado
                </Typography>
              )}
            </StyledData>

            <StyledData>
              <Typography variant="subtitle2" color="text.secondary">
                Coautores PGCOMP?
              </Typography>
              <Typography>
                {booleanToYesOrNo(values.algumCoautorPGCOMP ?? false)}
              </Typography>
            </StyledData>

            <StyledData>
              <Typography variant="subtitle2" color="text.secondary">
                Carta de aceite
              </Typography>
              {values.cartaAceite ? (
                <Typography variant="body1">
                  <Link
                    href={BASE_PDF_URL + values.cartaAceite}
                    target="_blank"
                    rel="noopener"
                  >
                    Visualizar
                  </Link>
                </Typography>
              ) : (
                <Typography color="text.secondary">
                  Nenhum arquivo enviado
                </Typography>
              )}
            </StyledData>
          </Section>
          {/* Detalhamento Financeiro */}
          <Section
            title="Detalhamento Financeiro"
            icon={<AttachMoney color="primary" />}
          >
            <StyledData>
              <Typography variant="subtitle2" color="text.secondary">
                Valor da inscrição
              </Typography>
              <Typography>
                {formatNumberToBRL(values.valorInscricao)}
              </Typography>
            </StyledData>

            <StyledData>
              <Typography variant="subtitle2" color="text.secondary">
                Diárias solicitadas
              </Typography>
              <Typography>
                {values.quantidadeDiariasSolicitadas} diária
                {values.quantidadeDiariasSolicitadas !== 1 && 's'}
              </Typography>
            </StyledData>

            {values.quantidadeDiariasSolicitadas > 0 && (
              <>
                <StyledData>
                  <Typography variant="subtitle2" color="text.secondary">
                    Valor da diária
                  </Typography>
                  <Typography>
                    {values.isDolar
                      ? `$ ${values.valorDiaria?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : formatNumberToBRL(values.valorDiaria)}
                  </Typography>
                </StyledData>

                {values.isDolar && (
                  <StyledData>
                    <Typography variant="subtitle2" color="text.secondary">
                      Cotação do dólar (USD)
                    </Typography>
                    <Typography>
                      {formatNumberToBRL(values.cotacaoMoeda)}
                    </Typography>
                  </StyledData>
                )}

                {values.quantidadeDiariasSolicitadas > 1 && (
                  <StyledData>
                    <Typography variant="subtitle2" color="text.secondary">
                      Última diária integral?
                    </Typography>
                    <Typography>
                      {booleanToYesOrNo(values.ultimaDiariaIntegral ?? false)}
                    </Typography>
                  </StyledData>
                )}
              </>
            )}

            {values.solicitanteDocente && (
              <StyledData>
                <Typography variant="subtitle2" color="text.secondary">
                  Valor da passagem aérea
                </Typography>
                <Typography>
                  {formatNumberToBRL(values.valorPassagem)}
                </Typography>
              </StyledData>
            )}

            <Divider sx={{ my: 1 }} />

            <StyledData>
              <Typography variant="subtitle2" color="text.secondary">
                Valor total da solicitação
              </Typography>
              <Typography
                variant="h6"
                color="primary"
                sx={{ fontWeight: 'bold' }}
              >
                {formatNumberToBRL(values.valorTotal)}
              </Typography>
            </StyledData>
          </Section>

          {/* Detalhamento do Evento */}
          <Section
            title="Detalhamento do Evento"
            icon={<Event color="primary" />}
          >
            <StyledData>
              <Typography variant="subtitle2" color="text.secondary">
                Nome do Evento
              </Typography>
              {values.nomeEvento.length > 50 ? (
                <Tooltip title={values.nomeEvento} arrow placement="top">
                  <TruncatedText>{values.nomeEvento}</TruncatedText>
                </Tooltip>
              ) : (
                <Typography>{values.nomeEvento}</Typography>
              )}
            </StyledData>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <StyledData>
                <Typography variant="subtitle2" color="text.secondary">
                  Data de início
                </Typography>
                <Typography>{dateToLocalDate(values.dataInicio)}</Typography>
              </StyledData>

              <StyledData>
                <Typography variant="subtitle2" color="text.secondary">
                  Data de término
                </Typography>
                <Typography>{dateToLocalDate(values.dataFim)}</Typography>
              </StyledData>
            </Box>

            <StyledData>
              <Typography>
                Quantos dias de evento?
                <span style={{ color: 'red' }}> *</span>
              </Typography>
              <TruncatedText variant="subtitle2">
                {`${values.qtdDiasEvento} dia${values.qtdDiasEvento === 1 ? '' : 's'}`}
              </TruncatedText>
            </StyledData>

            <StyledData>
              <Typography variant="subtitle2" color="text.secondary">
                Homepage do Evento
              </Typography>
              <TruncatedLink href={values.linkHomePageEvento}>
                {values.linkHomePageEvento}
              </TruncatedLink>
            </StyledData>

            <StyledData>
              <Typography variant="subtitle2" color="text.secondary">
                Link da inscrição
              </Typography>
              <TruncatedLink href={values.linkPaginaInscricao}>
                {values.linkPaginaInscricao}
              </TruncatedLink>
            </StyledData>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <StyledData>
                <Typography variant="subtitle2" color="text.secondary">
                  País
                </Typography>
                <Typography>{values.pais}</Typography>
              </StyledData>

              <StyledData>
                <Typography variant="subtitle2" color="text.secondary">
                  Cidade
                </Typography>
                <Typography>{values.cidade}</Typography>
              </StyledData>
            </Box>

            <StyledData>
              <Typography variant="subtitle2" color="text.secondary">
                Modalidade
              </Typography>
              <Typography>
                {values.modalidadeParticipacao.charAt(0).toUpperCase() +
                  values.modalidadeParticipacao.slice(1)}
              </Typography>
            </StyledData>

            <StyledData>
              <Typography variant="subtitle2" color="text.secondary">
                Qualis
              </Typography>
              <Typography>{values.qualis}</Typography>
            </StyledData>
          </Section>
        </Box>
      </Stack>
    </Box>
  );
}
