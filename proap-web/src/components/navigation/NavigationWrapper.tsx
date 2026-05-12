import { PropsWithChildren } from 'react';

import { useMediaQuery, useTheme } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import {
  AddRounded,
  AdminPanelSettings,
  Group,
  RateReview,
} from '@mui/icons-material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

import MobileNavigationWrapper from './MobileNavigationWrapper';
import useHasPermission from '../../hooks/auth/useHasPermission';
import DesktopNavigationWrapper from './DesktopNavigationWrapper';

export interface NavigationItem {
  label: string;
  link: string;
  visible: boolean;
  icon?: React.ReactElement;
}

export const NavigationWrapper = ({ children }: PropsWithChildren) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const userCanViewPage = useHasPermission('VIEW_USER');
  const isAdmin = useHasPermission('ADMIN_ROLE');
  const isCeapg = useHasPermission('CEAPG_ROLE');
  const isCollaborator = useHasPermission('FUNCIONARIO_ROLE');
  const navigationItems: NavigationItem[] = [
    {
      label: 'Página Inicial',
      icon: <HomeIcon />,
      link: '/home',
      visible: true,
    },
    {
      label: 'Usuários',
      icon: <Group />,
      link: '/users',
      visible: userCanViewPage,
    },
    {
      label: 'Painel Administrativo',
      icon: <AdminPanelSettings />,
      link: '/admin-panel',
      visible: isAdmin || isCeapg || isCollaborator,
    },
    {
      label: 'Avaliações CEAPG',
      icon: <RateReview />,
      link: '/ceapg-reviews',
      visible: isCeapg,
    },
  ];

  if (isMobile) {
    return (
      <MobileNavigationWrapper items={navigationItems}>
        {children}
      </MobileNavigationWrapper>
    );
  }

  return (
    <DesktopNavigationWrapper items={navigationItems}>
      {children}
    </DesktopNavigationWrapper>
  );
};

export default NavigationWrapper;
