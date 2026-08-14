import React from 'react';
import {
  Button,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import { HomeHotbarLink } from './HomeHotbar.style';
import useHasPermission from '../../../hooks/auth/useHasPermission';

export default function HomeHotbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const userCanViewAllRequests = useHasPermission('VIEW_ALL_REQUESTS');
  const userCanCreateRequest = useHasPermission('CREATE_REQUEST');

  return (
    <Box sx={{ my: 2 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          width: '100%',
          mb: isMobile ? 2 : 3,
        }}
      >
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          color="primary"
          fontWeight="bold"
          sx={{ mb: isMobile ? 2 : 0 }}
        >
          {userCanViewAllRequests
            ? 'Solicitações PROAP'
            : 'Minhas solicitações PROAP'}
        </Typography>

        {userCanCreateRequest && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 2,
              width: isMobile ? '100%' : 'auto',
            }}
          >
            <HomeHotbarLink
              to="/solicitation/create"
              style={{ width: isMobile ? '100%' : 'auto' }}
            >
              <Tooltip title="Apenas apoio à publicação científica">
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  fullWidth
                  sx={{
                    px: 2,
                    py: 1.5,
                    border: '2px solid',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    whiteSpace: 'nowrap',
                    height: '100%',
                    textAlign: 'center',
                    '&:hover': {
                      backgroundColor: 'rgba(24, 74, 127, 0.04)',
                    },
                  }}
                >
                  Apoio a publicação científica
                </Button>
              </Tooltip>
            </HomeHotbarLink>

            <HomeHotbarLink
              to="/extra-solicitation/create"
              style={{ width: isMobile ? '100%' : 'auto' }}
            >
              <Tooltip title="Tudo o que não for relacionado à publicação científica">
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  fullWidth
                  sx={{
                    px: 2,
                    py: 1.5,
                    border: '2px solid',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    whiteSpace: 'nowrap',
                    height: '100%',
                    textAlign: 'center',
                    '&:hover': {
                      backgroundColor: 'rgba(24, 74, 127, 0.04)',
                    },
                  }}
                >
                  Demanda Extra
                </Button>
              </Tooltip>
            </HomeHotbarLink>
          </Box>
        )}
      </Box>
    </Box>
  );
}
