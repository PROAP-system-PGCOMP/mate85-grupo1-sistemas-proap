import { Field, FieldArray, Form, Formik, useFormikContext } from 'formik';
import { SystemConfiguration, UrlMapper } from '../../../types';
import { systemConfigSchema } from '../SystemConfigSchema';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {
  Block,
  Link as LinkIcon,
  School,
  Settings,
  TextFields,
  Public,
} from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';
import TextFieldWithPreview from '../../../components/FormFields/TextFieldWithPreview';
import CountryGroupField from '../../../components/FormFields/CountryGroupField';

function UnsavedChangesBlocker({
  onDirtyChange,
  submitRef,
}: {
  onDirtyChange?: (dirty: boolean) => void;
  submitRef?: React.MutableRefObject<(() => Promise<void>) | null>;
}) {
  const { dirty, submitForm, validateForm } = useFormikContext();

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty]);

  useEffect(() => {
    if (submitRef) submitRef.current = submitForm;
    return () => { if (submitRef) submitRef.current = null; };
  }, [submitForm]);
  const [open, setOpen] = useState(false);
  const proceedFn = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!dirty) return;

    // Bloqueia fechamento/refresh da aba
    const handleBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Intercepta navegação programática (Link, navigate())
    const origPushState = window.history.pushState.bind(window.history);
    const origReplaceState = window.history.replaceState.bind(window.history);

    window.history.pushState = (...args: Parameters<typeof origPushState>) => {
      proceedFn.current = () => origPushState(...args);
      setOpen(true);
    };
    window.history.replaceState = (...args: Parameters<typeof origReplaceState>) => {
      proceedFn.current = () => origReplaceState(...args);
      setOpen(true);
    };

    // Intercepta botão voltar/avançar do browser
    const handlePopState = () => {
      // Empurra o estado atual de volta para cancelar a navegação
      origPushState(window.history.state, '', window.location.href);
      proceedFn.current = () => window.history.go(-1);
      setOpen(true);
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      window.history.pushState = origPushState;
      window.history.replaceState = origReplaceState;
    };
  }, [dirty]);

  const handleLeave = () => {
    setOpen(false);
    proceedFn.current?.();
    proceedFn.current = null;
  };

  const handleSaveAndLeave = async () => {
    const errors = await validateForm();
    if (Object.keys(errors).length > 0) {
      setOpen(false);
      return;
    }
    await submitForm();
    handleLeave();
  };

  const handleStay = () => {
    setOpen(false);
    proceedFn.current = null;
  };

  return (
    <Dialog open={open} onClose={handleStay} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight="bold">Alterações não salvas</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Você fez alterações que ainda não foram salvas. O que deseja fazer?
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={handleStay} color="inherit" sx={{ whiteSpace: 'nowrap' }}>
          Continuar editando
        </Button>
        <Button onClick={handleLeave} color="error" variant="outlined" sx={{ whiteSpace: 'nowrap' }}>
          Sair sem salvar
        </Button>
        <Button onClick={handleSaveAndLeave} variant="contained" color="primary" sx={{ whiteSpace: 'nowrap' }}>
          Salvar e sair
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface SystemConfigFormProps {
  initialValues: SystemConfiguration;
  onSubmit: (values: SystemConfiguration) => void;
  onDirtyChange?: (dirty: boolean) => void;
  submitRef?: React.MutableRefObject<(() => Promise<void>) | null>;
}

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}

