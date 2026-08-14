import api from '.';
import { ProfileRole } from '../types';

export const fetchProfiles = async () => {
  const response = await api.get<ProfileRole[]>('perfil/all');  return {
    status: response.status === 200 ? 'success' : 'error',
    data: response.data,
  };
};
