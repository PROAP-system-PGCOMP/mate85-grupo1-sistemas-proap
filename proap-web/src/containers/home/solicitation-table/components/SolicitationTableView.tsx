import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { SolicitationTableRow } from './index';
import { SolicitationDetailsDialogProps } from '../../request-dialog/SolicitationDetailsDialog';
import { AssistanceRequestPropToSort } from '../../../../services/assistanceRequestService';

// TableCellHeader com reserva de espaço para evitar deslocamento horizontal
interface TableCellHeaderProps {
  text: string;
  sortBy: AssistanceRequestPropToSort;
  selectedPropToSortTable: Record<string, boolean>;
  handleClickSortTable: (prop: AssistanceRequestPropToSort) => void;
  align?: 'left' | 'center';
}

const TableCellHeader: React.FC<TableCellHeaderProps> = ({
  text,
  sortBy,
  selectedPropToSortTable,
  handleClickSortTable,
  align = 'left',
}) => {
  const isSorted = selectedPropToSortTable[sortBy] !== undefined;

  return (
    <div
      onClick={() => handleClickSortTable(sortBy)}
      style={{
        userSelect: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        width: '100%',
      }}
    >
      <span>{text}</span>
      <span
        style={{
          marginLeft: '4px',
          fontSize: '0.8rem',
          display: 'inline-block',
          width: '12px',
          textAlign: 'center',
          visibility: isSorted ? 'visible' : 'hidden',
        }}
      >
        {selectedPropToSortTable[sortBy] ? '▲' : '▼'}
      </span>
    </div>
  );
};

interface SolicitationTableViewProps {
  filteredRequests: any[];
  searchQuery: string;
  selectedPropToSortTable: Record<string, boolean>;
  handleClickSortTable: (prop: AssistanceRequestPropToSort) => void;
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

const SolicitationTableView: React.FC<SolicitationTableViewProps> = ({
  filteredRequests,
  searchQuery,
  selectedPropToSortTable,
  handleClickSortTable,
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
                whiteSpace: 'nowrap',
              },
            }}
          >
            <TableCell align="left">
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
                align="center"
                selectedPropToSortTable={selectedPropToSortTable}
                handleClickSortTable={handleClickSortTable}
              />
            </TableCell>
            <TableCell align="center">
              <TableCellHeader
                text="Valor solicitado"
                sortBy="valorTotal"
                align="center"
                selectedPropToSortTable={selectedPropToSortTable}
                handleClickSortTable={handleClickSortTable}
              />
            </TableCell>

            <TableCell align="center">
              <TableCellHeader
                text="Valor aprovado"
                sortBy="valorAprovado"
                align="center"
                selectedPropToSortTable={selectedPropToSortTable}
                handleClickSortTable={handleClickSortTable}
              />
            </TableCell>

            <TableCell align="center">
              <TableCellHeader
                text="Data da avaliação"
                sortBy="dataAvaliacaoProap"
                align="center"
                selectedPropToSortTable={selectedPropToSortTable}
                handleClickSortTable={handleClickSortTable}
              />
            </TableCell>

            <TableCell align="left">
              <TableCellHeader
                text="ATA"
                sortBy="numeroAta"
                align="left"
                selectedPropToSortTable={selectedPropToSortTable}
                handleClickSortTable={handleClickSortTable}
            />
            </TableCell>

            <TableCell align="center">Ações</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {!filteredRequests.length && (
            <TableRow>
              <TableCell colSpan={8}>
                <Typography
                  align="center"
                  color="text.secondary"
                  sx={{ py: 4 }}
                >
                  {searchQuery
                    ? 'Nenhuma solicitação encontrada para a busca realizada.'
                    : 'Nenhuma solicitação de auxílio encontrada.'}
                </Typography>
              </TableCell>
            </TableRow>
          )}
          {filteredRequests.length > 0 &&
            filteredRequests.map((solicitation) => (
              <SolicitationTableRow
                key={solicitation.id}
                {...solicitation}
                currentUserEmail={currentUserEmail}
                userCanViewAllRequests={userCanViewAllRequests}
                userCanReviewRequests={userCanReviewRequests}
                isCeapg={isCeapg}
                onEdit={onEdit}
                onReview={onReview}
                onView={onView}
                onDelete={onDelete}
                onShowDetails={onShowDetails}
              />
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SolicitationTableView;