import {
  Typography,
  Box,
  Paper,
  InputAdornment,
  TextField,
  MenuItem,
  Select,
  FormControl,
  Chip,
  SelectChangeEvent,
  alpha,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Pagination from '@mui/material/Pagination';

// Icons
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ClearIcon from '@mui/icons-material/Clear';

import {
  AssistanceRequestPropToSort,
  getAssistanceRequests,
  removeAssistanceRequestById,
} from '../../../services/assistanceRequestService';
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
  const [solicitationToDelete, setSolicitationToDelete] = useState<number | null>(null);

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

  const { requests } = useSelector((state: IRootState) => state.assistanceRequestSlice);

  const updateAssistanceRequestList = useCallback(
    (sortBy: AssistanceRequestPropToSort, ascending: boolean, size: number, page: number) => {
      dispatch(getAssistanceRequests(sortBy, ascending, page, size)).then(
        (requests) => setNumberPagesAssistance(Math.trunc(requests.payload.total / size) + 1)
      );
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
    updateAssistanceRequestList(
      getSelectedProp(),
      selectedPropToSortTable[getSelectedProp()] as boolean,
      size,
      currentPageAssistance
    );
  }, [currentPageAssistance, size, selectedPropToSortTable, updateAssistanceRequestList]);

  const filteredRequests = requests.list.filter((request) =>
      (!searchQuery ||
        request.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.tituloPublicacao?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.nomeEvento?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === null || request.situacao === statusFilter)
  );

  const menuProps = {
    PaperProps: {
      sx: {
        borderRadius: '4px',
        marginTop: '4px',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        '& .MuiList-root': {
          padding: '4px', 
        },
        '& .MuiMenuItem-root': {
          borderRadius: '2px', 
          minHeight: '48px',   
          padding: '12px 16px', 
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.12)',
            },
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
            Solicitações de Apoio
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

        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row', 
          gap: 2, 
          alignItems: 'center', 
          width: '100%',
          mb: 0
        }}>
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
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  height: 47, 
                  backgroundColor: 'white' 
                } 
              }}
            />
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
              <MenuItem 
                value="" 
                sx={{ 
                  color: 'default', 
                  py: 1.5,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 1.5,
                  fontWeight: 500,
                  borderColor: 'divider',
                  mb: 1 
                }}
              >
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
          onEdit={(id) => navigate(`/solicitation/edit/${id}`)}
          onReview={(id) => navigate(`/solicitation/review/${id}`)}
          onView={(id) => navigate(`/solicitation/view/${id}`)}
          onDelete={(id) => { setSolicitationToDelete(id); setOpenDeleteConfirmation(true); }}
          onClone={(id) => navigate(`/solicitation/create?cloneFrom=${id}`)}
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
          onEdit={(id) => navigate(`/solicitation/edit/${id}`)}
          onReview={(id) => navigate(`/solicitation/review/${id}`)}
          onView={(id) => navigate(`/solicitation/view/${id}`)}
          onDelete={(id) => { setSolicitationToDelete(id); setOpenDeleteConfirmation(true); }}
          onClone={(id) => navigate(`/solicitation/create?cloneFrom=${id}`)}
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
          Total: <strong>{requests.total}</strong> solicitações
        </Typography>
      </Box>

      <ConfirmationDialog
        open={openDeleteConfirmation}
        onClose={() => setOpenDeleteConfirmation(false)}
        onConfirm={() => {
            if (solicitationToDelete) {
                removeAssistanceRequestById(solicitationToDelete).then(() => {
                    updateAssistanceRequestListWithCurrentParameters();
                    toast.success('Solicitação removida');
                }).catch(() => toast.error('Erro ao remover')).finally(() => setOpenDeleteConfirmation(false));
            }
        }}
        title="Remoção de solicitação"
        message="Deseja realmente remover esta solicitação?"
      />

      <SolicitationDetailsDialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        solicitationData={detailsDialogData}
      />
    </Paper>
  );
}