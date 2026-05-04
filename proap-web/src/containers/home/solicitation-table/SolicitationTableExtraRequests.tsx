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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
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
import FilterListIcon from '@mui/icons-material/FilterList';

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
import { ExtraRequestTableView, ExtraRequestGridView } from './components';
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
    (
      sortBy: ExtraRequestPropToSort,
      ascending: boolean,
      size: number,
      page: number,
    ) => {
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

  // Initial load
  useEffect(() => {
    updateRequestListWithCurrentParameters();
  }, [updateRequestListWithCurrentParameters]);

  // Filter
  const filteredRequests = (extraRequests?.list || []).filter(
    (request) =>
      !searchQuery ||
      request.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">Solicitações de Demanda Extra</Typography>
          <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewModeChange} size="small">
            <ToggleButton value="table">
              <Tooltip title="Visualização em tabela"><ViewListIcon /></Tooltip>
            </ToggleButton>
            <ToggleButton value="grid">
              <Tooltip title="Visualização em cards"><ViewModuleIcon /></Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Buscar solicitações"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title="Filtros">
            <IconButton size="small"><FilterListIcon /></IconButton>
          </Tooltip>
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
          searchQuery={searchQuery} // Adicionado para consistência com a Interface
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
          <Select value={size} onChange={(e) => setSize(e.target.value as number)} size="small">
            {[5, 10, 20, 30].map(val => <MenuItem key={val} value={val}>{val}</MenuItem>)}
          </Select>
        </Box>

        <Pagination
          count={numberPages}
          page={currentPage + 1}
          onChange={(_, v) => setCurrentPage(v - 1)}
          color="primary"
          size={isMobile ? 'small' : 'medium'}
        />

        <Typography variant="body2" color="text.secondary">
          Total: {extraRequests?.total || 0} solicitações
        </Typography>
      </Box>

      <Dialog open={openDeleteConfirmation} onClose={closeDeleteDialog}>
        <DialogTitle>Remoção de solicitação</DialogTitle>
        <DialogContent>
          <DialogContentText><b>Deseja realmente remover esta solicitação?</b></DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Não</Button>
          <Button onClick={handleClickRemoveRequest} autoFocus>Sim</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}