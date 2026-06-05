import React, { useState } from 'react';
import {
  TableRow,
  TableCell,
  Tooltip,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { CheckCircle, Visibility, MoreVert } from '@mui/icons-material';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { formatNumberToBRL } from '../../../../helpers/formatter';
import { SolicitationDetailsDialogProps } from '../../request-dialog/SolicitationDetailsDialog';
import { StatusChip } from './index';
import FactCheckIcon from '@mui/icons-material/FactCheck';

import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SolicitationRowData {
  id?: number;
  user?: {
    name: string;
    email: string;
  };
  valorTotal?: number;
  createdAt?: string;
  situacao?: number;
  valorAprovado?: number | null;
  dataAvaliacaoProap?: string | null;
  solicitanteDocente?: boolean;
  tituloPublicacao?: string;
  numeroAta?: number;
  valorDiaria?: number;
  cotacaoMoeda?: number;
  nomeEvento?: string;
  isDolar?: boolean;
  qualis?: string;
  cidade?: string;
  pais?: string;
  dataInicio?: string;
  dataFim?: string;
  observacao?: string;
}

interface SolicitationTableRowProps extends SolicitationRowData {
  currentUserEmail: string;
  userCanViewAllRequests: boolean;
  userCanReviewRequests: boolean;
  isCeapg: boolean;
  onEdit: (id: number) => void;
  onReview: (id: number) => void;
  onView: (id: number) => void;
  onDelete: (id: number) => void;
  onClone: (id: number) => void;
  onShowDetails: (props: SolicitationDetailsDialogProps) => void;
}

const safelyFormatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  
  // Se a data já vier formatada do backend (ex: "05/06/2026"), não faz nada para não dar erro no parseISO
  // Nota: Isso assume que se vier com barra, não precisamos adicionar a hora,
  // ou a hora já está embutida de outra forma que a API normal trata.
  if (dateString.includes('/')) return dateString;

  try {
    // Transforma o ISO gigante em "dd/MM/yyyy HH:mm" (ex: 05/06/2026 15:30)
    return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  } catch (e) {
    return dateString; // Em caso de falha, retorna o original (provavelmente o ISO feio, mas não quebra)
  }
};

/**
 * Component for displaying a single solicitation in the table
 */
const SolicitationTableRow: React.FC<SolicitationTableRowProps> = ({
  id,
  user = { name: '', email: '' },
  valorTotal = 0,
  createdAt = '',
  situacao = 0,
  valorAprovado = null,
  dataAvaliacaoProap = null,
  solicitanteDocente = false,
  numeroAta = null,
  tituloPublicacao = '',
  valorDiaria = 0,
  cotacaoMoeda = 0,
  nomeEvento = '',
  isDolar = false,
  qualis = '',
  cidade = '',
  pais = '',
  dataInicio = '',
  dataFim = '',
  observacao = '',
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
  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Handle row click to navigate to view page
  const handleRowClick = () => {
    if (id !== undefined) onView(id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id !== undefined) {
      onEdit(id);
      handleCloseMenu();
    }
  };

  const handleReview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id !== undefined) onReview(id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id !== undefined) {
      onDelete(id);
      handleCloseMenu();
    }
  };

  const handleClone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id !== undefined) onClone(id);
  };

  const handleShowDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShowDetails({
      nomeSolicitante: user.name,
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
    <TableRow
      onClick={handleRowClick}
      sx={{
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
      }}
    >
      <TableCell align="left">{safelyFormatDate(createdAt)}</TableCell>
      <TableCell align="left">{user.name}</TableCell>
      <TableCell align="center">
        <StatusChip status={situacao} />
      </TableCell>
      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>{formatNumberToBRL(valorTotal)}</TableCell>
      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
        {valorAprovado === null ? '-' : formatNumberToBRL(valorAprovado)}
      </TableCell>
      <TableCell align="center">
        {safelyFormatDate(dataAvaliacaoProap)}
      </TableCell>
      <TableCell align="center">
        {numeroAta || '-'}
      </TableCell>
      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
          {/* Primary Actions - Always visible */}
          {userCanViewAllRequests && (
            <Tooltip title="Ver resumo da Solicitação">
              <IconButton
                size="small"
                color="default"
                onClick={handleShowDetailsClick}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {(userCanReviewRequests || isCeapg) && (
            <Tooltip title="Revisar Solicitação">
              <IconButton size="small" onClick={handleReview}>
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
                disabled={
                  !(
                    (situacao == 0 && currentUserEmail === user.email) ||
                    userCanReviewRequests
                  )
                }
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
      </TableCell>
    </TableRow>
  );
};

export default SolicitationTableRow;
