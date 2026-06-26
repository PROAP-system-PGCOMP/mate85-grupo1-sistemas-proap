import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  IconButton,
  alpha,
  Tooltip,
  Chip, 
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { formatNumberToBRL } from '../../../../helpers/formatter';
import { SolicitationDetailsDialogProps } from '../../request-dialog/SolicitationDetailsDialog';
import { StatusChip } from './index';
import FactCheckIcon from '@mui/icons-material/FactCheck';

import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const safelyFormatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  if (dateString.includes('/')) return dateString;
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  } catch (e) {
    return dateString;
  }
};

interface SolicitationCardProps {
  solicitation: any;
  currentUserEmail: string;
  userCanViewAllRequests: boolean;
  userCanReviewRequests: boolean;
  isCeapg: boolean;
  onEdit: (id: number, tipo: string) => void;
  onReview: (id: number, tipo: string) => void;
  onView: (id: number, tipo: string) => void;
  onDelete: (id: number, tipo: string) => void;
  onClone: (id: number, tipo: string) => void;
  onShowDetails: (props: SolicitationDetailsDialogProps) => void;
}

const SolicitationCard: React.FC<SolicitationCardProps> = ({
  solicitation,
  currentUserEmail,
  userCanViewAllRequests,
  userCanReviewRequests,
  isCeapg,
  onEdit,
  onReview,
  onView,
  onDelete,
  onClone,
  onShowDetails,
}) => {
  const {
    id,
    user,
    valorTotal,
    createdAt,
    situacao,
    valorAprovado,
    dataAvaliacaoProap,
    solicitanteDocente,
    tituloPublicacao,
    valorDiaria,
    cotacaoMoeda,
    nomeEvento,
    isDolar,
    qualis,
    cidade,
    pais,
    dataInicio,
    dataFim,
    observacao,
    tipoSolicitacao = 'Apoio', 
  } = solicitation;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleCardClick = () => {
    if (id !== undefined) onView(id, tipoSolicitacao);
  };

  const handleEdit = () => {
    if (id !== undefined) {
      onEdit(id, tipoSolicitacao);
      handleCloseMenu();
    }
  };

  const handleReview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id !== undefined) onReview(id, tipoSolicitacao);
  };

  const handleClone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id !== undefined) onClone(id, tipoSolicitacao);
  };

  const handleDelete = () => {
    if (id !== undefined) {
      onDelete(id, tipoSolicitacao);
      handleCloseMenu();
    }
  };

  const handleShowDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShowDetails({
      nomeSolicitante: user?.name,
      solicitanteDocente,
      valorTotal,
      valorDiarias: valorDiaria,
      variacaoCambial: cotacaoMoeda,
      nomeEvento,
      tituloPublicacao,
      isDolar,
      qualisEvento: qualis,
      cidade,
      pais,
      dataInicio,
      dataFim,
      situacao,
      observacoes: observacao,
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
        
        {/* --- Topo do Card com as Tags --- */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5} gap={1.5}>
          {tipoSolicitacao === 'Extra' ? (
            <Chip label="Demanda Extra" size="small" variant="outlined" sx={{ color: '#d81b60', borderColor: '#d81b60', height: 24}} />
          ) : (
            <Chip label="Apoio" color="primary" size="small" variant="outlined" sx={{ height: 24 }} />
          )}
          <StatusChip status={situacao} />
        </Box>

        <Box mb={1}>
          <Typography
            variant="subtitle1"
            fontWeight="medium"
            component="div"
            sx={{
               overflow: 'hidden',
               textOverflow: 'ellipsis',
               display: '-webkit-box',
               WebkitLineClamp: 2,
               WebkitBoxOrient: 'vertical',
            }}
          >
            {user?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" component="div">
            Solicitado em: {safelyFormatDate(createdAt)}
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box mt={1.5}>
          <Typography variant="body2" color="text.secondary">
            Valor solicitado
          </Typography>
          <Typography variant="h6" component="div" fontWeight="medium">
            {formatNumberToBRL(valorTotal)}
          </Typography>
        </Box>

        <Box mt={1.5} display="flex" justifyContent="space-between">
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
              {safelyFormatDate(dataAvaliacaoProap)}
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
            <Tooltip title="Ver resumo da Solicitação">
              <IconButton size="small" color="default" onClick={handleShowDetails}>
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

          <Tooltip title="Clonar solicitação">
            <IconButton size="small" onClick={handleClone}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Editar solicitação">
            <span>
              <IconButton
                size="small"
                onClick={handleEdit}
                disabled={!((situacao === 0 && currentUserEmail === user?.email) || userCanReviewRequests)}
              >
                <ModeEditIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Excluir solicitação">
            <span>
              <IconButton
                size="small"
                onClick={handleDelete}
                disabled={!((situacao === 0 && currentUserEmail === user?.email) || userCanReviewRequests)}
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

export default SolicitationCard;