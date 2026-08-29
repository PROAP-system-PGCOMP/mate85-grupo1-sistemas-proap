import React, { useState, useEffect } from 'react';
import { Field, useFormikContext } from 'formik';
import api from '../../../services';
import Toast from '../../../helpers/notification';
import { useParams } from 'react-router-dom';
import {
  Box,
  FormControl,
  FormHelperText,
  InputAdornment,
  MenuItem,
  Select,
  Typography,
  Tooltip,
  CircularProgress,
  Button,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputLabel,
  IconButton,
} from '@mui/material';
import {
  StyledData,
  StyledFormLabel,
  StyledTextField,
} from '../SolicitationFormContainer.style';
import {
  InfoOutlined,
  Edit,
  Delete,
  Restore,
  CheckCircle,
  Cancel,
  LowPriority,
  Undo,
  ArrowBack,
  DoDisturb,
  ContentCopy,
} from '@mui/icons-material';
import { SolicitationFormValues } from '../SolicitationFormSchema';
import { useBudgetPercentage } from '../../../hooks/budget/useBudgetPercentage';

interface ReviewDataFormContainerProps {
  onBack?: () => void;
}

export default function ReviewDataFormContainer({ onBack }: ReviewDataFormContainerProps) {
  const { id: urlId } = useParams<{ id: string }>(); 
  
  const { values, errors, touched, setFieldValue, setValues, submitForm, isValid, isSubmitting } =
    useFormikContext<SolicitationFormValues>();
  const [isEditingDate, setIsEditingDate] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<number | null>(null);
  const [selectedAvaliadorId, setSelectedAvaliadorId] = useState<number | ''>('');
  
  const [avaliadoresCeapg, setAvaliadoresCeapg] = useState<any[]>([]);
  const [isLoadingAvaliadores, setIsLoadingAvaliadores] = useState(false);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
    }
  }, [errors]);

  useEffect(() => {
  }, [isSubmitting]);

  const maxDiarias = values.quantidadeDiariasSolicitadas || 0;
  const diariasOptions = Array.from({ length: maxDiarias + 1 }, (_, i) => i);

  const currentYear = new Date().getFullYear();
  const requestYear = values.createdAt ? new Date(values.createdAt).getFullYear() : currentYear;

  const { totalBudget, percentageOfBudget, isLoading } = useBudgetPercentage({
    year: requestYear, 
    value: values.valorTotal,
  });

  useEffect(() => {
    const fetchAvaliadores = async () => {
      try {
        setIsLoadingAvaliadores(true);
        const { data } = await api.get('/user/list');
        
        const apenasCeapg = data.filter((user: any) => 
          user.profileName === 'CEAPG' || 
          user.profileName === 'Membro CEAPG' ||
          user.perfil?.name === 'CEAPG'
        );
        
        setAvaliadoresCeapg(apenasCeapg);
      } catch (error) {
        console.error('Erro ao buscar avaliadores do CEAPG:', error);
      } finally {
        setIsLoadingAvaliadores(false);
      }
    };

    fetchAvaliadores();
  }, []);

  useEffect(() => {
    if (!values.dataAvaliacaoProap) {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      setFieldValue('dataAvaliacaoProap', formattedDate);
    }
  }, [values.dataAvaliacaoProap, setFieldValue]);

  const handleSetCurrentDate = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setFieldValue('dataAvaliacaoProap', formattedDate);
    setIsEditingDate(false);
  };

  const handleRemoveEvaluation = async () => {
    await setValues({
      ...values,
      situacao: 0,
      valorAprovado: '' as any, 
      numeroDiariasAprovadas: 0,
      numeroAta: '' as any,     
      observacao: ''
    });
    submitForm();
  };

  const handleDecisionSelect = async (value: number) => {
    await setFieldValue('situacao', value);
    submitForm();
  };

  const handleOpenReviewModal = (decisionValue: number) => {
    setPendingAction(decisionValue); 
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPendingAction(null);
    setSelectedAvaliadorId('');
  };

  const handleConfirmReview = async () => {
    if (!selectedAvaliadorId || pendingAction === null) return;
    
    if (pendingAction === 1 || pendingAction === 2) {
      if (!values.numeroAta) {
        Toast.error("O preenchimento do 'Número da ATA' é obrigatório para Aprovar ou Reprovar.");
        handleCloseModal();
        return;
      }
    }
    if (pendingAction === 1) {
      if (values.valorAprovado === undefined || values.valorAprovado === null || (values.valorAprovado as any) === '') {
        Toast.error("O preenchimento do 'Valor aprovado' é obrigatório para Aprovar.");
        handleCloseModal();
        return;
      }
    }

    const solicitacaoId = (values as any).id || urlId || window.location.pathname.split('/').pop();

    try {
      await api.patch('/admin/ceapg/define/assistance', {
        avaliadorId: Number(selectedAvaliadorId),
        solicitacaoId: Number(solicitacaoId) 
      });

      setValues({
        ...values,
        situacao: pendingAction,
        avaliadorCeapgId: selectedAvaliadorId,
        avaliadorCeapg: {
          ...(values.avaliadorCeapg || {}),
          id: selectedAvaliadorId
        } as any 
      });
      
      handleCloseModal();
      
      setTimeout(() => {
        submitForm();
      }, 150);
      
    } catch (error) {
      console.error("Erro ao atribuir o avaliador:", error);
      Toast.error("Falha na comunicação com o servidor ao definir avaliador."); 
      handleCloseModal();
    }
  };

  const formatDisplayDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Avaliação da solicitação
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 3 }}>
        <Box sx={{ flex: 1, mb: isMobile ? 2 : 0 }}>
          {isEditingDate ? (
            <Box sx={{ position: 'relative' }}>
              <Field
                as={StyledTextField}
                fullWidth
                required
                label="Data da avaliação"
                name="dataAvaliacaoProap"
                type="date"
                InputLabelProps={{ shrink: true }}
                error={Boolean(touched.dataAvaliacaoProap && errors.dataAvaliacaoProap)}
                helperText={touched.dataAvaliacaoProap && errors.dataAvaliacaoProap}
              />
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Button size="small" variant="outlined" onClick={() => setIsEditingDate(false)} startIcon={<Restore />}>
                  Cancelar
                </Button>
                <Button size="small" variant="outlined" color="error" onClick={handleSetCurrentDate} startIcon={<Delete />}>
                  Resetar
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <StyledFormLabel required>Data da avaliação da solicitação</StyledFormLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body1">{formatDisplayDate(values.dataAvaliacaoProap)}</Typography>
                <Button variant="text" color="primary" size="small" onClick={() => setIsEditingDate(true)} startIcon={<Edit />} sx={{ ml: 2 }}>
                  Alterar
                </Button>
              </Box>
            </Box>
          )}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Field
            as={StyledTextField}
            fullWidth
            label="Número da ATA"
            required={values.situacao === 1 || values.situacao === 2}
            name="numeroAta"
            type="number"
            error={Boolean(touched.numeroAta && errors.numeroAta)}
            helperText={touched.numeroAta && errors.numeroAta}
          />
        </Box>
      </Box>

      <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 2 : 4 }}>
          <Box sx={{ flex: 1 }}>
            <StyledData>
              <StyledFormLabel>Valor total da solicitação</StyledFormLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Typography variant="h6" color="primary">
                  {values.valorTotal?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </Typography>
                {isLoading ? (
                  <CircularProgress size={16} />
                ) : percentageOfBudget !== null ? (
                  <Tooltip title={`Representa ${percentageOfBudget}% do orçamento anual.`} arrow>
                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'help' }}>
                      <Typography variant="body2" color="primary" sx={{ ml: 1, mr: 0.5 }}>({percentageOfBudget}%)</Typography>
                      <InfoOutlined fontSize="small" color="primary" />
                    </Box>
                  </Tooltip>
                ) : null}
              </Box>
            </StyledData>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Field
                as={StyledTextField}
                required={values.situacao === 1}
                fullWidth
                label="Valor aprovado"
                name="valorAprovado"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
                error={Boolean(touched.valorAprovado && errors.valorAprovado)}
                helperText={touched.valorAprovado && errors.valorAprovado}
                sx={{ flex: 1 }}
              />
              
              <Tooltip title="Copiar valor total da solicitação">
                <IconButton
                  onClick={() => setFieldValue('valorAprovado', values.valorTotal)}
                  color="primary"
                  sx={{ mt: 2 }} 
                >
                  <ContentCopy />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 2 : 4 }}>
          <Box sx={{ flex: 1 }}>
            <StyledFormLabel>Diárias solicitadas</StyledFormLabel>
            <Typography variant="h6" color="primary">{values.quantidadeDiariasSolicitadas}</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <FormControl fullWidth error={Boolean(touched.numeroDiariasAprovadas && errors.numeroDiariasAprovadas)}>
              <StyledFormLabel required={values.situacao === 1 || values.situacao === 2}>Diárias aprovadas</StyledFormLabel>
              <Field as={Select} name="numeroDiariasAprovadas" size="small">
                {diariasOptions.map((num) => (
                  <MenuItem key={num} value={num}>{num}</MenuItem>
                ))}
              </Field>
            </FormControl>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Field as={StyledTextField} fullWidth label="Observação" name="observacao" multiline rows={3} />
      </Box>

      <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: "column", justifyContent: "end" }}>
        <Box sx={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-end', mb: 2 }}>
          <StyledFormLabel required>Decisão da Avaliação PROAP</StyledFormLabel>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between'}}>
          {onBack && (
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={onBack}
              startIcon={<ArrowBack />}
              sx={{ borderRadius: '12px', py: 1.5, fontWeight: 'bold', borderWidth: 1, width: isMobile ? '100%' : 'auto'}}
            >
              Anterior
            </Button>
          )}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
            
            <Tooltip title="Remove a decisão atual e permite salvar como pendente">
              <span>
                <Button
                  variant='contained'
                  color="primary"
                  size="small"
                  disabled={values.situacao === 0}
                  onClick={handleRemoveEvaluation}
                  startIcon={<Undo />}
                  sx={{ borderRadius: '12px', py: 1.5, '&:hover': { backgroundColor: 'warning.main' } }}
                >
                  Remover 
                </Button>
              </span>
            </Tooltip>

            <Button
              variant='contained'
              color="primary"
              size="small"
              onClick={() => handleDecisionSelect(4)}
              startIcon={<DoDisturb />}
              sx={{ borderRadius: '12px', py: 1.5, fontWeight: 'bold', '&:hover': { backgroundColor: 'error.main'} }}
            >
              Cancelar
            </Button>

            <Button
              variant='contained'
              color="primary"
              size="small"
              onClick={() => handleDecisionSelect(3)}
              startIcon={<LowPriority />}
              sx={{ borderRadius: '12px', py: 1.5, fontWeight: 'bold', color: 'white', '&:hover': { backgroundColor: 'secondary.main'} }}
            >
              Em espera
            </Button>

            <Button
              type="button"
              variant='contained'
              color="primary"
              size="small"
              onClick={(e) => {
                e.preventDefault();
                handleOpenReviewModal(2);
              }}
              startIcon={<Cancel />}
              sx={{ borderRadius: '12px', py: 1.5, fontWeight: 'bold', '&:hover': { backgroundColor: 'error.main'} }}
            >
              Reprovar
            </Button>

            <Button
              type="button"
              variant='contained'
              color="primary"
              size="small"
              onClick={(e) => {
                e.preventDefault();
                handleOpenReviewModal(1);
              }} 
              startIcon={<CheckCircle />}
              sx={{ borderRadius: '12px', py: 1.5, fontWeight: 'bold', color: 'white', '&:hover': { backgroundColor: 'success.main'} }}
            >
              Aprovar
            </Button>
          </Box>
        </Box>
        {touched.situacao && errors.situacao && (
          <FormHelperText error sx={{ mt: 1, textAlign: isMobile ? 'center' : 'right' }}>{errors.situacao as string}</FormHelperText>
        )}
      </Box>

      <Dialog 
        open={isModalOpen} 
        onClose={handleCloseModal}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Indicar Revisor CEAPG
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Para concluir a ação de <strong>{pendingAction === 1 ? 'aprovar' : 'reprovar'}</strong>, selecione o revisor do CEAPG responsável por esta avaliação.
          </Typography>

          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel id="select-revisor-label">Revisor Responsável *</InputLabel>
            <Select
              labelId="select-revisor-label"
              value={selectedAvaliadorId}
              label="Revisor Responsável *"
              onChange={(e) => setSelectedAvaliadorId(Number(e.target.value))}
              disabled={isLoadingAvaliadores}
            >
              {isLoadingAvaliadores ? (
                <MenuItem disabled value="">
                  <CircularProgress size={20} sx={{ mr: 2 }} /> Carregando revisores...
                </MenuItem>
              ) : avaliadoresCeapg.length === 0 ? (
                <MenuItem disabled value="">
                  Nenhum revisor encontrado
                </MenuItem>
              ) : (
                avaliadoresCeapg.map((avaliador) => (
                  <MenuItem key={avaliador.id} value={avaliador.id}>
                    {avaliador.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseModal} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmReview} 
            variant="contained" 
            color={pendingAction === 1 ? 'success' : 'error'}
            disabled={!selectedAvaliadorId}
            sx={{ color: 'white' }}
          >
            Finalizar Avaliação
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}