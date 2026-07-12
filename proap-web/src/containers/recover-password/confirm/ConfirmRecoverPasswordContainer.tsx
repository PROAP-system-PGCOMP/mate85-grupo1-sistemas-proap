import { Box } from '@mui/material';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { confirmRecoverPassword } from '../../../services/recoverPasswordService';
import { useAppDispatch } from '../../../store';
import {
  RecoverPasswordButton,
  RecoverPasswordCircularProgress,
  PasswordRecoveryTypography,
  RecoverPasswordLinkTypography,
} from './ConfirmRecoverPasswordContainer.style';
import {
  INITIAL_FORM_VALUES,
  confirmRecoverPasswordFormSchema,
  ConfirmRecoverPasswordFormValues,
} from './ConfirmRecoverPasswordSchema';
import PasswordField from '../../../components/custom/PasswordField';
import Toast from '../../../helpers/notification';

export default function ConfirmRecoverPasswordFormContainer(props: {
  token: string | null;
}) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    (
      values: ConfirmRecoverPasswordFormValues,
      actions: FormikHelpers<ConfirmRecoverPasswordFormValues>,
    ) => {
      return confirmRecoverPassword(values, props.token!)
        .then(() => {
          Toast.success('Senha recuperada com sucesso!');
          navigate('/');
        })
        .catch((error) => {
          Toast.error('Erro ao recuperar senha: ' + error.message);
          actions.setSubmitting(false);
        });
    },
    [dispatch, props.token, navigate],
  );

  return (
    <Formik
      initialValues={INITIAL_FORM_VALUES}
      validationSchema={confirmRecoverPasswordFormSchema}
      validateOnChange={true}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, isSubmitting }) => (
        <Form>
          <Box sx={{ display: 'flex', flexDirection: 'column', pt: 2, pb: 2 }}>
            
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <PasswordRecoveryTypography sx={{ mb: 1 }}>
                Criar nova senha
              </PasswordRecoveryTypography>
              <RecoverPasswordLinkTypography>
                Insira a nova senha para a sua conta.
              </RecoverPasswordLinkTypography>
            </Box>

            <Field
              as={PasswordField}
              fullWidth
              name="password"
              label="Nova senha"
              error={touched.password && !!errors.password}
              helperText={touched.password && errors.password}
              sx={{ mb: 2 }}
            />
            <Field
              as={PasswordField}
              fullWidth
              name="confirmPassword"
              label="Confirmar senha"
              error={touched.confirmPassword && !!errors.confirmPassword}
              helperText={touched.confirmPassword && errors.confirmPassword}
            />
          </Box>
          <RecoverPasswordButton
            variant="contained"
            type="submit"
            disabled={isSubmitting}
            fullWidth
          >
            {isSubmitting && (
              <RecoverPasswordCircularProgress color="info" size={25} sx={{ mr: 1 }} />
            )}
            Recuperar senha
          </RecoverPasswordButton>
        </Form>
      )}
    </Formik>
  );
}