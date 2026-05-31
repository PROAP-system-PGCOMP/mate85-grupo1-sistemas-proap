import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';
import { ConfirmationDialog } from '../components/dialogs';

interface NavigationGuardContextType {
  setDirty: (dirty: boolean) => void;
  guardNavigation: (navigateFn: () => void) => void;
}

const NavigationGuardContext = createContext<NavigationGuardContextType>({
  setDirty: () => {},
  guardNavigation: (fn) => fn(),
});

export function useNavigationGuard() {
  return useContext(NavigationGuardContext);
}

export function NavigationGuardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDirty, setIsDirty] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<
    (() => void) | null
  >(null);

  const guardNavigation = useCallback(
    (navigateFn: () => void) => {
      if (isDirty) {
        setPendingNavigation(() => navigateFn);
      } else {
        navigateFn();
      }
    },
    [isDirty],
  );

  const handleConfirm = useCallback(() => {
    setIsDirty(false);
    sessionStorage.removeItem('rascunho-solicitacao-proap');
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  }, [pendingNavigation]);

  const handleCancel = useCallback(() => {
    setPendingNavigation(null);
  }, []);

  return (
    <NavigationGuardContext.Provider value={{ setDirty: setIsDirty, guardNavigation }}>
      {children}
      <ConfirmationDialog
        open={pendingNavigation !== null}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title="Sair da solicitação"
        message="Você tem alterações não salvas. Tem certeza que deseja sair? Os dados preenchidos serão perdidos."
        confirmLabel="Sim, sair"
        cancelLabel="Continuar editando"
      />
    </NavigationGuardContext.Provider>
  );
}
