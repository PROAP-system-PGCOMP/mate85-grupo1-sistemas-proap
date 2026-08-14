import React, { useState, useEffect } from 'react';
import {
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Chip,
  Tooltip,
  Card,
  CardContent,
  Stack,
  Container,
  useTheme,
  useMediaQuery,
  Button,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  PermIdentity as PermIdentityIcon,
  Search as SearchIcon,
  AdminPanelSettings,
  NoAccounts,
  ExpandMore,
  FilterAlt as FilterAltIcon,
  CheckCircleOutline as CheckIcon,
  HighlightOff as CloseIcon,
  HourglassEmpty as PendingIcon,
} from '@mui/icons-material';
import { maskCpf, maskPhone } from '../../helpers/masks';
import useUsers from '../../hooks/auth/useUsers';
import { UnauthorizedPage } from '../unauthorized/UnauthorizedPage';
import useHasPermission from '../../hooks/auth/useHasPermission';
import UserActionsDialogContainer from '../../containers/user-profile/user-actions/UserActionsDialogContainer';
import { User } from '../../types/auth-type/user';
import CreateUserDialogContainer from '../../containers/user-profile/user-actions/CreateUserDialogContainer';
import api from '../../services';

type SortOrder = 'asc' | 'desc';
type SortableUserKey = 'name' | 'email' | 'cpf' | 'phone' | 'profileName';
type ChipColor = "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";

