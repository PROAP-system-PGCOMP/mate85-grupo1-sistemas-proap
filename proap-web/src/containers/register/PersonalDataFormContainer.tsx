import React, { useEffect, useState } from 'react';
import { RegisterFormValues } from './RegisterFormSchema';
import { Field, useFormikContext } from 'formik';
import {
  TextField,
  Box,
  InputAdornment,
  Typography,
  Grid,
} from '@mui/material';
import { CpfInputMask } from '../input-masks/CpfInputMask';
import { Person, Badge, AccountBox } from '@mui/icons-material';

export default function PersonalDataFormContainer() {
  const { errors, touched, setFieldValue, values } =
    useFormikContext<RegisterFormValues>();

  const [cpfWihoutMask, setCpfWihoutMask] = useState(values.cpf);

  // useEffect(() => {
  //   console.log(values.cpf);
  // }, [values]);

  const handleInputCpfChange = (event: any) => {
    const cpfWihoutMask = event.target.value.replace(/[\-\.\_]/g, '');
    setCpfWihoutMask(cpfWihoutMask);
    setFieldValue('cpf', cpfWihoutMask);
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Preencha seus dados pessoais para cadastro no sistema
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Field name="name">
            {({ field, meta }: any) => (
              <TextField
                {...field}
                fullWidth
                label="Nome Completo"
                placeholder="Digite seu nome completo"
                variant="outlined"
                required
                error={Boolean(touched.name && errors.name)}
                helperText={touched.name && errors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="CPF"
            name="cpf"
            required
            placeholder="Ex: 000.000.000-00"
            error={Boolean(touched.cpf && errors.cpf)}
            helperText={touched.cpf && errors.cpf}
            onChange={handleInputCpfChange}
            value={cpfWihoutMask}
            InputProps={{
              inputComponent: CpfInputMask as any,
              startAdornment: (
                <InputAdornment position="start">
                  <AccountBox color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Field name="registration">
            {({ field, meta }: any) => (
              <TextField
                {...field}
                fullWidth
                label="Matrícula / SIAPE"
                placeholder="Digite sua matrícula ou SIAPE"
                variant="outlined"
                required
                error={Boolean(touched.registration && errors.registration)}
                helperText={touched.registration && errors.registration}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Badge color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          </Field>
        </Grid>
      </Grid>
    </Box>
  );
}
