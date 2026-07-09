import * as Yup from 'yup';

export interface LoginFormValues {
  username: string;
  password: string;
}

export const INITIAL_FORM_VALUES: LoginFormValues = {
  username: '',
  password: '',
};

export const loginFormSchema = Yup.object({
  username: Yup.string()
    .email('Insira um e-mail válido')
    .max(255, 'Limite de caracteres excedido')
    .required('Campo obrigatório'),
  password: Yup.string()
    .max(50, 'Limite de caracteres excedido')
    .required('Campo obrigatório'),
});
