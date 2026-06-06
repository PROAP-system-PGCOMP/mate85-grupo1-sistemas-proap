import { SystemConfiguration } from '../types';
import api from './index';

export const getSystemConfiguration =
  async (): Promise<SystemConfiguration> => {
    const [configRes, periodRes] = await Promise.all([
      api.get('/admin/system-config'),
      api.get('/admin/system-config/find-period')
    ]);

    const configData = configRes.data;

    if (!configData.resourceLinks) {
      configData.resourceLinks = [];
    }

    const startRaw = periodRes.data.startDate;
    const endRaw = periodRes.data.endDate;

    configData.startDate = startRaw ? startRaw.split('T')[0] : null;
    configData.endDate = endRaw ? endRaw.split('T')[0] : null;

    return configData;
  };

export const updateSystemConfiguration = async (
  configuration: SystemConfiguration,
): Promise<SystemConfiguration> => {
  const configRes = await api.put('/admin/system-config', configuration);

  if (configuration.startDate && configuration.endDate) {
    await api.put('/admin/system-config/period', {
      startDate: `${configuration.startDate}T00:00:00`,
      endDate: `${configuration.endDate}T23:59:59`,
    });
  }

  const updatedConfig = configRes.data;

  updatedConfig.startDate = configuration.startDate;
  updatedConfig.endDate = configuration.endDate;

  return updatedConfig;
};

export const getQualisCategories = async (): Promise<string[]> => {
  const response = await api.get('/admin/qualis-categories');
  return response.data;
};

export const saveQualisCategories = async (
  categories: string[],
): Promise<string[]> => {
  const response = await api.post('/admin/qualis-categories', categories);
  return response.data;
};

export const addQualisCategory = async (
  category: string,
): Promise<string[]> => {
  const response = await api.post(`/admin/qualis-categories/${category}`);
  return response.data;
};

export const removeQualisCategory = async (
  category: string,
): Promise<string[]> => {
  const response = await api.delete(`/admin/qualis-categories/${category}`);
  return response.data;
};