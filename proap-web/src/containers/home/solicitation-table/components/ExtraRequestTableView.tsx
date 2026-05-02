import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  IconButton,
  alpha,
  Tooltip,
} from '@mui/material';
import { StatusChip } from './index';
import { formatNumberToBRL } from '../../../../helpers/formatter';
import { Visibility, CheckCircle } from '@mui/icons-material';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ExtraRequestPropToSort } from '../../../../services/extraAssistanceRequestService';

interface TableCellHeaderProps {
  text: string;
  sortBy: ExtraRequestPropToSort;
  selectedPropToSortTable: Record<string, boolean>;
  handleClickSortTable: (prop: ExtraRequestPropToSort) => void;
}

const TableCellHeader: React.FC<TableCellHeaderProps> = ({
  text,
  sortBy,
  selectedPropToSortTable,
  handleClickSortTable,
}) => {
  return (
    <div
      onClick={() => handleClickSortTable(sortBy)}
      style={{ userSelect: 'none', cursor: 'pointer' }}
    >
      {text}
      {selectedPropToSortTable[sortBy] !== undefined && (
        <span style={{ marginLeft: '4px' }}>
          {selectedPropToSortTable[sortBy] ? '▲' : '▼'}
        </span>
      )}
    </div>
  );
};

interface ExtraRequestTableViewProps {
  extraRequests: any[];
  currentUserEmail: string;
  userCanViewAllRequests: boolean;
  userCanReviewRequests: boolean;
  isCeapg: boolean;
  selectedPropToSortTable: Record<string, boolean>;
  handleClickSortTable: (prop: ExtraRequestPropToSort) => void;
  onEdit: (id: number) => void;
  onReview: (id: number) => void;
  onView: (id: number) => void;
  onDelete: (id: number) => void;
  onShowText: (text: string) => void;
}

const ExtraRequestTableView: React.FC<ExtraRequestTableViewProps> = ({
  extraRequests,
  currentUserEmail,
  userCanViewAllRequests,
  userCanReviewRequests,
  isCeapg,
  selectedPropToSortTable,
  handleClickSortTable,
  onEdit,
  onReview,
  onView,
  onDelete,
  onShowText,
}) => {
  const formatTableDate = (dateString: string | null) => {
    if (!dateString) return '-';
    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateString;
  };
  
  return (
    <TableContainer
      sx={{
        maxHeight: '500px',
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        mb: 2,
      }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow
            sx={{
              '& th': {
                fontWeight: 'bold',
                backgroundColor: 'grey.50',
              },
            }}
          >
            <TableCell align="center">
              <TableCellHeader
                text="Data de solicitação"
                sortBy="createdAt"
                selectedPropToSortTable={selectedPropToSortTable}
                handleClickSortTable={handleClickSortTable}
              />
            </TableCell>
            <TableCell align="center">
              <TableCellHeader
                text="Solicitante"
                sortBy="user.name"
                selectedPropToSortTable={selectedPropToSortTable}
                handleClickSortTable={handleClickSortTable}
              />
            </TableCell>
            <TableCell align="center">
              <TableCellHeader
                text="Status"
                sortBy="situacao"
                selectedPropToSortTable={selectedPropToSortTable}
                handleClickSortTable={handleClickSortTable}
              />
            </TableCell>
            <TableCell align="center">
              <TableCellHeader
                text="Valor solicitado"
                sortBy="valorSolicitado"
                selectedPropToSortTable={selectedPropToSortTable}
                handleClickSortTable={handleClickSortTable}
              />
            </TableCell>
            <TableCell align="center">
              <TableCellHeader
                text="Valor aprovado"
                sortBy="valorAprovado"
                selectedPropToSortTable={selectedPropToSortTable}
                handleClickSortTable={handleClickSortTable}
              />
            </TableCell>
            <TableCell align="center">
              <TableCellHeader
                text="Data da avaliação"
                sortBy="dataAvaliacaoProap"
                selectedPropToSortTable={selectedPropToSortTable}
                handleClickSortTable={handleClickSortTable}
              />
            </TableCell>

              <TableCell align="center">
              <TableCellHeader
                text="ATA"
                sortBy="numeroAta"
                selectedPropToSortTable={selectedPropToSortTable}
                handleClickSortTable={handleClickSortTable}
            />
            </TableCell>

            <TableCell align="center">Ações</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {!extraRequests.length && (
            <TableRow>
              <TableCell colSpan={7}>
                <Typography
                  align="center"
                  color="text.secondary"
                  sx={{ py: 4 }}
                >
                  Nenhuma solicitação de demanda extra encontrada.
                </Typography>
              </TableCell>
            </TableRow>
          )}
          {extraRequests.length > 0 &&
            extraRequests.map((request) => (
              <TableRow
                key={request.id}
                onClick={() => onView(request.id)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <TableCell align="center">{request.createdAt}</TableCell>
                <TableCell align="center">{request.user.name}</TableCell>
                <TableCell align="center">
                  <StatusChip status={request.situacao} />
                </TableCell>
                <TableCell align="center">
                  {request.valorSolicitado != null
                    ? formatNumberToBRL(request.valorSolicitado)
                    : '-'}
                </TableCell>
                <TableCell align="center">
                  {request.valorAprovado === null
                    ? '-'
                    : formatNumberToBRL(request.valorAprovado)}
                </TableCell>
                <TableCell align="center">
                  {request.dataAvaliacaoProap === null
                    ? '-'
                    : request.dataAvaliacaoProap}
                </TableCell>
                <TableCell align="center">
                  {request.numeroAta || '-'}
                </TableCell>
                <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}
                  >
                    {userCanViewAllRequests && (
                      <Tooltip title="Ver texto da solicitação">
                        <IconButton
                          size="small"
                          onClick={() => onShowText(request.automaticDecText)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {(userCanReviewRequests || isCeapg) && (
                      <Tooltip title="Revisar solicitação">
                        <IconButton
                          size="small"
                          onClick={() => onReview(request.id)}
                        >
                          <CheckCircle fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    <IconButton
                      size="small"
                      onClick={() => onEdit(request.id)}
                      disabled={
                        !(
                          (request.situacao == 0 &&
                            currentUserEmail === request.user.email) ||
                          userCanReviewRequests
                        )
                      }
                    >
                      <ModeEditIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => onDelete(request.id)}
                      disabled={
                        !(
                          (request.situacao == 0 &&
                            currentUserEmail === request.user.email) ||
                          userCanReviewRequests
                        )
                      }
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ExtraRequestTableView;
