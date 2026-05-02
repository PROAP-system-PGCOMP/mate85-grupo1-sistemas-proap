import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '../../hooks';
import PrivateRoutesHandler from './PrivateRoutesHandler';
import PublicRoutes from './PublicRoutes';

export default function ApplicationRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      {isAuthenticated ? <PrivateRoutesHandler /> : <PublicRoutes />}
    </BrowserRouter>
  );
}