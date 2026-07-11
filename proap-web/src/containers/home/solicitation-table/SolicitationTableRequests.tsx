import {
  Typography,
  Box,
  Paper,
  InputAdornment,
  TextField,
  MenuItem,
  Select,
  FormControl,
  SelectChangeEvent,
  alpha,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Pagination from '@mui/material/Pagination';

import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import LayersIcon from '@mui/icons-material/Layers'; 

import {
  AssistanceRequestPropToSort,
  getAssistanceRequests,
  removeAssistanceRequestById,
} from '../../../services/assistanceRequestService';

import {
  getExtraAssistanceRequests,
  deleteExtraAssistanceRequest,
} from '../../../services/extraAssistanceRequestService';

import { IRootState, useAppDispatch } from '../../../store';
import { useAuth } from '../../../hooks';
import usePrevious from '../../../helpers/usePrevious';
import useHasPermission from '../../../hooks/auth/useHasPermission';
import SolicitationDetailsDialog, {
  SolicitationDetailsDialogProps,
} from '../request-dialog/SolicitationDetailsDialog';
import { useTableSort, useViewModePreference } from '../../../hooks';
import {
  SolicitationTableView,
  SolicitationGridView,
  StatusChip,
} from './components';
import { ConfirmationDialog } from '../../../components/dialogs';

const parseDateString = (dateString?: string): number => {
  if (!dateString) return 0;

  const nativeTime = new Date(dateString).getTime();
  if (!isNaN(nativeTime) && dateString.includes('-')) {
    return nativeTime;
  }

  const [datePart, timePart] = dateString.split(' ');

  if (!datePart || !datePart.includes('/')) {
    return 0; 
  }

  const [day, month, year] = datePart.split('/');
  
  let hours = 0, minutes = 0, seconds = 0;
  if (timePart) {
    const timeParts = timePart.split(':');
    hours = Number(timeParts[0]) || 0;
    minutes = Number(timeParts[1]) || 0;
    seconds = Number(timeParts[2]) || 0; 
  }

  const finalDate = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    hours,
    minutes,
    seconds
  ).getTime();

  return isNaN(finalDate) ? 0 : finalDate;
};

