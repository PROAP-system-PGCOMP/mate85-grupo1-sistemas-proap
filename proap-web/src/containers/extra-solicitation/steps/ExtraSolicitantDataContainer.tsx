import React from 'react';
import { Field, useFormikContext } from 'formik';
import { Box, Stack, Tooltip, Typography } from '@mui/material';

import {
  StyledIconButton,
  StyledTextField,
} from '../../solicitation/SolicitationFormContainer.style';
import { useAuth } from '../../../hooks';
import { Info } from '@mui/icons-material';

export default function ExtraSolicitantDataContainer() {
  // Usei 'any' provisoriamente caso a interface ExtraRequest ainda 
  // não tenha sido atualizada para refletir o novo Record do Java
  const { errors, touched, values } = useFormikContext<any>();

  const { name, email } = useAuth();

  // Busca do Formik, com fallback para os dados logados (useAuth)
  const displayNome = values?.userName || values?.user?.name || name;
  const displayEmail = values?.userEmail || values?.user?.email || email;

  return (     
    <Box display="flex" flexDirection="column" gap={2} pt={2} pb={2}>

      <StyledTextField
        label="Solicitante"
        value={displayNome}
        disabled
      />
      <StyledTextField
        label="E-mail"
        value={displayEmail}
        disabled
      />
      
      {/* Ajustado para 'titulo' em todo o campo. 
        Certifique-se de que initialValues tenha a propriedade 'titulo' 
      */}
      <Field
        as={StyledTextField}
        label="Solicitação"
        name="titulo"
        error={Boolean(touched.titulo && errors.titulo)}
        helperText={touched.titulo && errors.titulo}
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