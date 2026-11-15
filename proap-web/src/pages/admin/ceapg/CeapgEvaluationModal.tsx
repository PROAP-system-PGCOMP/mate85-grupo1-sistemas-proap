import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, InputAdornment
} from '@mui/material';
import { CeapgResponse } from '../../../types';

// Deve coincidir com o CeapgReviewDTO do backend (valorFinal, observacoes, numeroAta).
// tipoDemanda é usado apenas para escolher o endpoint (normal ou extra).
export interface CeapgEvaluationPayload {
  valorFinal: number;
  observacoes: string;
  numeroAta?: string | null;
  tipoDemanda?: string;
}

interface Props {
  open: boolean;
  request: CeapgResponse | null;
  onClose: () => void;
  onSave: (id: number, data: CeapgEvaluationPayload) => void;
}

const CeapgEvaluationModal: React.FC<Props> = ({ open, request, onClose, onSave }) => {
  const [valorFinal, setValorFinal] = useState<number>(0);
  const [observacao, setObservacao] = useState('');

  useEffect(() => {
    if (request) {
      setValorFinal(request.valorAprovado || 0);
      setObservacao('');
    }
  }, [request, open]);

  const handleConfirm = () => {
    if (request) {
      onSave(request.id, {
        valorFinal,
        observacoes: observacao,
        numeroAta: request.numeroAta != null ? String(request.numeroAta) : null,
        tipoDemanda: request.tipoDemanda,
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold' }}>Finalizar Solicitação #{request?.id}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Valor Aprovado Inicialmente: <strong>R$ {request?.valorAprovado}</strong>
          </Typography>
          
          <TextField
            label="Valor Final Real (Pago pela UFBA)"
            fullWidth
            type="number"
            value={valorFinal}
            onChange={(e) => setValorFinal(Number(e.target.value))}
            InputProps={{
              startAdornment: <InputAdornment position="start">R$</InputAdornment>,
            }}
          />

          <TextField
            label="Observações CEAPG"
            fullWidth
            multiline
            rows={4}
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Ex: Valor alterado devido à variação cambial ou nota fiscal."
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button onClick={handleConfirm} variant="contained" color="success">
          Confirmar e Finalizar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CeapgEvaluationModal;