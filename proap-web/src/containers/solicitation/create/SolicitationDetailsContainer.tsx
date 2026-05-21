import React from 'react';

import { Grid, Link, Stack, Tooltip, Typography } from '@mui/material';
import styled from '@emotion/styled';

import { InitialSolicitationFormValues } from '../SolicitationFormSchema';
import { booleanToYesOrNo, dateToLocalDate } from '../../../helpers/conversion';
import { useAuth } from '../../../hooks';
import { BASE_PDF_URL } from '../../../helpers/api';
import {
  columnStyle,
  StyledData,
  TruncatedText,
} from '../SolicitationFormContainer.style';
import { formatNumberToBRL } from '../../../helpers/formatter';

export default function SolicitationDetailsContainer({
  solicitation,
}: {
  solicitation: InitialSolicitationFormValues;
}) {
  const currentUser = useAuth();

  return (
    <>
      <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
        Resumo da solicitação{' '}
      </Typography>
      <Stack direction={{ sm: 'column', md: 'row' }} spacing={2}>
        <Stack sx={columnStyle}>
          <StyledData>
            <Typography>Nome do Solicitante</Typography>
            <TruncatedText variant="subtitle2">
              {currentUser.name}
            </TruncatedText>
          </StyledData>

          <StyledData>
            <Typography>Email do Solicitante</Typography>
            <TruncatedText variant="subtitle2">
              {currentUser.email}
            </TruncatedText>
          </StyledData>

          <StyledData>
            <Typography>
              Solicitação em nome do
              <span style={{ color: 'red' }}> *</span>
            </Typography>
            <TruncatedText variant="subtitle2">
              {solicitation.solicitanteDocente ? 'Docente' : 'Discente'}
            </TruncatedText>
          </StyledData>

          <StyledData>
            <Typography>
              Nome do Discente PGCOMP <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TruncatedText variant="subtitle2">
              {solicitation.nomeDiscente}
            </TruncatedText>
          </StyledData>
          <StyledData>
            <Typography>
              Nome do Docente Orientador do PGCOMP <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TruncatedText variant="subtitle2">
              {solicitation.nomeDocente}
            </TruncatedText>
          </StyledData>

          {!solicitation.solicitanteDocente && (
            <StyledData>
              <Typography>
                Está no prazo regular para finalização do seu curso (mestrado ou
                doutorado)? <span style={{ color: 'red' }}>*</span>
              </Typography>
              <TruncatedText variant="subtitle2">
                {booleanToYesOrNo(solicitation.discenteNoPrazoDoCurso!)}
              </TruncatedText>
            </StyledData>
          )}

          {!solicitation.solicitanteDocente &&
            !solicitation.discenteNoPrazoDoCurso && (
              <StyledData>
                <Typography>
                  Quantos meses já se passaram do prazo regular?{' '}
                  <span style={{ color: 'red' }}>*</span>
                </Typography>
                <TruncatedText variant="subtitle2">
                  {solicitation.mesesAtrasoCurso} meses
                </TruncatedText>
              </StyledData>
            )}
        </Stack>
        {/* Segunda Coluna - Detalhes do Solicitante ... */}
        <Stack sx={columnStyle}>
          <StyledData>
            <Typography>
              Título completo da publicação a ser apoiada
              <span style={{ color: 'red' }}> *</span>
            </Typography>
            <TruncatedText variant="subtitle2">
              {solicitation.tituloPublicacao}
            </TruncatedText>
          </StyledData>

          <StyledData>
            <Typography>
              Lista completa de co-autor(es) da publicação a ser apoiada
            </Typography>
            {solicitation.coautores.length > 0 ? (
              solicitation.coautores.map((coautor) => {
                return (
                  <TruncatedText key={coautor} variant="subtitle2">
                    {coautor}
                  </TruncatedText>
                );
              })
            ) : (
              <TruncatedText variant="subtitle2">
                Nenhum co-autor informado
              </TruncatedText>
            )}
          </StyledData>
          <StyledData>
            <Typography>
              Há alunos ativos do PGCOMP coautores/coparticipantes direto na
              solicitação?
            </Typography>
            <TruncatedText variant="subtitle2">
              {booleanToYesOrNo(solicitation.algumCoautorPGCOMP ?? false)}
            </TruncatedText>
          </StyledData>

          <StyledData>
            <Typography>Arquivo da carta de aceite do artigo</Typography>
            <TruncatedText variant="subtitle2">
              {solicitation.cartaAceite
                ? (solicitation.file?.name ?? (
                    <Link
                      href={BASE_PDF_URL + solicitation.cartaAceite}
                      target="_blank"
                      rel="noopener"
                      sx={{ alignSelf: 'center' }}
                    >
                      <Typography sx={{ fontWeight: 'bold' }}>
                        Visualizar
                      </Typography>
                    </Link>
                  ))
                : (solicitation.file?.name ?? 'Nenhum arquivo enviado')}
            </TruncatedText>
          </StyledData>
        </Stack>

        {/* Terceira Coluna Detalhamento do Evento ... */}
        <Stack sx={columnStyle}>
          <StyledData>
            <Typography>
              Nome do Evento (ou Solicitação)
              <span style={{ color: 'red' }}> *</span>
            </Typography>
            <TruncatedText variant="subtitle2">
              {solicitation.nomeEvento}
            </TruncatedText>
          </StyledData>
          <StyledData>
            <Typography>
              Natureza da Solicitação
              <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TruncatedText variant="subtitle2">
              {solicitation.eventoInternacional ? 'Internacional' : 'Nacional'}
            </TruncatedText>
          </StyledData>
          <StyledData>
            <Typography>
              Data de início<span style={{ color: 'red' }}>*</span>
            </Typography>
            <TruncatedText variant="subtitle2">
              {dateToLocalDate(solicitation.dataInicio)}
            </TruncatedText>
          </StyledData>
          <StyledData>
            <Typography>
              Data de término<span style={{ color: 'red' }}>*</span>
            </Typography>
            <TruncatedText variant="subtitle2">
              {dateToLocalDate(solicitation.dataFim)}
            </TruncatedText>
          </StyledData>
          <StyledData>
            <Typography>
              Quantos dias de evento?
              <span style={{ color: 'red' }}> *</span>
            </Typography>
            <TruncatedText variant="subtitle2">
              {`${solicitation.qtdDiasEvento} dia${solicitation.qtdDiasEvento === 1 ? '' : 's'}`}
            </TruncatedText>
          </StyledData>

          <StyledData>
            <Typography>
              Homepage do Evento (ou Solicitação)
              <span style={{ color: 'red' }}> *</span>
            </Typography>
            <Tooltip
              title={solicitation.linkHomePageEvento}
              arrow
              placement="top"
            >
              <TruncatedText variant="subtitle2">
                {solicitation.linkHomePageEvento}
              </TruncatedText>
            </Tooltip>
          </StyledData>

          <StyledData>
            <Typography>
              Link da página da inscrição do evento (ou solicitação)
              <span style={{ color: 'red' }}> *</span>
            </Typography>
            <Tooltip
              title={solicitation.linkPaginaInscricao}
              arrow
              placement="top"
            >
              <TruncatedText variant="subtitle2">
                {solicitation.linkPaginaInscricao}
              </TruncatedText>
            </Tooltip>
          </StyledData>

          <StyledData>
            <Typography>
              País<span style={{ color: 'red' }}> *</span>
            </Typography>
            <TruncatedText variant="subtitle2">
              {solicitation.pais}
            </TruncatedText>
          </StyledData>
          <StyledData>
            <Typography>
              Cidade<span style={{ color: 'red' }}> *</span>
            </Typography>
            <TruncatedText variant="subtitle2">
              {solicitation.cidade}
            </TruncatedText>
          </StyledData>

          <StyledData>
            <Typography>
              Modalidade de participação{' '}
              <span style={{ color: 'red' }}> *</span>
            </Typography>
            <TruncatedText variant="subtitle2">
              {solicitation.modalidadeParticipacao
                .substring(0, 1)
                .toUpperCase() +
                solicitation.modalidadeParticipacao.substring(1)}
            </TruncatedText>
          </StyledData>
          <StyledData>
            <Typography>
              Informe o Qualis do seu evento
              <span style={{ color: 'red' }}> *</span>
            </Typography>
            <TruncatedText variant="subtitle2">
              {solicitation.qualis}
            </TruncatedText>
          </StyledData>
        </Stack>
        {/* Quarta Coluna Detalhamento Financeiro ... */}
        <Stack sx={columnStyle}>
          <StyledData>
            <Typography>
              Valor da inscrição/solicitação (R$)
              <span style={{ color: 'red' }}> *</span>
            </Typography>
            <TruncatedText variant="body1" color="text.secondary">
              {formatNumberToBRL(solicitation.valorInscricao)}
            </TruncatedText>
          </StyledData>
          <StyledData>
            <Typography>
              Quantas diárias deseja solicitar?
              <span style={{ color: 'red' }}> *</span>
            </Typography>
            <TruncatedText variant="subtitle2">
              {solicitation.quantidadeDiariasSolicitadas} diária
              {solicitation.quantidadeDiariasSolicitadas > 1 && 's'}
            </TruncatedText>
          </StyledData>
          {solicitation.quantidadeDiariasSolicitadas > 0 && (
            <>
              <StyledData>
                <Typography>Informe o valor da sua diária</Typography>
                <TruncatedText variant="body1" color="text.secondary">
                  {solicitation.isDolar
                    ? `$ ${solicitation.valorDiaria?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : formatNumberToBRL(solicitation.valorDiaria)}
                </TruncatedText>
              </StyledData>
              {solicitation.isDolar && (
                <StyledData>
                  <Typography>
                    Informe o valor da cotação do dólar americano (USD)
                  </Typography>
                  <TruncatedText variant="subtitle2">
                    {`$ ${solicitation.cotacaoMoeda?.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
                  </TruncatedText>
                </StyledData>
              )}
            </>
          )}
          {solicitation.quantidadeDiariasSolicitadas > 1 && (
            <StyledData>
              <Typography>
                Deseja que a última diária seja no valor integral?
              </Typography>
              <TruncatedText variant="subtitle2">
                {booleanToYesOrNo(solicitation.ultimaDiariaIntegral ?? false)}
              </TruncatedText>
            </StyledData>
          )}
          {solicitation.solicitanteDocente && (
            <StyledData>
              <Typography>
                Informe o valor aproximado da passagem aérea
              </Typography>
              <TruncatedText variant="body1" color="text.secondary">
                {formatNumberToBRL(solicitation.valorPassagem)}
              </TruncatedText>
            </StyledData>
          )}
          <StyledData>
            <Typography>Valor total da solicitação (R$) </Typography>
            <TruncatedText variant="body1" color="text.secondary">
              {formatNumberToBRL(solicitation.valorTotal)}
            </TruncatedText>
          </StyledData>
        </Stack>
      </Stack>
    </>
  );
}
