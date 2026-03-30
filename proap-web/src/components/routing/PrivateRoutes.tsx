import { Route, Routes, Navigate } from 'react-router-dom';
import {
  HomePage,
  NotFoundPage,
  SolicitationPage,
  EditSolicitationPage,
  CreateExtraSolicitationPage,
  EditExtraSolicitationPage,
  ReviewSolicitationPage,
  UsersPage,
} from '../../pages';

import NavigationWrapper from '../navigation/NavigationWrapper';
import UserProfilePage from '../../pages/user-profile/UserProfilePage';
import ViewSolicitationPage from '../../pages/view-solicitation/ViewSolicitationPage';
import ViewExtraSolicitationPage from '../../pages/view-extra-solicitation/ViewExtraSolicitationPage';
import AdminDashboardPage from '../../pages/admin-panel/AdminDashboardPage';
import CeapgReviewsPage from '../../pages/ceapg-reviews/CeapgReviewsPage';
import useHasPermission from '../../hooks/auth/useHasPermission';
import RedirectBasedOnRole from './RedirectBasedOnRole';
import ReviewExtraSolicitationPage from '../../pages/review-extra-solicitation/ReviewExtraSolicitationPage';

export default function PrivateRoutes() {
  const isAdmin = useHasPermission('ADMIN_ROLE');
  const isCeapg = useHasPermission('CEAPG_ROLE');
  const isCollaborator = useHasPermission('FUNCIONARIO_ROLE');

  return (
    <NavigationWrapper>
      <Routes>
        <Route path="/" element={<RedirectBasedOnRole />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/solicitation/create" element={<SolicitationPage />} />
        <Route
          path="/extra-solicitation/create"
          element={<CreateExtraSolicitationPage />}
        />
        <Route
          path="/extra-solicitation/edit/:id"
          element={<EditExtraSolicitationPage />}
        />
        <Route
          path="/extra-solicitation/view/:id"
          element={<ViewExtraSolicitationPage />}
        />
        <Route
          path="/solicitation/edit/:id"
          element={<EditSolicitationPage />}
        />
        <Route
          path="/solicitation/review/:id"
          element={<ReviewSolicitationPage />}
        />
        <Route
          path="/extra-solicitation/review/:id"
          element={<ReviewExtraSolicitationPage />} />
        <Route
          path="/solicitation/view/:id"
          element={<ViewSolicitationPage />}
        />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/user-profile" element={<UserProfilePage />} />
        {(isAdmin || isCeapg || isCollaborator) && (
          <Route path="/admin-panel" element={<AdminDashboardPage />} />
        )}
        {isCeapg && (
          <Route path="/ceapg-reviews" element={<CeapgReviewsPage />} />
        )}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </NavigationWrapper>
  );
}
