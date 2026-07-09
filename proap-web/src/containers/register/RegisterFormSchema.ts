import * as Yup from 'yup';
import { cpf } from 'cpf-cnpj-validator';

export const personalDataFormSchema = Yup.object({
  name: Yup.string()
    .required('Campo obrigatório')
    .max(255, 'O nome não pode ultrapassar 255 caracteres')
    .test('nome-completo', 'Informe o nome completo (nome e sobrenome)', (value) => {
      if (!value) return false;
      const parts = value.trim().split(/\s+/);
      return parts.length >= 2 && parts.every((p) => p.length >= 2);
    }),
  cpf: Yup.string()
    .required('Campo obrigatório')
    .max(14, 'CPF inválido')
    .test(
      'validation-cpf',
      'Insira um CPF válido',
      function (cpfValue?: string) {
        return cpfValue != undefined && cpf.isValid(cpfValue);
      },
    ),
  registration: Yup.string()
  .required('Campo obrigatório')
  .max(10, 'Insira uma matrícula válida')
  .matches(
    /^\d+$/, 
    'Insira uma matrícula num formato válido (apenas números)'
  ),
});

export const contactDataFormSchema = Yup.object({
  email: Yup.string()
    .email('Insira um e-mail válido')
    .max(255, 'O e-mail não pode ultrapassar 255 caracteres')
    .required('Campo obrigatório'),
  phone: Yup.string()
    .required('Campo obrigatório')
    .length(11, 'Número de telefone inválido'),
});

export const passwordFormSchema = Yup.object({
  password: Yup.string()
    .required('Campo obrigatório')
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .max(50, 'A senha não pode ultrapassar 50 caracteres'),
  confirmPassword: Yup.string()
    .required('Campo obrigatório')
    .test('same-password', 'As senhas não coincidem', function (value) {
      return this.parent.password == value;
    })
    .min(8, 'A senha deve ter no mínimo 8 caracteres'),
});

export interface RegisterFormValues {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  password: string;
  confirmPassword: string;
  registration: string;
  alternativePhone: string;
}

export const INITIAL_FORM_VALUES: RegisterFormValues = {
  name: '',
  email: '',
  cpf: '',
  phone: '',
  password: '',
  confirmPassword: '',
  registration: '',
  alternativePhone: '',
};
