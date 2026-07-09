import * as Yup from 'yup';

export const userProfileSchema = Yup.object().shape({
  name: Yup.string().required('Nome é obrigatório')
    .max(255, 'O nome não pode ultrapassar 255 caracteres')
    .matches(
      /^[a-zA-ZÀ-ÿ\s]+$/, 
      'O nome não pode conter números ou caracteres especiais'
    )
    .test('nome-completo', 'Informe o nome completo (nome e sobrenome)', (value) => {
      if (!value) return false;
      const parts = value.trim().split(/\s+/);
      return parts.length >= 2 && parts.every((p) => p.length >= 2);
    }),
  email: Yup.string().email('E-mail inválido').required('Email é obrigatório'),
  cpf: Yup.string().required('CPF é obrigatório'),
  phone: Yup.string().required('Telefone é obrigatório'),
  alternativePhone: Yup.string(),
  registrationNumber: Yup.string().required('Matrícula é obrigatória')
    .required('Matrícula é obrigatória')
    .max(10, 'Insira uma matrícula válida')
    .matches(
      /^\d+$/, 
      'Insira uma matrícula num formato válido (apenas números)'
    ),
});
