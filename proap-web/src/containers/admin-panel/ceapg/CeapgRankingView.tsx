import React, { useState, useEffect } from 'react';
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  CircularProgress,
  Chip,
  Paper
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { formatNumberToBRL } from '../../../helpers/formatter';
import { getApprovedRanking, RankingUserDTO } from '../../../services/ceapgService';

type Order = 'asc' | 'desc';
type ChipColor = "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";

interface TableCellHeaderProps {
  text: string;
  sortBy: string;
  selectedPropToSortTable: Record<string, boolean>;
  handleClickSortTable: (prop: string) => void;
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
          flexDirection: align === 'center' ? 'row' : align === 'right' ? 'row-reverse' : 'inherit',
          '& .MuiTableSortLabel-icon': {
            marginLeft: align === 'center' ? '4px' : align === 'left' ? '4px' : 'inherit',
            marginRight: align === 'right' ? '4px' : 'inherit',
          }
        }}
      >
        {text}
      </TableSortLabel>
    </TableCell>
  );
};

const CeapgRankingView = () => {
  const [filter, setFilter] = useState<'todos' | 'DISCENTE' | 'DOCENTE'>('todos');
  const [rankingData, setRankingData] = useState<RankingUserDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [selectedPropToSortTable, setSelectedPropToSortTable] = useState<Record<string, boolean>>({
    totalAprovado: false 
  });

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      try {
        const data = await getApprovedRanking();
        setRankingData(data);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar ranking:", error);
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  const getProfileChipColor = (profileName: string): ChipColor => {
    const profile = (profileName || '').toLowerCase();
    if (profile.includes('admin')) return 'success';
    if (profile.includes('ceapg')) return 'warning';
    if (profile.includes('funcionario')) return 'warning';
    if (profile.includes('docente')) return 'primary';
    if (profile.includes('discente')) return 'info';
    return 'error';
  };

  const handleFilterChange = (
    event: React.MouseEvent<HTMLElement>,
    newFilter: 'todos' | 'DISCENTE' | 'DOCENTE'
  ) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const handleClickSortTable = (property: string) => {
    const isAsc = selectedPropToSortTable[property] === true;
    setSelectedPropToSortTable({
      [property]: !isAsc
    });
  };

  const filteredData = rankingData.filter((user) => {
    if (filter === 'todos') return true;
    return user.profileName?.toUpperCase() === filter; 
  });

  const rankedData = [...filteredData]
    .sort((a, b) => {
      const totalA = (a.aproveNormalAmount || 0) + (a.aprovedExtraAmount || 0);
      const totalB = (b.aproveNormalAmount || 0) + (b.aprovedExtraAmount || 0);
      return totalB - totalA;
    })
    .map((user, index) => ({
      ...user,
      absoluteRank: index + 1,
      totalAprovado: (user.aproveNormalAmount || 0) + (user.aprovedExtraAmount || 0)
    }));

  const currentSortKey = Object.keys(selectedPropToSortTable)[0] || 'totalAprovado';
  const isAscending = selectedPropToSortTable[currentSortKey] === true;

  const sortedData = [...rankedData].sort((a, b) => {
    let valueA: any;
    let valueB: any;

    switch (currentSortKey) {
      case 'absoluteRank':
        valueA = a.absoluteRank;
        valueB = b.absoluteRank;
        break;
      case 'name':
        valueA = a.name?.toLowerCase() || '';
        valueB = b.name?.toLowerCase() || '';
        break;
      case 'profileName':
        valueA = a.profileName?.toLowerCase() || '';
        valueB = b.profileName?.toLowerCase() || '';
        break;
      case 'requestedNormalAmount':
        valueA = a.requestedNormalAmount || 0;
        valueB = b.requestedNormalAmount || 0;
        break;
      case 'aproveNormalAmount':
        valueA = a.aproveNormalAmount || 0;
        valueB = b.aproveNormalAmount || 0;
        break;
      case 'requestedExtraAmount':
        valueA = a.requestedExtraAmount || 0;
        valueB = b.requestedExtraAmount || 0;
        break;
      case 'aprovedExtraAmount':
        valueA = a.aprovedExtraAmount || 0;
        valueB = b.aprovedExtraAmount || 0;
        break;
      case 'totalAprovado':
      default:
        valueA = a.totalAprovado;
        valueB = b.totalAprovado;
        break;
    }

    if (valueA < valueB) {
      return isAscending ? -1 : 1;
    }
    if (valueA > valueB) {
      return isAscending ? 1 : -1;
    }
    return 0;
  });

  const getRankPosition = (rank: number) => {
    return (
      <Typography variant="body2" sx={{ width: 24, textAlign: 'center', mr: 1, fontWeight: 'bold', color: 'text.secondary' }}>
        {rank}º
      </Typography>
    );
  };

  const renderFormattedMoney = (value: number, isBoldNumber: boolean = false, isBoldSymbol: boolean = false) => {
    const formatted = formatNumberToBRL(value || 0);
    const numberOnly = formatted.replace(/^R\$\s?/, '');
    return (
      <Typography variant="body2" color="text.primary">
        <Box component="span" sx={{ fontWeight: isBoldSymbol ? 'bold' : 'normal', mr: 0.5 }}>R$</Box>
        <Box component="span" sx={{ fontWeight: isBoldNumber ? 'bold' : 'normal' }}>
          {numberOnly}
        </Box>
      </Typography>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', mb: 3, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          Demonstrativo de Recursos Concedidos
        </Typography>
        
        <ToggleButtonGroup
          color="primary"
          value={filter}
          exclusive
          onChange={handleFilterChange}
          size="small"
          sx={{ bgcolor: 'background.paper' }}
        >
          <ToggleButton value="todos" sx={{ px: 3, textTransform: 'none', fontWeight: 'bold' }}>Todos</ToggleButton>
          <ToggleButton value="DISCENTE" sx={{ px: 3, textTransform: 'none', fontWeight: 'bold' }}>Discentes</ToggleButton>
          <ToggleButton value="DOCENTE" sx={{ px: 3, textTransform: 'none', fontWeight: 'bold' }}>Docentes</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
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
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCellHeader text="Posição" sortBy="absoluteRank" align="left" selectedPropToSortTable={selectedPropToSortTable} handleClickSortTable={handleClickSortTable} />
                <TableCellHeader text="Solicitante" sortBy="name" align="left" selectedPropToSortTable={selectedPropToSortTable} handleClickSortTable={handleClickSortTable} />
                <TableCellHeader text="Vínculo" sortBy="profileName" align="left" selectedPropToSortTable={selectedPropToSortTable} handleClickSortTable={handleClickSortTable} />
                <TableCellHeader text="Normal Solicitado" sortBy="requestedNormalAmount" align="center" selectedPropToSortTable={selectedPropToSortTable} handleClickSortTable={handleClickSortTable} />
                <TableCellHeader text="Normal Aprovado" sortBy="aproveNormalAmount" align="center" selectedPropToSortTable={selectedPropToSortTable} handleClickSortTable={handleClickSortTable} />
                <TableCellHeader text="Extra Solicitado" sortBy="requestedExtraAmount" align="center" selectedPropToSortTable={selectedPropToSortTable} handleClickSortTable={handleClickSortTable} />
                <TableCellHeader text="Extra Aprovado" sortBy="aprovedExtraAmount" align="center" selectedPropToSortTable={selectedPropToSortTable} handleClickSortTable={handleClickSortTable} />
                <TableCellHeader text="Total Aprovado" sortBy="totalAprovado" align="center" selectedPropToSortTable={selectedPropToSortTable} handleClickSortTable={handleClickSortTable} />
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.length > 0 ? (
                sortedData.map((user) => {
                  return (
                    <TableRow key={user.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getRankPosition(user.absoluteRank)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {user.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.profileName ? user.profileName.charAt(0).toUpperCase() + user.profileName.slice(1) : ''} 
                          size="small" 
                          color={getProfileChipColor(user.profileName)}
                          sx={{ fontWeight: 'medium', color: 'white', fontSize: '0.75rem' }}
                        />
                      </TableCell>
                      
                      <TableCell align="center">
                        <Typography variant="body2">
                          {formatNumberToBRL(user.requestedNormalAmount || 0)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="center">
                        {renderFormattedMoney(user.aproveNormalAmount)}
                      </TableCell>

                      <TableCell align="center">
                        <Typography variant="body2">
                          {formatNumberToBRL(user.requestedExtraAmount || 0)}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        {renderFormattedMoney(user.aprovedExtraAmount)}
                      </TableCell>

                      <TableCell align="center">
                        {renderFormattedMoney(user.totalAprovado, true, true)}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Nenhum solicitante encontrado para este filtro.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default CeapgRankingView;