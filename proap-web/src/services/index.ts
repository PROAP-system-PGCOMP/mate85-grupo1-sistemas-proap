import axios from 'axios';
import { BASE_API_URL } from '../helpers/api';
import { LocalStorageToken } from '../helpers/auth';
import { jwtDecode, JwtPayload } from 'jwt-decode';

const api = axios.create({
  baseURL: BASE_API_URL,
});

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.exp ? decoded.exp * 1000 < Date.now() : true;
  } catch (error) {
    return true; 
  }
};

api.interceptors.request.use(
  (config) => {
    const token = LocalStorageToken.get();
    
    if (token) {
      if (isTokenExpired(token)) {
        LocalStorageToken.clear();
        window.location.href = '/login'; 
        
        return Promise.reject(new Error('Sessão expirada. Redirecionando para login...'));
      }
      
      return {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        },
      } as any;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const url = error.config?.url || '';
    
    console.log("A URL que deu erro 401 foi:", url);

    const isLoginRequest = url.includes('signin') || url.includes('authentication');
    if (error.response && error.response.status === 401 && !isLoginRequest) {
      LocalStorageToken.clear();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;