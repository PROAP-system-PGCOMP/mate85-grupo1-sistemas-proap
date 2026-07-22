import {
  Typography,
  Box,
  Paper,
  InputAdornment,
  TextField,
  IconButton,
  useMediaQuery,
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  alpha,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  SelectChangeEvent,
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
  ExtraRequestPropToSort,
  deleteExtraAssistanceRequest,
  getExtraAssistanceRequests,
} from '../../../services/extraAssistanceRequestService';
import { IRootState, useAppDispatch } from '../../../store';
import { useAuth } from '../../../hooks';
import usePrevious from '../../../helpers/usePrevious';
import useHasPermission from '../../../hooks/auth/useHasPermission';
import { useViewModePreference } from '../../../hooks';
import { ExtraRequestTableView, ExtraRequestGridView, StatusChip } from './components';
import { SolicitationDetailsDialogProps } from '../request-dialog/SolicitationDetailsDialog';

interface SolicitationTableExtraRequestsProps {
  onShowDetails: (props: SolicitationDetailsDialogProps) => void;
}

export default function SolicitationTableExtraRequests({ 
  onShowDetails 
}: SolicitationTableExtraRequestsProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const currentUser = useAuth();

  // Permissions
  const userCanViewAllRequests = useHasPermission('VIEW_ALL_REQUESTS');
  const isCeapg = useHasPermission('CEAPG_ROLE');
  const userCanReviewRequests = useHasPermission('APPROVE_REQUEST');

  const [viewMode, setViewMode] = useViewModePreference(currentUser.email);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | null>(null);

  const statusOptions = [
    { value: 0, text: 'Pendente' },
    { value: 1, text: 'Aprovada' },
    { value: 2, text: 'Não aprovada' },
    { value: 3, text: 'Em espera' },
    { value: 4, text: 'Cancelada' },
  ];

  // Table sorting
  const [selectedPropToSortTable, setSelectedPropToSortTable] = useState<{
    [Property in ExtraRequestPropToSort]?: boolean;
  }>({
    createdAt: false,
  });

  const getSelectedProp = useCallback(() => {
    return Object.getOwnPropertyNames(
      selectedPropToSortTable,
    )[0] as ExtraRequestPropToSort;
  }, [selectedPropToSortTable]);

  const handleClickSortTable = (sortBy: ExtraRequestPropToSort) => {
    setSelectedPropToSortTable({
      [sortBy]: !selectedPropToSortTable[sortBy],
    });
  };

  // Pagination
  const [numberPages, setNumberPages] = useState(1);
  const prevNumberPages = usePrevious(numberPages);
  const [size, setSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);

  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [solicitationToDelete, setSolicitationToDelete] = useState<number | null>(null);

  // Data fetching
  const { extraRequests } = useSelector(
    (state: IRootState) => state.assistanceRequestSlice,
  );

  const updateRequestList = useCallback(
    (sortBy: ExtraRequestPropToSort, ascending: boolean, size: number, page: number) => {
      dispatch(getExtraAssistanceRequests(sortBy, ascending, page, size)).then(
        (response: any) => {
          if (response.payload?.total) {
            setNumberPages(Math.ceil(response.payload.total / size));
          }
        }
      );
    },
    [dispatch],
  );

  const updateRequestListWithCurrentParameters = useCallback(() => {
    updateRequestList(
      getSelectedProp(),
      selectedPropToSortTable[getSelectedProp()] as boolean,
      size,
      currentPage,
    );
  }, [updateRequestList, getSelectedProp, selectedPropToSortTable, size, currentPage]);

  const handleStatusFilterChange = (event: SelectChangeEvent<string | number>) => {
    const value = event.target.value;
    setStatusFilter(value === '' ? null : Number(value));
  };

  const getStatusAlphaColor = (status: number | null) => {
    if (status === 1) return alpha('#4caf50', 0.05);
    if (status === 2) return alpha('#f44336', 0.05);
    if (status === 3) return alpha('rgb(255, 251, 0)', 0.05);
    if (status === 4) return alpha('#f44336', 0.05);
    if (status === 0) return alpha('#ff9800', 0.05);
    return 'transparent';
  };

  // Action handlers
  const handleClickEdit = (id: number) => navigate(`/extra-solicitation/edit/${id}`);
  const handleClickReview = (id: number) => navigate(`/extra-solicitation/review/${id}`);
  const handleClickView = (id: number) => navigate(`/extra-solicitation/view/${id}`);

  const openDeleteDialog = (id: number) => {
    setSolicitationToDelete(id);
    setOpenDeleteConfirmation(true);
  };

  const closeDeleteDialog = () => {
    setOpenDeleteConfirmation(false);
    setSolicitationToDelete(null);
  };

  const handleClickRemoveRequest = () => {
    if (solicitationToDelete) {
      deleteExtraAssistanceRequest(solicitationToDelete)
        .then(() => {
          updateRequestListWithCurrentParameters();
          toast.success('Solicitação extra removida com sucesso');
          closeDeleteDialog();
        })
        .catch((error) => {
          console.error(error);
          toast.error('Erro ao remover solicitação extra');
          closeDeleteDialog();
        });
    }
  };

  const handleViewModeChange = (_: React.MouseEvent<HTMLElement>, newMode: 'table' | 'grid') => {
    if (newMode !== null) setViewMode(newMode);
  };

  // Effects
  useEffect(() => {
    if (prevNumberPages && prevNumberPages > numberPages && currentPage >= numberPages) {
      setCurrentPage(Math.max(0, numberPages - 1));
    }
  }, [numberPages, prevNumberPages, currentPage]);

  useEffect(() => {
    updateRequestList(
      getSelectedProp(),
      selectedPropToSortTable[getSelectedProp()] as boolean,
      size,
      currentPage,
    );
  }, [currentPage, size, selectedPropToSortTable, updateRequestList, getSelectedProp]);

  // Combined Filter
  const filteredRequests = (extraRequests?.list || []).filter(
    (request) =>
      (!searchQuery || request.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === null || request.situacao === statusFilter)
  );

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
            Solicitações de Demanda Extra
          </Typography>
          <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewModeChange} size="small">
            <ToggleButton value="table">
              <Tooltip title="Visualização em tabela"><ViewListIcon /></Tooltip>
            </ToggleButton>
            <ToggleButton value="grid">
              <Tooltip title="Visualização em cards"><ViewModuleIcon /></Tooltip>
            </ToggleButton>
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
              placeholder="Buscar por solicitante..."
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
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, px: 2, color: 'text.secondary' }}>
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
        <ExtraRequestTableView
          extraRequests={filteredRequests}
          searchQuery={searchQuery}
          currentUserEmail={currentUser.email}
          userCanViewAllRequests={userCanViewAllRequests}
          userCanReviewRequests={userCanReviewRequests}
          isCeapg={isCeapg}
          selectedPropToSortTable={selectedPropToSortTable}
          handleClickSortTable={handleClickSortTable}
          onEdit={handleClickEdit}
          onReview={handleClickReview}
          onView={handleClickView}
          onDelete={openDeleteDialog}
          onShowDetails={onShowDetails}
        />
      ) : (
        <ExtraRequestGridView
          extraRequests={filteredRequests}
          searchQuery={searchQuery}
          currentUserEmail={currentUser.email}
          userCanViewAllRequests={userCanViewAllRequests}
          userCanReviewRequests={userCanReviewRequests}
          isCeapg={isCeapg}
          onEdit={handleClickEdit}
          onReview={handleClickReview}
          onView={handleClickView}
          onDelete={openDeleteDialog}
          onShowDetails={onShowDetails}
        />
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">Itens por página:</Typography>
          <Select value={size} onChange={(e) => setSize(e.target.value as number)} size="small" sx={{ minWidth: 70 }}>
            {[5, 10, 20, 30].map(val => <MenuItem key={val} value={val}>{val}</MenuItem>)}
          </Select>
        </Box>

        <Pagination
          count={numberPages}
          page={currentPage + 1}
          onChange={(_, v) => setCurrentPage(v - 1)}
          color="primary"
          showFirstButton
          showLastButton
          size={isMobile ? 'small' : 'medium'}
        />

        <Typography variant="body2" color="text.secondary">
          Total: <strong>{extraRequests?.total || 0}</strong> solicitações
        </Typography>
      </Box>

      <Dialog open={openDeleteConfirmation} onClose={closeDeleteDialog}>
        <DialogTitle>Remoção de solicitação</DialogTitle>
        <DialogContent>
          <DialogContentText>Deseja realmente remover esta solicitação extra?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Não</Button>
          <Button onClick={handleClickRemoveRequest} autoFocus>Sim</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}