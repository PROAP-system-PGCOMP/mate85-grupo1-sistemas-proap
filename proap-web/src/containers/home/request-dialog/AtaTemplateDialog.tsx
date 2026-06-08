import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Typography, 
  IconButton 
} from '@mui/material';
import { ContentCopy, Close } from '@mui/icons-material';
import Toast from '../../../helpers/notification'; 

// IMPORTANTE: Ajuste este caminho para apontar para o seu arquivo helper real
import { generateApprovalText } from '../../../helpers/generateApprovalText'; 

export interface AtaTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  solicitationData: any;
}

export default function AtaTemplateDialog({ open, onClose, solicitationData }: AtaTemplateDialogProps) {
  const [templateText, setTemplateText] = useState('');

  // Atualiza a caixa de texto sempre que o modal abre ou os dados mudam
  useEffect(() => {
    if (open && solicitationData) {
      const generatedText = generateApprovalText(solicitationData);
      setTemplateText(generatedText);
    }
  }, [open, solicitationData]);

  const handleCopy = () => {
    navigator.clipboard.writeText(templateText);
    Toast.success('Texto copiado para a área de transferência!');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Template de Ata CEAPG
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        
        <TextField
          fullWidth
          multiline
          minRows={8}
          value={templateText}
          // ADIÇÃO: Deixa o campo estritamente como leitura
          InputProps={{
            readOnly: true,
          }}
          variant="outlined"
          sx={{ backgroundColor: '#f9f9f9' }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Fechar
        </Button>
        <Button onClick={handleCopy} variant="contained" startIcon={<ContentCopy />}>
          Copiar Texto
        </Button>
      </DialogActions>
    </Dialog>
  );
}