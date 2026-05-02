import React from 'react';
import { Field, useFormikContext } from 'formik';
import { Box, Stack, Tooltip, Typography } from '@mui/material';

import {
  StyledIconButton,
  StyledTextField,
} from '../../solicitation/SolicitationFormContainer.style';
import { ExtraRequest } from '../../../types/requests-type/ExtraRequest';
import { useAuth } from '../../../hooks';
import { Info } from '@mui/icons-material';

export default function ExtraSolicitantDataContainer() {
  const { errors, touched, values } = useFormikContext<ExtraRequest>();

  const { name, email } = useAuth();

  return (     
    <Box display="flex" flexDirection="column" gap={2} pt={2} pb={2}>

      <StyledTextField
        label="Solicitante"
        value={values.user.name != '' ? values.user.name : name}
        disabled
      />
      <StyledTextField
        label="E-mail"
        value={values.user.email != '' ? values.user.email : email}
        disabled
      />
      <Field
        as={StyledTextField}
        label="Solicitação"
        name="titulo"
        error={Boolean(touched.nomeSolicitacao && errors.nomeSolicitacao)}
        helperText={touched.nomeSolicitacao && errors.nomeSolicitacao}
        required
        style={{ padding: 'none' }}
      />
      <Stack direction={'row'}>
        <Field
          as={StyledTextField}
          label="Valor da Solicitação (R$)"
          sx={{ width: '200px' }}
          name="valorSolicitado"
          type="number"
          InputProps={{
            inputProps: { min: 0, step: 0.01 },
          }}
          error={Boolean(touched.valorSolicitado && errors.valorSolicitado)}
          helperText={touched.valorSolicitado && errors.valorSolicitado}
          required
        />
        <Tooltip
          sx={{ position: 'relative', top: '10px' }}
          title="Informe o valor conforme seu extrato bancário"
        >
          <StyledIconButton>
            <Info />
          </StyledIconButton>
        </Tooltip>
      </Stack>
      <Box sx={{ display: 'flex', flexDirection: 'column'}}>
        <Typography variant="h6" component="h2" sx={{ fontSize: '1rem', fontWeight: 'bold', color: 'text.secondary'}}>
          *Apenas solicitações que não sejam relacionadas à publicação científica.
        </Typography> 
        <Field
          as={StyledTextField}
          label="Justificativa"
          name="justificativa"
          error={Boolean(touched.justificativa && errors.justificativa)}
          helperText={touched.justificativa && errors.justificativa}
          required
          style={{ padding: 'none' }}
          rows={5}
          multiline
        />
      </Box>
    </Box>
  );
}
