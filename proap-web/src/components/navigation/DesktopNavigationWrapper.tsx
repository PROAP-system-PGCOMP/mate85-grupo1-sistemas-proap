import {
  AppBar,
  Avatar,
  Box,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';

import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import {
  DesktopNavigationChildrenInner,
  DesktopNavigationChildrenWrapper,
  DesktopNavigationContainer,
  DesktopNavigationHeader,
  DesktopNavigationListWrapper,
  HeaderContainer,
  ImgLogo,
  UserAvatar,
  UserInfo,
} from './DesktopNavigationWrapper.style';

import { NavigationItem } from './NavigationWrapper';
import { useAppDispatch } from '../../store';
import { logout } from '../../store/slices/auth-slice/authSlice';
import logoIc from '../../assets/logo_ic.png';
import useCurrentUser from '../../hooks/auth/useCurrentUser';
import { useAuth } from '../../hooks';

const DRAWER_WIDTH = 240;

interface DesktopNavigationWrapperProps extends PropsWithChildren {
  items: NavigationItem[];
}

export default function DesktopNavigationWrapper({
  items,
  children,
}: DesktopNavigationWrapperProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { name } = useAuth();
  const userProfileState = useCurrentUser();
  const [viewName, setViewName] = useState(name);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentWidth = isCollapsed ? 80 : DRAWER_WIDTH;

  const handleClickExit = useCallback(() => {
    dispatch(logout());
    navigate('/');
  }, [dispatch, navigate]);

  const handleClickUserProfile = useCallback(() => {
    navigate('/user-profile');
  }, [navigate]);

  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  useEffect(() => {
    if (userProfileState.name !== '') {
      setViewName(userProfileState.name);
    }
  }, [userProfileState]);

  return (
    <DesktopNavigationContainer>
      <DesktopNavigationListWrapper width={currentWidth}>
        <DesktopNavigationHeader>
          {!isCollapsed && <ImgLogo src={logoIc} alt="Logo Instituto de Computação UFBA" />}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {!isCollapsed && (
              <Typography color="primary" variant="h5" fontWeight="bold">
                PROAP
              </Typography>
            )}
            <IconButton onClick={handleToggleCollapse} sx={{ color: '#184a7f', alignSelf: 'end' }}>
              <MenuIcon />
            </IconButton>
          </Box>
        </DesktopNavigationHeader>
        <List>
          {items.map(
            ({ label, icon, link, visible }) =>
              visible && (
                <ListItem key={label} disablePadding>
                  <ListItemButton
                    component={NavLink}
                    to={link}
                    sx={{
                      padding: '10px 16px',
                      borderRadius: '0 20px 20px 0',
                      margin: '4px 8px 4px 0',
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      '&.active': {
                        backgroundColor: 'rgba(24, 74, 127, 0.1)',
                        color: '#184a7f',
                        fontWeight: 'bold',
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(24, 74, 127, 0.05)',
                      },
                    }}
                  >
                    {icon && (
                      <Box
                        component="span"
                        sx={{
                          mr: isCollapsed ? 0 : 2,
                          color: 'inherit',
                          display: 'flex',
                        }}
                      >
                        {icon}
                      </Box>
                    )}
                    {!isCollapsed && <ListItemText primary={label} />}
                  </ListItemButton>
                </ListItem>
              ),
          )}
        </List>
      </DesktopNavigationListWrapper>

      <DesktopNavigationChildrenWrapper navigationWidth={currentWidth}>
        <HeaderContainer>
          <Typography variant="h6" color="primary">
            Bem-vindo ao Sistema PROAP
          </Typography>

          <UserInfo>
            <Tooltip title="Informações do Usuário" arrow>
              <UserAvatar onClick={handleClickUserProfile}>
                <PersonIcon sx={{ marginRight: 1 }} />
                <Typography variant="body1" fontWeight="medium">
                  {viewName}
                </Typography>
              </UserAvatar>
            </Tooltip>

            <Tooltip title="Sair" arrow>
              <IconButton
                color="default"
                onClick={handleClickExit}
                size="medium"
              >
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </UserInfo>
        </HeaderContainer>

        <DesktopNavigationChildrenInner>
          <Container maxWidth="xl">{children}</Container>
        </DesktopNavigationChildrenInner>
      </DesktopNavigationChildrenWrapper>
    </DesktopNavigationContainer>
  );
}
