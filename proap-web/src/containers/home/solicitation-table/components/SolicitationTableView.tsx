import React, { useState } from 'react'; // <-- Adicionado useState
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
import { AssistanceRequestPropToSort } from '../../../../services/assistanceRequestService';

import AtaTemplateDialog from '../../../home/request-dialog/AtaTemplateDialog';

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
  const isSorted = selectedPropToSortTable[sortBy] !== undefined;
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
  onEdit: (id: number, tipo: string) => void;
  onReview: (id: number, tipo: string) => void;
  onView: (id: number, tipo: string) => void;
  onDelete: (id: number, tipo: string) => void;
  onClone: (id: number, tipo: string) => void;
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
  onClone,
  onShowDetails,
}) => {
  

  const [isAtaDialogOpen, setIsAtaDialogOpen] = useState(false);
  const [ataDialogData, setAtaDialogData] = useState<any>(null);

  const handleOpenAtaDialog = (row: any) => {
    setAtaDialogData(row);
    setIsAtaDialogOpen(true);
  };

  return (
    <>
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
        <Table aria-label="solicitations table">
          <TableHead>
            {/* ... Todo o seu TableHead continua exatamente igual ... */}
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}>Tipo</TableCell>
              <TableCellHeader text="Data de solicitação" sortBy="createdAt" selectedPropToSortTable={selectedPropToSortTable} handleClickSortTable={handleClickSortTable} />
              <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}>Vínculo</TableCell>
              <TableCellHeader text="Solicitante" sortBy="user.name" align="center" selectedPropToSortTable={selectedPropToSortTable} handleClickSortTable={handleClickSortTable} />
              <TableCellHeader text="Status" sortBy="situacao" align="center" selectedPropToSortTable={selectedPropToSortTable} handleClickSortTable={handleClickSortTable} />
              <TableCellHeader text="Valor solicitado" sortBy="valorTotal" align="center" selectedPropToSortTable={selectedPropToSortTable} handleClickSortTable={handleClickSortTable} />
              <TableCellHeader text="Valor aprovado" sortBy="valorAprovado" align="center" selectedPropToSortTable={selectedPropToSortTable} handleClickSortTable={handleClickSortTable} />
              <TableCellHeader text="Data da avaliação" sortBy="dataAvaliacaoProap" align="center" selectedPropToSortTable={selectedPropToSortTable} handleClickSortTable={handleClickSortTable} />
              <TableCellHeader text="ATA" sortBy="numeroAta" align="left" selectedPropToSortTable={selectedPropToSortTable} handleClickSortTable={handleClickSortTable} />
              <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}>Ações</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {!filteredRequests.length ? (
              <TableRow>
                <TableCell colSpan={10}>
                  <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                    {searchQuery
                      ? 'Nenhuma solicitação encontrada para a busca realizada.'
                      : 'Nenhuma solicitação encontrada.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((solicitation) => (
                <SolicitationTableRow
                  key={`${solicitation.tipoSolicitacao}-${solicitation.id}`}
                  {...solicitation}
                  row={solicitation} 
                  currentUserEmail={currentUserEmail}
                  userCanViewAllRequests={userCanViewAllRequests}
                  userCanReviewRequests={userCanReviewRequests}
                  isCeapg={isCeapg}
                  onEdit={onEdit}
                  onReview={onReview}
                  onView={onView}
                  onDelete={onDelete}
                  onClone={onClone}
                  onShowDetails={onShowDetails}
                  onOpenAtaDialog={handleOpenAtaDialog} 
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* RENDERIZAÇÃO DO MODAL FORA DA TABELA */}
      {ataDialogData && (
        <AtaTemplateDialog
          open={isAtaDialogOpen}
          onClose={() => setIsAtaDialogOpen(false)}
          solicitationData={ataDialogData}
        />
      )}
    </>
  );
};

export default SolicitationTableView;