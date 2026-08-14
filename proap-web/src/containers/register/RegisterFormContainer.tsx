import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import StepperForm, {
  FormStep,
} from '../../components/stepper-form/StepperForm';
import { FormikValues } from 'formik';

import PersonalDataFormContainer from './PersonalDataFormContainer';
import ContactDataFormContainer from './ContactDataFormContainer';
import PasswordFormContainer from './PasswordFormContainer';
import UserProfileFormContainer from './UserProfileFormContainer';

import { registerUser } from '../../services/authService';
import Toast from '../../helpers/notification';
import { useAppDispatch } from '../../store';

import {
  INITIAL_FORM_VALUES,
  RegisterFormValues,
  personalDataFormSchema,
  contactDataFormSchema,
  passwordFormSchema,
  userProfileFormSchema,
} from './RegisterFormSchema';

export default function RegisterFormContainer() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    (values: FormikValues) => {
      const payload = {
        name: values.name,
        email: values.email,
        cpf: values.cpf,
        phone: values.phone,
        password: values.password,
        alternativePhone: values.alternativePhone,
        registration: values.registration,
        requestPerfilId: Number(values.profileId),
      };

      // 2. Enviando o payload mapeado
      return dispatch(registerUser(payload as any))
        .then(() => {
          Toast.success('Conta criada com sucesso!');
          navigate('/');
        })
        .catch((error) => {
          Toast.error('Erro ao criar conta: ' + error.message);
        });
    },
    [dispatch, navigate]
  );

  const registerFormSteps: FormStep[] = useMemo(
    () => [
      {
        label: 'Dados pessoais',
        component: PersonalDataFormContainer,
        schema: personalDataFormSchema,
      },
      {
        label: 'Contato',
        component: ContactDataFormContainer,
        schema: contactDataFormSchema,
      },
      {
        label: 'Senha',
        component: PasswordFormContainer,
        schema: passwordFormSchema,
      },
      {
        label: 'Vínculo',
        component: UserProfileFormContainer,
        schema: userProfileFormSchema,
      },
    ],
    [],
  );

  return (
    <StepperForm
      initialValues={INITIAL_FORM_VALUES}
      steps={registerFormSteps}
      onSubmit={handleSubmit}
      validateOnChange={false}
      labels={{
        submit: 'Cadastrar',
      }}
    />
  );
}