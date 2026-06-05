import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  Box, // <-- Certifique-se de importar o Box
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import MenuBookIcon from '@mui/icons-material/MenuBook'; // <-- Importando o ícone do livro

interface ApprovalTextDialogProps {
  open: boolean;
  onClose: () => void;
  generatedText: string;
}

export const ApprovalTextDialog: React.FC<ApprovalTextDialogProps> = ({
  open,
  onClose,
  generatedText,
}) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setSnackbarOpen(true);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MenuBookIcon color="primary" /> 
            <span>Parecer da solicitação</span>
          </Box>

          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            multiline
            fullWidth
            minRows={12}
            value={generatedText}
            variant="outlined"
            InputProps={{
              readOnly: true,
            }}
            onFocus={handleFocus}
            sx={{ backgroundColor: 'grey.50' }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit">
            Fechar
          </Button>
          <Button
            onClick={handleCopy}
            variant="contained"
            color="primary"
            startIcon={<ContentCopyIcon />}
          >
            Copiar Texto
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
          Texto copiado para a área de transferência!
        </Alert>
      </Snackbar>
    </>
  );
};