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
  Grid,
  Divider,
  Button,
} from '@mui/material';
import {
  PermIdentity as PermIdentityIcon,
  Search as SearchIcon,
  AdminPanelSettings,
  NoAccounts,
  ExpandMore, // Mantido (Ordenação)
  GroupAdd as GroupAddIcon, // Mantido (Cadastro)
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

export default function UsersPage() {
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [currentProfile, setCurrentProfile] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [order, setOrder] = useState<SortOrder>('asc');
  const [orderBy, setOrderBy] = useState<SortableUserKey>('name');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {
    status,
    isLoading,
    users,
    page,
    totalUsers,
    PAGE_SIZE,
    handlePageChange,
    updateUsers,
  } = useUsers();

  const userCanViewPage = useHasPermission('VIEW_USER');

  useEffect(() => {
    if (users.length > 0) {
      setFilteredUsers(
        users.filter((user) =>
          Object.values(user).some(
            (value) =>
              typeof value === 'string' &&
              value.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
        ),
      );
    }
  }, [users, searchTerm]);

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

  const getProfileChipColor = (profileName: string) => {
    const profile = profileName.toLowerCase();
    if (profile.includes('admin')) return 'success';
    if (profile.includes('ceapg')) return 'warning';
    if (profile.includes('funcionario')) return 'warning';
    if (profile.includes('docente')) return 'primary';
    if (profile.includes('discente')) return 'info';
    return 'error';
  };

  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);

  const handleOpenCreateUser = () => {
    setIsCreateUserDialogOpen(true);
  };

  const renderMobileView = () => (
    <Stack spacing={2}>
      {sortedUsers.map(({ name, cpf, email, phone, profileName }) => (
        <Card key={cpf} elevation={1} sx={{ mb: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6" component="div">{name}</Typography>
              <Chip
                label={profileName.charAt(0).toUpperCase() + profileName.slice(1)}
                color={getProfileChipColor(profileName)}
                size="small"
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
      {sortedUsers.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <TablePagination
            component="div"
            count={totalUsers}
            page={page}
            rowsPerPage={PAGE_SIZE}
            rowsPerPageOptions={[PAGE_SIZE]}
            onPageChange={handlePageChange}
            labelRowsPerPage=""
          />
        </Box>
      )}
    </Stack>
  );

  const renderDesktopView = () => (
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
                Perfil de Usuário
              </TableSortLabel>
            </TableCell>
            <TableCell align="center">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedUsers.length > 0 ? (
            sortedUsers.map(({ name, cpf, email, phone, profileName }) => (
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

      <Box sx={{ mb: 4, mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: isMobile ? '100%' : 'auto' }}>
            <AdminPanelSettings color="primary" fontSize="large" />
            <Typography variant="h5" color="primary" fontWeight="bold">Usuários cadastrados</Typography>
          </Box>
          <Box sx={{ flexGrow: 1, width: isMobile ? '100%' : 'auto' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar usuário..."
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
              }}
            />
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