import React, { useState, useEffect } from 'react';
import { Field, useFormikContext } from 'formik';
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { WorkOutline } from '@mui/icons-material';
import useAllProfiles from '../../hooks/profile/useAllProfiles';

export default function UserProfileFormContainer() {
  const { errors, touched, setFieldValue, values } = useFormikContext<any>();
  
  const [isStudent, setIsStudent] = useState<boolean>(true);

  const { profiles, isLoading } = useAllProfiles(); 
  console.log("🔍 DADOS DOS PERFIS QUE VIERAM DA API:", profiles);

  useEffect(() => {
    if (isStudent && !values.profileId && profiles && profiles.length > 0) {
      const discenteProfile = profiles.find((p: any) => p.name.toLowerCase() === 'discente');
      if (discenteProfile) {
        setFieldValue('profileId', discenteProfile.id);
      }
    }
  }, [isStudent, values.profileId, setFieldValue, profiles]);

  const handleStudentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Impede que o evento de clique "suba" e dispare o submit do form pai
    event.stopPropagation();
    
    const isYes = event.target.value === 'yes';
    setIsStudent(isYes);
    
    if (isYes) {
      const discenteProfile = profiles?.find((p: any) => p.name.toLowerCase() === 'discente');
      setFieldValue('profileId', discenteProfile ? discenteProfile.id : '');
    } else {
      setFieldValue('profileId', ''); 
    }
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Defina seu tipo de vínculo com a instituição para finalizar o cadastro.
      </Typography>

      <Box sx={{ p: 3 }}>
        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend" sx={{ typography: 'subtitle1', fontWeight: 'bold', color: 'text.primary', mb: 2 }}>
            Você possui vínculo ativo como discente (aluno)?
          </FormLabel>
          <RadioGroup row value={isStudent ? 'yes' : 'no'} onChange={handleStudentChange}>
            <FormControlLabel 
              value="yes" 
              control={<Radio color="primary" />} 
              label="Sim, sou aluno" 
            />
            <FormControlLabel 
              value="no" 
              control={<Radio color="primary" />} 
              label="Não" 
            />
          </RadioGroup>
        </FormControl>

        {!isStudent && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px dashed', borderColor: 'primary' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <strong>Atenção:</strong> Cadastros de usuários não-discentes entrarão em <strong>modo de espera</strong> e precisarão ser aprovados pela administração do sistema antes de acessar as funcionalidades.
            </Typography>

            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">Carregando perfis...</Typography>
              </Box>
            ) : (
              <Field name="profileId">
                {({ field }: any) => (
                  <FormControl fullWidth size="medium" error={Boolean(touched.profileId && errors.profileId)}>
                    <Select
                      {...field}
                      displayEmpty
                      value={field.value || ''}
                      startAdornment={
                        <InputAdornment position="start">
                          <WorkOutline color="action" />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="" disabled>Selecione o perfil desejado</MenuItem>
                      {profiles
                        ?.filter((p: any) => p.name.toLowerCase() !== 'discente')
                        .map((profile: any) => (
                          <MenuItem key={profile.id} value={profile.id}>
                            {profile.name}
                          </MenuItem>
                      ))}
                    </Select>
                    {touched.profileId && errors.profileId && (
                      <FormHelperText>{String(errors.profileId)}</FormHelperText>
                    )}
                  </FormControl>
                )}
              </Field>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}