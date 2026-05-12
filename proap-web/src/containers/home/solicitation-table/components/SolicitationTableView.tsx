import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel, // Importado da lógica original
  Typography,
  Paper,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material'; // Ícone solicitado
import { SolicitationTableRow } from './index';
import { SolicitationDetailsDialogProps } from '../../request-dialog/SolicitationDetailsDialog';
import { AssistanceRequestPropToSort } from '../../../../services/assistanceRequestService';

// Componente de Header adaptado com a lógica do TableSortLabel
interface TableCellHeaderProps {
  text: string;
  sortBy: AssistanceRequestPropToSort;
  selectedPropToSortTable: Record<string, boolean>;
  handleClickSortTable: (prop: AssistanceRequestPropToSort) => void;
  align?: 'left' | 'center' | 'right';
}

const TableCellHeader: React.FC<TableCellHeaderProps> = ({
  text,
  sortBy,
  selectedPropToSortTable,
  handleClickSortTable,
  align = 'left',
}) => {
  // Na sua lógica original, se a chave existe no Record, ela está sendo ordenada
  const isSorted = selectedPropToSortTable[sortBy] !== undefined;
  // Se true = asc, se false = desc (baseado no seu span original)
  const orderDirection = selectedPropToSortTable[sortBy] ? 'asc' : 'desc';

  return (
    <TableCell 
      align={align}
      sortDirection={isSorted ? orderDirection : false}
      sx={{ 
        fontWeight: 'bold', 
        backgroundColor: 'grey.50', 
        whiteSpace: 'nowrap' 
      }}
    >
      <TableSortLabel
        active={isSorted}
        direction={isSorted ? orderDirection : 'asc'}
        onClick={() => handleClickSortTable(sortBy)}
        IconComponent={ExpandMore}
        sx={{
          flexDirection: align === 'center' ? 'row' : 'inherit',
          '& .MuiTableSortLabel-icon': {
            // Garante que o ícone não desloque o texto se não estiver centralizado
            marginLeft: align === 'center' ? '4px' : 'inherit',
          }
        }}
      >
        {text}
      </TableSortLabel>
    </TableCell>
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
      component={Paper}
      sx={{
        maxHeight: '500px',
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        mb: 2,
      }}
    >
      <Table stickyHeader aria-label="solicitations table">
        <TableHead>
          <TableRow>
            <TableCellHeader
              text="Data de solicitação"
              sortBy="createdAt"
              selectedPropToSortTable={selectedPropToSortTable}
              handleClickSortTable={handleClickSortTable}
            />
            <TableCellHeader
              text="Solicitante"
              sortBy="user.name"
              align="center"
              selectedPropToSortTable={selectedPropToSortTable}
              handleClickSortTable={handleClickSortTable}
            />
            <TableCellHeader
              text="Status"
              sortBy="situacao"
              align="center"
              selectedPropToSortTable={selectedPropToSortTable}
              handleClickSortTable={handleClickSortTable}
            />
            <TableCellHeader
              text="Valor solicitado"
              sortBy="valorTotal"
              align="center"
              selectedPropToSortTable={selectedPropToSortTable}
              handleClickSortTable={handleClickSortTable}
            />
            <TableCellHeader
              text="Valor aprovado"
              sortBy="valorAprovado"
              align="center"
              selectedPropToSortTable={selectedPropToSortTable}
              handleClickSortTable={handleClickSortTable}
            />
            <TableCellHeader
              text="Data da avaliação"
              sortBy="dataAvaliacaoProap"
              align="center"
              selectedPropToSortTable={selectedPropToSortTable}
              handleClickSortTable={handleClickSortTable}
            />
            <TableCellHeader
              text="ATA"
              sortBy="numeroAta"
              align="left"
              selectedPropToSortTable={selectedPropToSortTable}
              handleClickSortTable={handleClickSortTable}
            />
            <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}>
              Ações
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {!filteredRequests.length ? (
            <TableRow>
              <TableCell colSpan={8}>
                <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                  {searchQuery
                    ? 'Nenhuma solicitação encontrada para a busca realizada.'
                    : 'Nenhuma solicitação de auxílio encontrada.'}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
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
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SolicitationTableView;