export default function UsersPage() {
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [currentProfile, setCurrentProfile] = useState<string>('');
  const [open, setOpen] = useState(false);
  
  // Controle de Abas: 0 = Ativos, 1 = Pendentes
  const [tabIndex, setTabIndex] = useState(0);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [profileFilter, setProfileFilter] = useState<string>('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  
  const [order, setOrder] = useState<SortOrder>('asc');
  const [orderBy, setOrderBy] = useState<SortableUserKey>('name');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {
    isLoading,
    allUsers,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    updateUsers,
  } = useUsers();

  const userCanViewPage = useHasPermission('VIEW_USER');

  const uniqueProfiles = React.useMemo(() => {
    const profiles = new Set(allUsers.map((user) => user.profileName));
    return Array.from(profiles).sort();
  }, [allUsers]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    handlePageChange(null as any, 0);
  };

  useEffect(() => {
    setFilteredUsers(
      allUsers.filter((user: any) => {
        const matchesSearch = Object.values(user).some(
          (value) =>
            typeof value === 'string' &&
            value.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        const matchesProfile = profileFilter === '' || user.profileName === profileFilter;
        const isPending = user.status === 'PENDING';
        const matchesTab = tabIndex === 0 ? !isPending : isPending;

        return matchesSearch && matchesProfile && matchesTab;
      }),
    );
  }, [allUsers, searchTerm, profileFilter, tabIndex]);

  const handleClose = () => setOpen(false);

  const handleSuccess = () => {
    setOpen(false);
    setCurrentUserEmail('');
    setCurrentUserName('');
    setCurrentProfile('');
    updateUsers();
  };

  const handleClickPermissionAction = (
    email: string,
    name: string,
    profileName: string,
  ) => {
    setCurrentUserEmail(email);
    setCurrentUserName(name);
    setCurrentProfile(profileName);
    setOpen(true);
  };

  const handleApprovePendingUser = async (user: any) => {
    try {
      await api.patch('/user/review-user-role', {
        userId: user.id,
        status: 'APPROVED'
      });
      
      updateUsers(); 
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
    }
  };

  const handleRejectPendingUser = async (user: any) => {
    try {
      await api.patch('/user/review-user-role', {
        userId: user.id,
        status: 'REJECTED'
      });
      
      updateUsers();
    } catch (error) {
      console.error('Erro ao rejeitar usuário:', error);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleProfileFilterChange = (event: SelectChangeEvent) => {
    setProfileFilter(event.target.value);
  };

  const handleRequestSort = (property: SortableUserKey) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedUsers = React.useMemo(() => {
    const getValue = (user: User, key: SortableUserKey) => {
      switch (key) {
        case 'name': return user.name;
        case 'email': return user.email;
        case 'cpf': return user.cpf;
        case 'phone': return user.phone;
        case 'profileName': return user.profileName;
        default: return '';
      }
    };

    const stabilized = filteredUsers.map((user, index) => ({ user, index }));
    stabilized.sort((a, b) => {
      const aValue = getValue(a.user, orderBy) || '';
      const bValue = getValue(b.user, orderBy) || '';
      const comparison = aValue.localeCompare(bValue, 'pt-BR', {
        numeric: true,
        sensitivity: 'base',
      });

      if (comparison !== 0) {
        return order === 'asc' ? comparison : -comparison;
      }
      return a.index - b.index;
    });

    return stabilized.map(({ user }) => user);
  }, [filteredUsers, order, orderBy]);

  const pagedUsers = React.useMemo(
    () => sortedUsers.slice(pageSize * page, pageSize * (page + 1)),
    [sortedUsers, page, pageSize],
  );

  const getProfileChipColor = (profileName: string): ChipColor => {
    const profile = (profileName || '').toLowerCase();
    if (profile.includes('admin')) return 'success';
    if (profile.includes('ceapg')) return 'warning';
    if (profile.includes('funcionario')) return 'warning';
    if (profile.includes('docente')) return 'primary';
    if (profile.includes('discente')) return 'info';
    return 'error';
  };

  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);

  const renderMobileView = () => (
    <Stack spacing={2}>
      {pagedUsers.map((user: any) => {
        const displayProfile = tabIndex === 1 && user.requestedPerfilname ? user.requestedPerfilname : user.profileName;
        
        return (
          <Card key={user.cpf} elevation={1} sx={{ mb: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6" component="div">{user.name}</Typography>
                <Chip
                  label={displayProfile ? displayProfile.charAt(0).toUpperCase() + displayProfile.slice(1) : ''}
                  color={getProfileChipColor(displayProfile)}
                  size="small"
                  sx={{ fontWeight: 'medium', color: 'white' }}
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                <Typography variant="body2"><strong>Email:</strong> {user.email}</Typography>
                <Typography variant="body2"><strong>CPF:</strong> {maskCpf(user.cpf)}</Typography>
                <Typography variant="body2"><strong>Telefone:</strong> {maskPhone(user.phone)}</Typography>
              </Stack>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                {tabIndex === 0 ? (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PermIdentityIcon />}
                    onClick={() => handleClickPermissionAction(user.email, user.name, user.profileName)}
                  >
                    Gerenciar
                  </Button>
                ) : (
                  <>
                    <Button variant="outlined" color="error" size="small" onClick={() => handleRejectPendingUser(user)}>Rejeitar</Button>
                    <Button variant="contained" color="success" size="small" onClick={() => handleApprovePendingUser(user)}>Aprovar</Button>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        );
      })}
      {pagedUsers.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <TablePagination
            component="div"
            count={sortedUsers.length}
            page={page}
            rowsPerPage={pageSize}
            rowsPerPageOptions={[20, 50, 100]}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handlePageSizeChange}
            labelRowsPerPage="Por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
          />
        </Box>
      )}
    </Stack>
  );

  const renderDesktopView = () => (
    <Box sx={{ overflowX: 'auto', width: '100%' }}>
      <TableContainer sx={{ borderRadius: 0 }}>
        <Table stickyHeader sx={{ minWidth: 650 }} size="medium" aria-label="users table">
          <TableHead>
            <TableRow>
              <TableCell sortDirection={orderBy === 'name' ? order : false}>
                <TableSortLabel active={orderBy === 'name'} direction={orderBy === 'name' ? order : 'asc'} IconComponent={ExpandMore} onClick={() => handleRequestSort('name')}>
                  Nome
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'email' ? order : false}>
                <TableSortLabel active={orderBy === 'email'} direction={orderBy === 'email' ? order : 'asc'} IconComponent={ExpandMore} onClick={() => handleRequestSort('email')}>
                  E-mail
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'cpf' ? order : false}>
                <TableSortLabel active={orderBy === 'cpf'} direction={orderBy === 'cpf' ? order : 'asc'} IconComponent={ExpandMore} onClick={() => handleRequestSort('cpf')}>
                  CPF
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'phone' ? order : false}>
                <TableSortLabel active={orderBy === 'phone'} direction={orderBy === 'phone' ? order : 'asc'} IconComponent={ExpandMore} onClick={() => handleRequestSort('phone')}>
                  Telefone
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'profileName' ? order : false}>
                <TableSortLabel active={orderBy === 'profileName'} direction={orderBy === 'profileName' ? order : 'asc'} IconComponent={ExpandMore} onClick={() => handleRequestSort('profileName')}>
                  {tabIndex === 1 ? 'Perfil Solicitado' : 'Perfil'}
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedUsers.length > 0 ? (
              pagedUsers.map((user: any) => {
                const displayProfile = tabIndex === 1 && user.requestedPerfilname ? user.requestedPerfilname : user.profileName;

                return (
                  <TableRow
                    key={user.cpf}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                  >
                    <TableCell component="th" scope="row">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{maskCpf(user.cpf)}</TableCell>
                    <TableCell>{maskPhone(user.phone)}</TableCell>
                    <TableCell>
                      <Chip
                        label={displayProfile ? displayProfile.charAt(0).toUpperCase() + displayProfile.slice(1) : ''}
                        color={getProfileChipColor(displayProfile)}
                        size="small"
                        sx={{ fontWeight: 'medium', color: 'white' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {tabIndex === 0 ? (
                        <Tooltip title="Gerenciar permissões">
                          <IconButton onClick={() => handleClickPermissionAction(user.email, user.name, user.profileName)} color="default">
                            <PermIdentityIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <Tooltip title="Aprovar Perfil">
                            <IconButton onClick={() => handleApprovePendingUser(user)} color="success">
                              <CheckIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Rejeitar Solicitação">
                            <IconButton onClick={() => handleRejectPendingUser(user)} color="error">
                              <CloseIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <NoAccounts sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">Nenhum usuário encontrado nesta aba.</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={sortedUsers.length}
        page={page}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[20, 50, 100]}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handlePageSizeChange}
        labelRowsPerPage="Por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
      />
    </Box>
  );

  return !userCanViewPage ? (
    <UnauthorizedPage />
  ) : (
    <Container maxWidth="xl">
      <UserActionsDialogContainer open={open} userEmail={currentUserEmail} userName={currentUserName} currentProfile={currentProfile} onClose={handleClose} onSuccess={handleSuccess} />
      <CreateUserDialogContainer open={isCreateUserDialogOpen} onClose={() => setIsCreateUserDialogOpen(false)} onSuccess={() => { setIsCreateUserDialogOpen(false); updateUsers(); }} />

      <Box sx={{ mb: 4, mt: 2}}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AdminPanelSettings color="primary" fontSize="large" sx={{ mr: 1 }} />
          <Typography variant="h5" color="primary" fontWeight="bold">Gestão de Usuários</Typography>
        </Box>

        {/* CONTAINER PAPER UNIFICANDO TUDO (Igual ao Cadastro de Usuário) */}
        <Paper elevation={1} sx={{ borderRadius: 2 }}>
          
          {/* BARRA DE ABAS */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabIndex} 
              onChange={handleTabChange} 
              aria-label="Abas de gestão de usuários"
              sx={{ px: 2 }}
            >
              <Tab 
                icon={<PermIdentityIcon />} 
                iconPosition="start" 
                label="Usuários Ativos" 
                sx={{ textTransform: 'none', fontWeight: 'medium', fontSize: '1rem' }}
              />
              <Tab 
                icon={<PendingIcon />} 
                iconPosition="start" 
                label="Aprovações Pendentes" 
                sx={{ textTransform: 'none', fontWeight: 'medium', fontSize: '1rem' }}
              />
            </Tabs>
          </Box>

          {/* ÁREA DE CONTEÚDO (Filtros e Tabela) */}
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            
            {/* Barra de Pesquisa e Filtros */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 3 }}>
              <Box sx={{ flexGrow: 1, width: '100%', display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row', alignItems: 'center' }}>
                <TextField
                  margin="none"
                  sx={{ flexGrow: 1, alignSelf: 'center' }} 
                  variant="outlined"
                  placeholder="Buscar usuário..."
                  size="small"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
                    sx: { height: '100%', boxSizing: 'border-box'}, 
                  }}
                />
                
                <Select
                  displayEmpty
                  value={profileFilter}
                  onChange={handleProfileFilterChange}
                  size="small"
                  IconComponent={ExpandMore}
                  renderValue={(selected) => {
                    const text = selected 
                      ? `Filtrar: ${selected.charAt(0).toUpperCase() + selected.slice(1)}` 
                      : 'Filtrar';
                    
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FilterAltIcon fontSize="small" sx={{ color: 'action.active' }} />
                        <Typography variant="body2" sx={{ fontWeight: 400, color: 'text.secondary' }}>
                          {text}
                        </Typography>
                      </Box>
                    );
                  }}
                  sx={{
                    minWidth: 180,
                    width: isMobile ? '100%' : 'auto',
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    height: '3em', 
                    '& .MuiSelect-select': { display: 'flex', alignItems: 'center', py: 0 }
                  }}
                >
                  <MenuItem value="" sx={{ bgcolor: '#f5f5f5', color: '#333', py: 1.5, justifyContent: 'center', gap: 1.5, mb: 1, '&:hover': { bgcolor: '#e0e0e0' } }}>
                    <FilterAltIcon fontSize="small" sx={{ color: '#333' }} />
                    <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Limpar filtro</Typography>
                  </MenuItem>
                  
                  {uniqueProfiles.map((profile) => (
                    <MenuItem key={profile} value={profile} sx={{ py: 1.5, px: 2, justifyContent: 'center' }}>
                      <Chip
                        label={profile.charAt(0).toUpperCase() + profile.slice(1)}
                        color={getProfileChipColor(profile)}
                        size="small"
                        sx={{ width: '100%', pointerEvents: 'none', fontWeight: 'medium', color: 'white' }}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </Box>

            {/* Tabela ou Loading */}
            {isLoading ? (
              <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                <Box sx={{ width: '100%' }}>
                  <LinearProgress />
                  <Typography variant="body1" sx={{ textAlign: 'center', mt: 2 }}>Carregando usuários...</Typography>
                </Box>
              </Box>
            ) : (
              <Box>
                {isMobile ? renderMobileView() : renderDesktopView()}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}