export default function SolicitationTableRequests() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const userCanViewAllRequests = useHasPermission('VIEW_ALL_REQUESTS');
  const isCeapg = useHasPermission('CEAPG_ROLE');
  const userCanReviewRequests = useHasPermission('APPROVE_REQUEST');
  const currentUser = useAuth();

  const [viewMode, setViewMode] = useViewModePreference(currentUser.email);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  
  const [typeFilter, setTypeFilter] = useState<string>('');

  const statusOptions = [
    { value: 0, text: 'Pendente' },
    { value: 1, text: 'Aprovada' },
    { value: 2, text: 'Não aprovada' },
  ];

  const { selectedPropToSortTable, getSelectedProp, handleClickSortTable } =
    useTableSort('createdAt', false);

  const [numberPagesAssistance, setNumberPagesAssistance] = useState(1);
  const prevNumberPagesAssistance = usePrevious(numberPagesAssistance);
  const [size, setSize] = useState(50);
  const [currentPageAssistance, setCurrentPageAssistance] = useState(0);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [solicitationToDelete, setSolicitationToDelete] = useState<{ id: number; tipo: string } | null>(null);

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [detailsDialogData, setDetailsDialogData] = useState<SolicitationDetailsDialogProps>({
    nomeSolicitante: '',
    solicitanteDocente: false,
    valorTotal: 0,
    variacaoCambial: 0,
    valorDiarias: 0,
    nomeEvento: '',
    tituloPublicacao: '',
    isDolar: false,
    qualisEvento: '',
    cidade: '',
    pais: '',
    dataInicio: '',
    dataFim: '',
    situacao: 0,
    observacoes: '',
  });

  const { requests: apoioRequests, extraRequests } = useSelector(
    (state: IRootState) => state.assistanceRequestSlice
  );

  const updateAssistanceRequestList = useCallback(
    (sortBy: AssistanceRequestPropToSort, ascending: boolean, size: number, page: number) => {
      dispatch(getAssistanceRequests(sortBy, ascending, page, size)).then((reqApoio: any) => {
        const totalApoio = reqApoio?.payload?.total || 0;
        
        dispatch((getExtraAssistanceRequests as any)(sortBy, ascending, page, size)).then((reqExtra: any) => {
          const totalExtra = reqExtra?.payload?.total || 0;
          setNumberPagesAssistance(Math.trunc((totalApoio + totalExtra) / size) + 1);
        });
      });
    },
    [dispatch]
  );

  const updateAssistanceRequestListWithCurrentParameters = () => {
    updateAssistanceRequestList(
      getSelectedProp(),
      selectedPropToSortTable[getSelectedProp()] as boolean,
      size,
      currentPageAssistance
    );
  };

  const handleStatusFilterChange = (event: SelectChangeEvent<string | number>) => {
    const value = event.target.value;
    setStatusFilter(value === '' ? null : Number(value));
  };

  const getStatusAlphaColor = (status: number | null) => {
    if (status === 1) return alpha('#4caf50', 0.05);
    if (status === 2) return alpha('#f44336', 0.05);
    if (status === 0) return alpha('#ff9800', 0.05);
    return 'transparent';
  };

  useEffect(() => {
    if (prevNumberPagesAssistance && prevNumberPagesAssistance > numberPagesAssistance && currentPageAssistance >= numberPagesAssistance)
      setCurrentPageAssistance(numberPagesAssistance - 1);
  }, [numberPagesAssistance, prevNumberPagesAssistance, currentPageAssistance]);

  useEffect(() => {
    updateAssistanceRequestListWithCurrentParameters();
  }, [currentPageAssistance, size, selectedPropToSortTable]);

  const combinedRequests = useMemo(() => {
    const assist = (apoioRequests?.list || []).map((r: any) => ({
      ...r,
      tipoSolicitacao: 'Apoio',
    }));

    const extra = (extraRequests?.list || []).map((r: any) => ({
      ...r,
      tipoSolicitacao: 'Extra',
      valorTotal: r.valorSolicitado || r.valorTotal,
      tituloPublicacao: r.titulo || r.tituloPublicacao,
      nomeEvento: r.itemSolicitado || r.nomeEvento,
    }));

    return [...assist, ...extra].sort((a, b) => {
      const dateA = parseDateString(a.createdAt);
      const dateB = parseDateString(b.createdAt);
      return dateB - dateA;
    });
  }, [apoioRequests, extraRequests]);

  const filteredRequests = combinedRequests.filter((request) => {
    return (
      (!searchQuery ||
        request.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.tituloPublicacao?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.nomeEvento?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === null || request.situacao === statusFilter) &&
      (typeFilter === '' || request.tipoSolicitacao === typeFilter)
    );
  });

  const menuProps = {
    PaperProps: {
      sx: {
        borderRadius: '4px',
        marginTop: '4px',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        '& .MuiList-root': { padding: '4px' },
        '& .MuiMenuItem-root': {
          borderRadius: '2px',
          minHeight: '48px',
          padding: '12px 16px',
          transition: 'background-color 0.2s',
          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.12)' },
          },
        },
      },
    },
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" component="h2" fontWeight="bold" color="primary">
            Solicitações PROAP
          </Typography>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, mode) => mode && setViewMode(mode)}
            size="small"
          >
            <ToggleButton value="table"><Tooltip title="Tabela"><ViewListIcon /></Tooltip></ToggleButton>
            <ToggleButton value="grid"><Tooltip title="Cards"><ViewModuleIcon /></Tooltip></ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, alignItems: 'center', width: '100%', mb: 0 }}>
          <FormControl sx={{ flexGrow: 1 }} size="small">
            <TextField
              margin="none"
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Buscar por solicitante, evento ou publicação..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { height: 47, backgroundColor: 'white' } }}
            />
          </FormControl>

          <FormControl sx={{ minWidth: isMobile ? '100%' : '170px' }} size="small">
            <Select
              displayEmpty
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              MenuProps={menuProps}
              sx={{ height: 47, backgroundColor: 'white' }}
            >
              <MenuItem value="" sx={{ color: 'gray' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, color: 'text.secondary' }}>
                  <LayersIcon fontSize="small" />
                  Todos os tipos
                </Box>
              </MenuItem>
              
              <MenuItem value="Apoio" sx={{ display: 'flex', justifyContent: 'center', fontWeight: 500 }}>
                Publicação
              </MenuItem>
              <MenuItem value="Extra" sx={{ display: 'flex', justifyContent: 'center', fontWeight: 500 }}>
                Demanda Extra
              </MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: isMobile ? '100%' : '220px' }} size="small">
            <Select
              displayEmpty
              value={statusFilter ?? ''}
              onChange={handleStatusFilterChange}
              MenuProps={menuProps}
              sx={{
                height: 47,
                backgroundColor: getStatusAlphaColor(statusFilter),
                '& .MuiSelect-select': {
                  height: '47px !important',
                  padding: '0 !important',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'start',
                  boxSizing: 'border-box',
                },
              }}
              renderValue={(selected) => {
                if (String(selected) === '') {
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, color: 'text.secondary' }}>
                      <FilterAltIcon fontSize="small" />
                      <Typography variant="body2">Filtrar</Typography>
                    </Box>
                  );
                }
                return (
                  <StatusChip
                    status={Number(selected)}
                    sx={{
                      width: '100%',
                      height: '47px !important',
                      borderRadius: 0,
                      border: 'none',
                      backgroundColor: 'transparent',
                      '& .MuiChip-label': { width: '100%', textAlign: 'center' }
                    }}
                  />
                );
              }}
            >
              <MenuItem value="" sx={{ color: 'default', py: 1.5, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, fontWeight: 500, borderColor: 'divider', mb: 1 }}>
                <FilterAltIcon fontSize="small" />
                Limpar filtro
              </MenuItem>

              {statusOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  <StatusChip status={opt.value} sx={{ width: '100%', pointerEvents: 'none' }} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {viewMode === 'table' ? (
        <SolicitationTableView
          filteredRequests={filteredRequests}
          searchQuery={searchQuery}
          selectedPropToSortTable={selectedPropToSortTable}
          handleClickSortTable={handleClickSortTable}
          currentUserEmail={currentUser.email}
          userCanViewAllRequests={userCanViewAllRequests}
          userCanReviewRequests={userCanReviewRequests}
          isCeapg={isCeapg}
          onEdit={(id, tipo) => navigate(tipo === 'Extra' ? `/extra-solicitation/edit/${id}` : `/solicitation/edit/${id}`)}
          onReview={(id, tipo) => navigate(tipo === 'Extra' ? `/extra-solicitation/review/${id}` : `/solicitation/review/${id}`)}
          onView={(id, tipo) => navigate(tipo === 'Extra' ? `/extra-solicitation/view/${id}` : `/solicitation/view/${id}`)}
          onDelete={(id, tipo) => { setSolicitationToDelete({ id, tipo }); setOpenDeleteConfirmation(true); }}
          onClone={(id, tipo) => navigate(tipo === 'Extra' ? `/extra-solicitation/create?cloneFrom=${id}` : `/solicitation/create?cloneFrom=${id}`)}
          onShowDetails={(props) => { setDetailsDialogData(props); setOpenDetailsDialog(true); }}
        />
      ) : (
        <SolicitationGridView
          filteredRequests={filteredRequests}
          searchQuery={searchQuery}
          currentUserEmail={currentUser.email}
          userCanViewAllRequests={userCanViewAllRequests}
          userCanReviewRequests={userCanReviewRequests}
          isCeapg={isCeapg}
          onEdit={(id, tipo) => navigate(tipo === 'Extra' ? `/extra-solicitation/edit/${id}` : `/solicitation/edit/${id}`)}
          onReview={(id, tipo) => navigate(tipo === 'Extra' ? `/extra-solicitation/review/${id}` : `/solicitation/review/${id}`)}
          onView={(id, tipo) => navigate(tipo === 'Extra' ? `/extra-solicitation/view/${id}` : `/solicitation/view/${id}`)}
          onDelete={(id, tipo) => { setSolicitationToDelete({ id, tipo }); setOpenDeleteConfirmation(true); }}
          onClone={(id, tipo) => navigate(tipo === 'Extra' ? `/extra-solicitation/create?cloneFrom=${id}` : `/solicitation/create?cloneFrom=${id}`)}
          onShowDetails={(props) => { setDetailsDialogData(props); setOpenDetailsDialog(true); }}
        />
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Itens por página:
          </Typography>
          <Select
            value={size}
            onChange={(e) => setSize(e.target.value as number)}
            size="small"
            sx={{ minWidth: 70 }}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </Box>

        <Pagination
          count={numberPagesAssistance}
          page={currentPageAssistance + 1}
          onChange={(_, v) => setCurrentPageAssistance(v - 1)}
          color="primary"
          showFirstButton
          showLastButton
          size={isMobile ? 'small' : 'medium'}
        />

        <Typography variant="body2" color="text.secondary">
          Total: <strong>{filteredRequests.length}</strong> solicitações visíveis
        </Typography>
      </Box>

      <ConfirmationDialog
        open={openDeleteConfirmation}
        onClose={() => setOpenDeleteConfirmation(false)}
        onConfirm={() => {
          if (solicitationToDelete) {
            const { id, tipo } = solicitationToDelete;
            const removeFunction = tipo === 'Extra' ? deleteExtraAssistanceRequest : removeAssistanceRequestById;
            
            removeFunction(id)
              .then(() => {
                updateAssistanceRequestListWithCurrentParameters();
                toast.success('Solicitação removida com sucesso');
              })
              .catch(() => toast.error('Erro ao remover'))
              .finally(() => setOpenDeleteConfirmation(false));
          }
        }}
        title="Remoção de solicitação"
        message={`Deseja realmente remover esta solicitação de ${solicitationToDelete?.tipo === 'Extra' ? 'Demanda Extra' : 'Apoio'}?`}
      />

      <SolicitationDetailsDialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        solicitationData={detailsDialogData}
      />
    </Paper>
  );
}