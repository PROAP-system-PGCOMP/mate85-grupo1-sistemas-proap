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
import { formatNumberToBRL } from '../../../../helpers/formatter';
import { SolicitationDetailsDialogProps } from '../../request-dialog/SolicitationDetailsDialog';
import { StatusChip } from './index';

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
  onShowDetails: (props: SolicitationDetailsDialogProps) => void;
}

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
  onShowDetails,
}) => {
  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); // Prevent row click when menu button is clicked
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
    e.stopPropagation(); // Prevent row click
    if (id !== undefined) {
      onEdit(id);
      handleCloseMenu();
    }
  };

  const handleReview = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    if (id !== undefined) onReview(id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    if (id !== undefined) {
      onDelete(id);
      handleCloseMenu();
    }
  };

  const handleShowDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
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
      <TableCell align="left">{createdAt}</TableCell>
      <TableCell align="left">{user.name}</TableCell>
      <TableCell align="center">
        <StatusChip status={situacao} />
      </TableCell>
      <TableCell align="left">{formatNumberToBRL(valorTotal)}</TableCell>
      <TableCell align="center">
        {valorAprovado === null ? '-' : formatNumberToBRL(valorAprovado)}
      </TableCell>
      <TableCell align="center">
        {dataAvaliacaoProap === null ? '-' : dataAvaliacaoProap}
      </TableCell>
      <TableCell align="center">
        {numeroAta}
      </TableCell>
      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
          {/* Primary Actions - Always visible */}
          {userCanViewAllRequests && (
            <Tooltip title="Ver resumo da Solicitação">
              <IconButton
                size="small"
                color="primary"
                onClick={handleShowDetailsClick}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {(userCanReviewRequests || isCeapg) && (
            <Tooltip title="Revisar Solicitação">
              <IconButton size="small" color="success" onClick={handleReview}>
                <CheckCircle fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {/* More Actions Menu Button */}
          <Tooltip title="Mais ações">
            <IconButton
              size="small"
              onClick={handleOpenMenu}
              aria-label="mais ações"
              aria-controls={open ? 'row-actions-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <MoreVert fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Dropdown Menu */}
          <Menu
            id="row-actions-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleCloseMenu}
            MenuListProps={{
              'aria-labelledby': 'more-button',
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Secondary Actions - In Dropdown */}

            <MenuItem
              onClick={handleEdit}
              disabled={
                !(
                  (situacao == 0 && currentUserEmail === user.email) ||
                  userCanReviewRequests
                )
              }
            >
              <ListItemIcon>
                <ModeEditIcon fontSize="small" color="warning" />
              </ListItemIcon>
              <ListItemText>Editar</ListItemText>
            </MenuItem>

            {
              <MenuItem
                onClick={handleDelete}
                disabled={
                  !(
                    (situacao == 0 && currentUserEmail === user.email) ||
                    userCanReviewRequests
                  )
                }
              >
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Excluir</ListItemText>
              </MenuItem>
            }
          </Menu>
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default SolicitationTableRow;
