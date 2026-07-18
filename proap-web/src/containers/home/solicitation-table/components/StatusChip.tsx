import React from 'react';
import { Chip, alpha, SxProps, Theme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LowPriority from '@mui/icons-material/LowPriority';

interface StatusChipProps {
  status: number;
  sx?: SxProps<Theme>;
}

/**
 * Component for displaying solicitation status as a chip with an icon
 */
const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  const getStatusColor = () => {
    if (status === 1) return 'success';
    if (status === 2) return 'error';
    if (status === 3) return 'secondary';
    return 'warning';
  };

  const getStatusText = () => {
    if (status === 1) return 'Aprovada';
    if (status === 2) return 'Não aprovada';
    if (status === 3) return 'Em espera';
    return 'Pendente';
  };

  const getStatusIcon = () => {
    if (status === 1) return <CheckCircleIcon fontSize="small" />;
    if (status === 2) return <CancelIcon fontSize="small" />;
    if (status === 3) return <LowPriority fontSize="small" />;

    return <HourglassEmptyIcon fontSize="small" />;
  };

  return (
    <Chip
      icon={getStatusIcon()}
      label={getStatusText()}
      color={getStatusColor()}
      size="medium"
      variant="outlined"
      sx={{
        width: '100%',
        height: '100%',
        borderRadius: '8px',
        borderWidth: 0,
        fontWeight: 500,
        '&.MuiChip-colorSuccess': {
          backgroundColor: alpha('#4caf50', 0.08),
          borderColor: alpha('#4caf50', 0.3),
          color: '#2e7d32',
          '& .MuiChip-icon': {
            color: '#2e7d32',
          },
        },
        '&.MuiChip-colorError': {
          backgroundColor: alpha('#f44336', 0.08),
          borderColor: alpha('#f44336', 0.3),
          color: '#d32f2f',
          '& .MuiChip-icon': {
            color: '#d32f2f',
          },
        },
        '&.MuiChip-colorWarning': {
          backgroundColor: alpha('#ff9800', 0.08),
          borderColor: alpha('#ff9800', 0.3),
          color: '#ed6c02',
          '& .MuiChip-icon': {
            color: '#ed6c02',
          },
        },
      }}
    />
  );
};

export default StatusChip;
