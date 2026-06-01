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
  Divider,
  Button,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import {
  PermIdentity as PermIdentityIcon,
  Search as SearchIcon,
  AdminPanelSettings,
  NoAccounts,
  ExpandMore,
  FilterAlt as FilterAltIcon,
} from '@mui/icons-material';
import { maskCpf, maskPhone } from '../../helpers/masks';
import useUsers from '../../hooks/auth/useUsers';
import { UnauthorizedPage } from '../unauthorized/UnauthorizedPage';
import useHasPermission from '../../hooks/auth/useHasPermission';
import UserActionsDialogContainer from '../../containers/user-profile/user-actions/UserActionsDialogContainer';
import { User } from '../../types/auth-type/user';
import CreateUserDialogContainer from '../../containers/user-profile/user-actions/CreateUserDialogContainer';

type SortOrder = 'asc' | 'desc';
type SortableUserKey = 'name' | 'email' | 'cpf' | 'phone' | 'profileName';
type ChipColor = "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";

export default function UsersPage() {
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [currentProfile, setCurrentProfile] = useState<string>('');
  const [open, setOpen] = useState(false);
  
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

  useEffect(() => {
    setFilteredUsers(
      allUsers.filter((user) => {
        const matchesSearch = Object.values(user).some(
          (value) =>
            typeof value === 'string' &&
            value.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        const matchesProfile = profileFilter === '' || user.profileName === profileFilter;
        
        return matchesSearch && matchesProfile;
      }),
    );
  }, [allUsers, searchTerm, profileFilter]);

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
      const aValue = getValue(a.user, orderBy);
      const bValue = getValue(b.user, orderBy);
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
    const profile = profileName.toLowerCase();
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
      {pagedUsers.map(({ name, cpf, email, phone, profileName }) => (
        <Card key={cpf} elevation={1} sx={{ mb: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6" component="div">{name}</Typography>
              <Chip
                label={profileName.charAt(0).toUpperCase() + profileName.slice(1)}
                color={getProfileChipColor(profileName)}
                size="small"
                sx={{ fontWeight: 'medium', color: 'white' }}
              />
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1}>
              <Typography variant="body2"><strong>Email:</strong> {email}</Typography>
              <Typography variant="body2"><strong>CPF:</strong> {maskCpf(cpf)}</Typography>
              <Typography variant="body2"><strong>Telefone:</strong> {maskPhone(phone)}</Typography>
            </Stack>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PermIdentityIcon />}
                onClick={() => handleClickPermissionAction(email, name, profileName)}
              >
                Gerenciar
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}
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
    <>
    <TableContainer component={Paper} elevation={0}>
      <Table stickyHeader sx={{ minWidth: 650 }} size="medium" aria-label="users table">
        <TableHead>
          <TableRow>
            <TableCell sortDirection={orderBy === 'name' ? order : false}>
              <TableSortLabel
                active={orderBy === 'name'}
                direction={orderBy === 'name' ? order : 'asc'}
                IconComponent={ExpandMore}
                onClick={() => handleRequestSort('name')}
              >
                Nome
              </TableSortLabel>
            </TableCell>
            <TableCell sortDirection={orderBy === 'email' ? order : false}>
              <TableSortLabel
                active={orderBy === 'email'}
                direction={orderBy === 'email' ? order : 'asc'}
                IconComponent={ExpandMore}
                onClick={() => handleRequestSort('email')}
              >
                E-mail
              </TableSortLabel>
            </TableCell>
            <TableCell sortDirection={orderBy === 'cpf' ? order : false}>
              <TableSortLabel
                active={orderBy === 'cpf'}
                direction={orderBy === 'cpf' ? order : 'asc'}
                IconComponent={ExpandMore}
                onClick={() => handleRequestSort('cpf')}
              >
                CPF
              </TableSortLabel>
            </TableCell>
            <TableCell sortDirection={orderBy === 'phone' ? order : false}>
              <TableSortLabel
                active={orderBy === 'phone'}
                direction={orderBy === 'phone' ? order : 'asc'}
                IconComponent={ExpandMore}
                onClick={() => handleRequestSort('phone')}
              >
                Telefone
              </TableSortLabel>
            </TableCell>
            <TableCell sortDirection={orderBy === 'profileName' ? order : false}>
              <TableSortLabel
                active={orderBy === 'profileName'}
                direction={orderBy === 'profileName' ? order : 'asc'}
                IconComponent={ExpandMore}
                onClick={() => handleRequestSort('profileName')}
              >
                Perfil
              </TableSortLabel>
            </TableCell>
            <TableCell align="center">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pagedUsers.length > 0 ? (
            pagedUsers.map(({ name, cpf, email, phone, profileName }) => (
              <TableRow
                key={cpf}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                }}
              >
                <TableCell component="th" scope="row">{name}</TableCell>
                <TableCell>{email}</TableCell>
                <TableCell>{maskCpf(cpf)}</TableCell>
                <TableCell>{maskPhone(phone)}</TableCell>
                <TableCell>
                  <Chip
                    label={profileName.charAt(0).toUpperCase() + profileName.slice(1)}
                    color={getProfileChipColor(profileName)}
                    size="small"
                    sx={{ fontWeight: 'medium', color: 'white' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Gerenciar permissões">
                    <IconButton onClick={() => handleClickPermissionAction(email, name, profileName)} color="default">
                      <PermIdentityIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <NoAccounts sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">Nenhum usuário encontrado</Typography>
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
    </>
  );

  return !userCanViewPage ? (
    <UnauthorizedPage />
  ) : (
    <Container maxWidth="xl">
      <UserActionsDialogContainer
        open={open}
        userEmail={currentUserEmail}
        userName={currentUserName}
        currentProfile={currentProfile}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />

      <CreateUserDialogContainer
        open={isCreateUserDialogOpen}
        onClose={() => setIsCreateUserDialogOpen(false)}
        onSuccess={() => {
          setIsCreateUserDialogOpen(false);
          updateUsers();
        }}
      />

      <Box sx={{ mb: 4, mt: 2}}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 3 }}>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: isMobile ? '100%' : 'auto', whiteSpace: 'nowrap' }}>
            <AdminPanelSettings color="primary" fontSize="large" />
            <Typography variant="h5" color="primary" fontWeight="bold">Usuários cadastrados</Typography>
          </Box>
          
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
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
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
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  py: 0,
                }
              }}
              MenuProps={{
                MenuListProps: {
                  disablePadding: true,
                },
                PaperProps: {
                  sx: { 
                    mt: 0.5, 
                    borderRadius: 2,
                    minWidth: 160,
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
                    overflow: 'hidden',
                    pb: 1.5,
                  }
                }
              }}
            >
              <MenuItem 
                value="" 
                sx={{ 
                  bgcolor: '#f5f5f5',
                  color: '#333',
                  py: 1.5,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 1,
                  '&:hover': {
                    bgcolor: '#e0e0e0',
                  }
                }}
              >
                <FilterAltIcon fontSize="small" sx={{ color: '#333' }} />
                <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  Limpar filtro
                </Typography>
              </MenuItem>
              
              {uniqueProfiles.map((profile) => (
                <MenuItem 
                  key={profile} 
                  value={profile} 
                  sx={{ 
                    py: 1.5, 
                    px: 2, 
                    justifyContent: 'center',
                  }}
                >
                  <Chip
                    label={profile.charAt(0).toUpperCase() + profile.slice(1)}
                    color={getProfileChipColor(profile)}
                    size="small"
                    sx={{ 
                      width: '100%', 
                      pointerEvents: 'none',
                      fontWeight: 'medium', 
                      color: 'white' 
                    }}
                  />
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>

        {isLoading ? (
          <Card sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <Box sx={{ width: '100%' }}>
              <LinearProgress />
              <Typography variant="body1" sx={{ textAlign: 'center', mt: 2 }}>Carregando usuários...</Typography>
            </Box>
          </Card>
        ) : (
          <Card elevation={1}>
            {isMobile ? renderMobileView() : renderDesktopView()}
          </Card>
        )}
      </Box>
    </Container>
  );
}