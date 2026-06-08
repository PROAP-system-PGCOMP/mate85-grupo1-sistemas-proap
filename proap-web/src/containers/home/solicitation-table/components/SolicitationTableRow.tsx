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
  Chip,
} from '@mui/material';
import { CheckCircle, Visibility, MoreVert } from '@mui/icons-material';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FactCheckIcon from '@mui/icons-material/FactCheck';
// --- ADIÇÃO 1: IMPORTAR O ÍCONE DO LIVRO ---
import MenuBookIcon from '@mui/icons-material/MenuBook';

import { formatNumberToBRL } from '../../../../helpers/formatter';
import { SolicitationDetailsDialogProps } from '../../request-dialog/SolicitationDetailsDialog';
import { StatusChip } from './index';
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
  tipoSolicitacao?: 'Apoio' | 'Extra';
}

interface SolicitationTableRowProps extends SolicitationRowData {
  currentUserEmail: string;
  userCanViewAllRequests: boolean;
  userCanReviewRequests: boolean;
  isCeapg: boolean;
  row?: any; 
  onOpenAtaDialog?: (row: any) => void;
  onEdit: (id: number, tipo: string) => void;
  onReview: (id: number, tipo: string) => void;
  onView: (id: number, tipo: string) => void;
  onDelete: (id: number, tipo: string) => void;
  onClone: (id: number, tipo: string) => void;
  onShowDetails: (props: SolicitationDetailsDialogProps) => void;
}

const safelyFormatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  if (dateString.includes('/')) return dateString;
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  } catch (e) {
    return dateString;
  }
};

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
  tipoSolicitacao = 'Apoio',
  currentUserEmail,
  userCanViewAllRequests,
  userCanReviewRequests,
  isCeapg,
  row,               
  onOpenAtaDialog,   
  onEdit,
  onReview,
  onView,
  onDelete,
  onClone,
  onShowDetails,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleRowClick = () => {
    if (id !== undefined) onView(id, tipoSolicitacao);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id !== undefined) {
      onEdit(id, tipoSolicitacao);
      handleCloseMenu();
    }
  };

  const handleReview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id !== undefined) onReview(id, tipoSolicitacao);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id !== undefined) {
      onDelete(id, tipoSolicitacao);
      handleCloseMenu();
    }
  };

  const handleClone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id !== undefined) onClone(id, tipoSolicitacao);
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

  // --- ADIÇÃO 3: FUNÇÃO PARA ABRIR O MODAL DE ATA ---
  const handleOpenAta = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenAtaDialog) {
      onOpenAtaDialog(row || {
        id, user, valorTotal, situacao, valorAprovado, solicitanteDocente, 
        tituloPublicacao, valorDiaria, cotacaoMoeda, nomeEvento, isDolar, 
        qualis, cidade, pais, dataInicio, dataFim
      });
    }
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
      <TableCell align="center">
        {tipoSolicitacao === 'Extra' ? (
          <Chip label="Demanda Extra" size="small" variant="outlined" sx={{ color: '#d81b60', borderColor: '#d81b60' }} />
        ) : (
          <Chip label="Publicação" color="primary" size="small" variant="outlined" />
        )}
      </TableCell>

      <TableCell align="left">{safelyFormatDate(createdAt)}</TableCell>
      <TableCell align="center">
        {solicitanteDocente ? (
          <Chip label="Docente" size="small" sx={{ bgcolor: '#e1f5fe', color: '#0288d1', fontWeight: 500 }} />
        ) : (
          <Chip label="Discente" size="small" sx={{ bgcolor: '#efebe9', color: '#5d4037', fontWeight: 500 }} />
        )}
      </TableCell>
      <TableCell align="left">{user.name}</TableCell>
      <TableCell align="center">
        <StatusChip status={situacao} />
      </TableCell>
      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>{formatNumberToBRL(valorTotal)}</TableCell>
      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
        {valorAprovado === null ? '-' : formatNumberToBRL(valorAprovado)}
      </TableCell>
      <TableCell align="center">{safelyFormatDate(dataAvaliacaoProap)}</TableCell>
      <TableCell align="center">{numeroAta || '-'}</TableCell>

      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
          
          {userCanViewAllRequests && (
            <Tooltip title="Ver resumo da Solicitação">
              <IconButton size="small" color="default" onClick={handleShowDetailsClick}>
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {(isCeapg || userCanReviewRequests) && (situacao === 1 || situacao === 2 || situacao === 3) && (
            <Tooltip title="Gerar texto para Ata">
              <IconButton size="small" color="default" onClick={handleOpenAta}>
                <MenuBookIcon fontSize="small" />
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
                disabled={!((situacao == 0 && currentUserEmail === user.email) || userCanReviewRequests)}
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
                disabled={!((situacao == 0 && currentUserEmail === user.email) || userCanReviewRequests)}
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