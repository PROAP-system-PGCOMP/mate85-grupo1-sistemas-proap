import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Paper,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { SolicitationTableRow } from './index';
import { SolicitationDetailsDialogProps } from '../../request-dialog/SolicitationDetailsDialog';

interface TableCellHeaderProps {
  text: string;
  sortBy: any; 
  selectedPropToSortTable: Record<string, boolean>;
  handleClickSortTable: (prop: any) => void;
  align?: 'left' | 'center' | 'right';
}

const TableCellHeader: React.FC<TableCellHeaderProps> = ({
  text,
  sortBy,
  selectedPropToSortTable,
  handleClickSortTable,
  align = 'left',
}) => {
  const isSorted = selectedPropToSortTable[sortBy] !== undefined;
  const orderDirection = selectedPropToSortTable[sortBy] ? 'asc' : 'desc';

  return (
    <TableCell
      align={align}
      sortDirection={isSorted ? orderDirection : false}
      sx={{
        fontWeight: 'bold',
        backgroundColor: 'grey.50',
        whiteSpace: 'nowrap',
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
            marginLeft: align === 'center' ? '4px' : 'inherit',
          },
        }}
      >
        {text}
      </TableSortLabel>
    </TableCell>
  );
};

interface ExtraRequestTableViewProps {
  extraRequests: any[];
  searchQuery: string;
  selectedPropToSortTable: Record<string, boolean>;
  handleClickSortTable: (prop: any) => void;
  currentUserEmail: string;
  userCanViewAllRequests: boolean;
  userCanReviewRequests: boolean;
  isCeapg: boolean;
  isExtraRequest?: boolean;
  onEdit: (id: number) => void;
  onReview: (id: number) => void;
  onView: (id: number) => void;
  onDelete: (id: number) => void;
  onShowDetails: (props: SolicitationDetailsDialogProps) => void;
}

const ExtraRequestTableView: React.FC<ExtraRequestTableViewProps> = ({
  extraRequests = [],
  searchQuery = '',
  selectedPropToSortTable = {},
  handleClickSortTable,
  currentUserEmail,
  userCanViewAllRequests,
  userCanReviewRequests,
  isCeapg,
  isExtraRequest = true,
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
        overflowX: 'auto',
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        mb: 2,
      }}
    >
      <Table aria-label="extra requests table">
        <TableHead>
          <TableRow>
            <TableCellHeader
              text="Data de solicitação"
              sortBy="createdAt"
              align="center"
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
              sortBy="valorSolicitado"
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
              align="center"
              selectedPropToSortTable={selectedPropToSortTable}
              handleClickSortTable={handleClickSortTable}
            />
            <TableCell 
              align="center" 
              sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}
            >
              Ações
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {extraRequests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8}>
                <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                  {searchQuery
                    ? 'Nenhuma solicitação encontrada para a busca realizada.'
                    : 'Nenhuma solicitação de demanda extra encontrada.'}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            extraRequests.map((solicitation) => (
              <SolicitationTableRow
                key={solicitation.id}
                {...solicitation}
                valorTotal={solicitation.valorSolicitado || solicitation.valorTotal}
                currentUserEmail={currentUserEmail}
                userCanViewAllRequests={userCanViewAllRequests}
                userCanReviewRequests={userCanReviewRequests}
                isCeapg={isCeapg}
                isExtraRequest={isExtraRequest}
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

export default ExtraRequestTableView;