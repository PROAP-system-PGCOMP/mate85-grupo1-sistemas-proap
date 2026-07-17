import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatNumberToBRL } from '../../../../helpers/formatter';
import { StatusChip } from './index';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import { Button, SvgIcon, SvgIconProps} from "@mui/material";
import { SolicitationDetailsDialogProps } from '../../request-dialog/SolicitationDetailsDialog';

interface ExtraRequestCardProps {
  extraRequest: any;
  searchQuery: string;
  currentUserEmail: string;
  userCanViewAllRequests: boolean;
  userCanReviewRequests: boolean;
  isCeapg: boolean;
  onEdit: (id: number) => void;
  onReview: (id: number) => void;
  onView: (id: number) => void;
  onDelete: (id: number) => void;
  // Substituindo a prop antiga onShowText pelo novo handler do modal
  onShowDetails: (props: SolicitationDetailsDialogProps) => void;
}

const EditSquareIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M5 21q-.825 0-1.413-.587Q3 19.825 3 19V5q0-.825.587-1.413Q4.175 3 5 3h8.925l-2 2H5v14h14v-6.95l2-2V19q0 .825-.587 1.413Q19.825 21 19 21Zm4-6v-2.125l5.975-5.975 2.125 2.125L11.125 15Zm8.8-6.025-2.125-2.125.85-.85q.275-.275.688-.275.412 0 .687.275l.75.75q.275.275.275.688 0 .412-.275.687Z"/>
  </SvgIcon>
);

const ExtraRequestCard: React.FC<ExtraRequestCardProps> = ({
  extraRequest,
  currentUserEmail,
  userCanViewAllRequests,
  userCanReviewRequests,
  isCeapg,
  onEdit,
  onReview,
  onView,
  onDelete,
  onShowDetails,
}) => {
  const {
    id,
    user,
    valorSolicitado,
    createdAt,
    situacao,
    valorAprovado,
    automaticDecText,
    dataAvaliacaoProap,
  } = extraRequest;

  const handleCardClick = () => {
    if (id !== undefined) onView(id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id !== undefined) onEdit(id);
  };

  const handleReview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id !== undefined) onReview(id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id !== undefined) onDelete(id);
  };

  // Handler atualizado para enviar o objeto completo para o modal de detalhes
  const handleShowDetailsClick = (e: React.MouseEvent) => {
  e.stopPropagation();
  onShowDetails({
    // Campos que existem na interface:
    nomeSolicitante: user.name,
    solicitanteDocente: false, 
    valorTotal: valorSolicitado || 0,
    situacao: situacao,
    observacoes: automaticDecText || '',
    
    // Campos OBRIGATÓRIOS que faltavam (preenchendo com valores padrão para Demanda Extra):
    variacaoCambial: 0,
    valorDiarias: 0,
    isDolar: false,
    nomeEvento: 'Solicitação de Demanda Extra', // Placeholder para identificar no modal
    tituloPublicacao: 'N/A',
    qualisEvento: 'N/A',
    cidade: 'Lauro de Freitas', // Ou pegue de uma constante de localização
    pais: 'Brasil',
    dataInicio: createdAt, // Usando a data de criação como placeholder de período
    dataFim: createdAt,
  });
  };

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3,
        },
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Box sx={{
          display:"flex",
          justifyContent:"space-between",
          alignItems:"flex-start",
          mb:1
          }}
        >
          <Box>
            <Typography 
              variant="subtitle1" 
              component="div" 
              gutterBottom
              sx={{
                fontWeight: "medium",
                maxWidth: '18ch'
              }}
            >
              {user.name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              component="div"
            >
              Solicitado em: {createdAt}
            </Typography>
          </Box>
          <StatusChip status={situacao} />
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ mt: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            Valor solicitado
          </Typography>
          <Typography sx={{variant:"h6", component:"div", fontWeight:"medium"}}>
            {valorSolicitado != null ? formatNumberToBRL(valorSolicitado) : '-'}
          </Typography>
        </Box>

        <Box sx={{ mt: 1.5, display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Valor aprovado
            </Typography>
            <Typography variant="body1">
              {valorAprovado === null ? '-' : formatNumberToBRL(valorAprovado)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary" align="right">
              Data de avaliação
            </Typography>
            <Typography variant="body1" align="right">
              {dataAvaliacaoProap === null ? '-' : dataAvaliacaoProap}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          p: 1,
          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          {userCanViewAllRequests && (
            <Tooltip title="Ver resumo da solicitação">
              <IconButton size="small" color="default" onClick={handleShowDetailsClick}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {(userCanReviewRequests || isCeapg) && (
            <Tooltip title="Revisar Solicitação">
              <IconButton size="small" color="default" onClick={handleReview}>
                <FactCheckIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Editar solicitação">
            <span>
              <IconButton
                size="small"
                onClick={handleEdit}
                disabled={
                  !(
                    (situacao == 0 && currentUserEmail === user.email) ||
                    userCanReviewRequests
                  )
                }
              >
                <EditSquareIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Excluir solicitação">
            <span>
              <IconButton
                size="small"
                onClick={handleDelete}
                disabled={
                  !(
                    (situacao == 0 && currentUserEmail === user.email) ||
                    userCanReviewRequests
                  )
                }
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
    </Card>
  );
};

export default ExtraRequestCard;