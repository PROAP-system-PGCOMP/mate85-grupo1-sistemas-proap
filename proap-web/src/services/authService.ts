import { RegisterFormValues } from '../containers/register/RegisterFormSchema';
import { LoginFormValues } from '../containers/login/LoginFormSchema';
import { authenticate } from '../store/slices/auth-slice/authSlice';
import { AppDispatch } from '../store';
import api from '.';
import { SignInResponse, StatusResponse, User } from '../types';
import { setUser } from '../store/slices/user-profile-slice/userProfileSlice';

export const registerUser =
  (values: RegisterFormValues) => (dispatch: AppDispatch) => {
    return api.post('user/create', values).catch((error) => {
      throw new Error(error.response.data.message);
    });
  };

export const signIn =
  (values: LoginFormValues) => async (dispatch: AppDispatch) => {
    return await api
      .post<SignInResponse>('authentication/signin', values)
      .then(({ data: { accessToken } }) => {
        dispatch(authenticate(accessToken));
      });
  };

export const listUsers = async () => {
  const response = await api.get<User[]>('user/list');
  return {
    status: response.status === 200 ? 'success' : 'error',
    data: response.data,
  };
};

export const getCurrentUserInfo = async () => {
  return await api.get<User>('user/info').then((response) => response.data);
};

export const updateUserProfile = async (
  values: Pick<
    User,
    'name' | 'registrationNumber' | 'phone' | 'alternativePhone'
  >,
) => {
  return await api.put('user/update', values).then((response) => response.data);
};

export const updateUserProfileRole = async (
  email: string,
  profileId: number,
): Promise<StatusResponse> => {
  const response = await api
    .put(`user/update-profile/${email}`, null, {
      params: { profileId },
    })
    .then((response) => response.data)
    .catch((error) => {
      throw new Error(error.response.data.message);
    });
  return response;
};

export const deleteUser = async (email: string): Promise<StatusResponse> => {
  return await api
    .delete(`user/delete/${email}`)
    .then((response) => response.data)
    .catch((error) => {
      throw new Error(error.response.data.message);
    });
};

export const changeUserPassword = async (
  currentPassword: string,
  newPassword: string,
) => {
  const response = await api.put('user/change-password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};


export const registerUserByAdmin = async (values: any) => {
  return await api
    .post('user/create', values)
    .then((response) => response.data)
    .catch((error) => {
      throw new Error(error.response.data.message || 'Erro ao cadastrar usuário');
    });
};