function SectionCard({ icon, title, description, children }: SectionCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'grey.50',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
            {title}
          </Typography>
          {description && (
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
      </Box>
      <Box sx={{ p: 3 }}>{children}</Box>
    </Paper>
  );
}

export default function SystemConfigFormContainer({
  initialValues,
  onSubmit,
  onDirtyChange,
  submitRef,
}: SystemConfigFormProps) {
  const [newCategory, setNewCategory] = useState<string>('');

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={systemConfigSchema}
      onSubmit={onSubmit}
      enableReinitialize={true}
    >
      {({ errors, touched, values, setFieldValue }) => {
        const handleAddResourceLink = (resourceLink: UrlMapper) => {
          const currentLinks = values.resourceLinks || [];
          setFieldValue('resourceLinks', [...currentLinks, resourceLink]);
        };

        const handleRemoveResourceLink = (index: number) => {
          const currentLinks = values.resourceLinks || [];
          setFieldValue(
            'resourceLinks',
            currentLinks.filter((_, i) => i !== index),
          );
        };

        return (
          <Box component={Form} sx={{ width: '100%' }}>
            <UnsavedChangesBlocker onDirtyChange={onDirtyChange} submitRef={submitRef} />
            <Stack spacing={3}>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Field name="enableSolicitation">
                  {({ field }: any) => (
                    <FormControlLabel
                      control={
                        <Switch
                          {...field}
                          checked={field.value}
                          onChange={(event) =>
                            setFieldValue(field.name, event.target.checked)
                          }
                          color={field.value ? 'success' : 'error'}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {!values.enableSolicitation && <Block color="error" fontSize="small" />}
                            <Typography
                              variant="body2"
                              fontWeight="medium"
                              color={values.enableSolicitation ? 'success.dark' : 'error.dark'}
                            >
                              {values.enableSolicitation
                                ? 'Criação de solicitações ativada'
                                : 'Criação de solicitações desativada'}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {values.enableSolicitation
                              ? 'Os usuários podem criar novas solicitações de auxílio.'
                              : 'Os usuários não podem criar novas solicitações até que esta opção seja reativada.'}
                          </Typography>
                        </Box>
                      }
                      sx={{ m: 0 }}
                    />
                  )}
                </Field>
                <Button type="submit" variant="contained" color="primary" size="large">
                  Salvar Alterações
                </Button>
              </Box>

              {/* Categorias Qualis */}
              <SectionCard
                icon={<School />}
                title="Categorias Qualis"
                description="Defina quais categorias Qualis são aceitas nas solicitações"
              >
                <FieldArray
                  name="qualis"
                  render={(arrayHelpers) => (
                    <Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, minHeight: 40 }}>
                        {values.qualis.map((category, index) => (
                          <Chip
                            key={index}
                            label={category}
                            onDelete={() => arrayHelpers.remove(index)}
                            color="primary"
                          />
                        ))}
                        {values.qualis.length === 0 && (
                          <Typography variant="body2" color="text.disabled">
                            Nenhuma categoria adicionada
                          </Typography>
                        )}
                      </Box>
                      <TextField
                        fullWidth
                        size="small"
                        label="Nova categoria"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newCategory.trim()) {
                              arrayHelpers.push(newCategory.trim());
                              setNewCategory('');
                            }
                          }
                        }}
                        error={touched.qualis && !!errors.qualis}
                        helperText={touched.qualis && (errors.qualis as string)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                edge="end"
                                onClick={() => {
                                  if (newCategory.trim()) {
                                    arrayHelpers.push(newCategory.trim());
                                    setNewCategory('');
                                  }
                                }}
                              >
                                <AddIcon />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                  )}
                />
              </SectionCard>

              {/* URLs de Documentação */}
              <SectionCard
                icon={<LinkIcon />}
                title="URLs de Documentação"
                description="Links exibidos no sistema para os usuários consultarem"
              >
                <Stack spacing={2}>
                  <Field
                    as={TextField}
                    fullWidth
                    size="small"
                    name="sitePgcompURL"
                    label="URL do Site do PGCOMP"
                    error={touched.sitePgcompURL && !!errors.sitePgcompURL}
                    helperText={touched.sitePgcompURL && errors.sitePgcompURL}
                  />
                  <Field
                    as={TextField}
                    fullWidth
                    size="small"
                    name="resolucaoProapURL"
                    label="URL da Resolução PROAP"
                    error={touched.resolucaoProapURL && !!errors.resolucaoProapURL}
                    helperText={touched.resolucaoProapURL && errors.resolucaoProapURL}
                  />
                </Stack>
              </SectionCard>

              {/* Limites e Valores */}
              <SectionCard
                icon={<Settings />}
                title="Limites e Valores"
                description="Parâmetros financeiros e de quantidade aplicados nas solicitações"
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Field
                    as={TextField}
                    fullWidth
                    size="small"
                    name="numMaxDiarias"
                    label="Número Máximo de Diárias"
                    type="number"
                    inputProps={{ min: 1 }}
                    error={touched.numMaxDiarias && !!errors.numMaxDiarias}
                    helperText={touched.numMaxDiarias && errors.numMaxDiarias}
                  />
                  <Field
                    as={TextField}
                    fullWidth
                    size="small"
                    name="valorDiariaBRL"
                    label="Valor da Diária (R$)"
                    type="number"
                    inputProps={{ step: '0.01', min: 1 }}
                    error={touched.valorDiariaBRL && !!errors.valorDiariaBRL}
                    helperText={touched.valorDiariaBRL && errors.valorDiariaBRL}
                  />
                </Stack>
              </SectionCard>

              {/* Textos Informativos */}
              <SectionCard
                icon={<TextFields />}
                title="Textos Informativos"
                description="Mensagens exibidas aos usuários durante o preenchimento das solicitações"
              >
                <Stack spacing={2}>
                  {[
                    { name: 'textoAvisoQualis', label: 'Aviso sobre Qualis', severity: 'warning' as const, value: values.textoAvisoQualis },
                    { name: 'textoAvisoValorInscricao', label: 'Aviso sobre Valor de Inscrição', severity: 'warning' as const, value: values.textoAvisoValorInscricao },
                    { name: 'textoAvisoEnvioArquivoCarta', label: 'Aviso sobre Envio de Carta de Aceite', severity: 'warning' as const, value: values.textoAvisoEnvioArquivoCarta },
                    { name: 'textoInformacaoQtdDiarias', label: 'Informações sobre Quantidade de Diárias', severity: 'info' as const, value: values.textoInformacaoQtdDiarias },
                    { name: 'textoInformacaoCalcularQualis', label: 'Informações sobre Como Calcular Qualis', severity: 'info' as const, value: values.textoInformacaoCalcularQualis },
                    { name: 'textoInformacaoValorDiaria', label: 'Informações sobre Valor da Diária', severity: 'info' as const, value: values.textoInformacaoValorDiaria },
                    { name: 'textoInformacaoValorPassagem', label: 'Informações sobre Valor da Passagem', severity: 'info' as const, value: values.textoInformacaoValorPassagem },
                  ].map((item) => (
                    <Paper
                      key={item.name}
                      elevation={0}
                      sx={{
                        p: 2.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1.5,
                      }}
                    >
                      <TextFieldWithPreview
                        name={item.name}
                        label={item.label}
                        touched={touched}
                        errors={errors}
                        value={item.value}
                        alertSeverity={item.severity}
                        resourceLinks={values.resourceLinks}
                        onAddResourceLink={handleAddResourceLink}
                        onRemoveResourceLink={handleRemoveResourceLink}
                      />
                    </Paper>
                  ))}
                </Stack>
              </SectionCard>

              {/* Grupos de Países */}
              <SectionCard
                icon={<Public />}
                title="Grupos de Países"
                description="Configure os agrupamentos de países utilizados nas solicitações internacionais"
              >
                <CountryGroupField
                  groups={values.countryGroups || []}
                  onChange={(groups) => setFieldValue('countryGroups', groups)}
                />
              </SectionCard>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                <Button type="submit" variant="contained" color="primary" size="large">
                  Salvar Alterações
                </Button>
              </Box>

            </Stack>
          </Box>
        );
      }}
    </Formik>
  );
}
