import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import ExtraRequestCard from './ExtraRequestCard';
import { SolicitationDetailsDialogProps } from '../../request-dialog/SolicitationDetailsDialog';


interface ExtraRequestGridViewProps {
  extraRequests: any[];
  searchQuery: string;
  currentUserEmail: string;
  userCanViewAllRequests: boolean;
  userCanReviewRequests: boolean;
  isCeapg: boolean;
  onEdit: (id: number) => void;
  onReview: (id: number) => void;
  onView: (id: number) => void;
  onDelete: (id: number) => void;
  onShowDetails: (props: SolicitationDetailsDialogProps) => void;
}

const ExtraRequestGridView: React.FC<ExtraRequestGridViewProps> = ({
  extraRequests,
  searchQuery,
  currentUserEmail,
  userCanViewAllRequests,
  userCanReviewRequests,
  isCeapg,
  onEdit,
  onReview,
  onView,
  onDelete,
  onShowDetails,
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      {!extraRequests.length ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            Nenhuma solicitação de demanda extra encontrada.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {extraRequests.map((extraRequest) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={extraRequest.id}>
              <ExtraRequestCard
                extraRequest={extraRequest}
                searchQuery={searchQuery}
                currentUserEmail={currentUserEmail}
                userCanViewAllRequests={userCanViewAllRequests}
                userCanReviewRequests={userCanReviewRequests}
                isCeapg={isCeapg}
                onEdit={onEdit}
                onReview={onReview}
                onView={onView}
                onDelete={onDelete}
                onShowDetails={onShowDetails}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ExtraRequestGridView;
