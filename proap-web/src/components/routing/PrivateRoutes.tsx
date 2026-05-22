import { Route, Routes, Navigate, useParams } from 'react-router-dom';
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
import CeapgReviewPageContainer from '../../pages/admin/ceapg/CeapgReviewPageContainer';
import useHasPermission from '../../hooks/auth/useHasPermission';
import RedirectBasedOnRole from './RedirectBasedOnRole';
import ReviewExtraSolicitationPage from '../../pages/review-extra-solicitation/ReviewExtraSolicitationPage';
import UserRegisterPage from '../../pages/users/UserRegisterPage';
import CeapgReviewPage from '../../pages/admin/ceapg/CeapgReviewPage';
import CeapgSolicitationViewContainer from '../../containers/solicitation/view/CeapgSolicitationViewContainer';

const CeapgSolicitationViewPage = () => {
  const { id } = useParams<{ id: string }>();
  return <CeapgSolicitationViewContainer id={id || ''} />;
};

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
        {(isAdmin || isCeapg) && (
          <>
            <Route path="/admin-panel" element={<AdminDashboardPage />} />
            <Route path="/register-user" element={<UserRegisterPage />} />
          </>
        )}
        {(isCeapg || isAdmin) && (
          <>
            <Route path="/ceapg-reviews" element={<CeapgReviewsPage />} />
            <Route path="/admin/ceapg" element={<CeapgReviewPageContainer />} />
            <Route path="/admin-panel/solicitation/view/:id" element={<ViewSolicitationPage />} />
          </>
        )}
        {(isCeapg || isAdmin) && (
          <>
            <Route path="/admin/ceapg/review/:id" element={<CeapgReviewPage />} />
            <Route path="/admin/ceapg/view/:id" element={<CeapgSolicitationViewPage />} />
          </>
        )}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </NavigationWrapper>
  );
}