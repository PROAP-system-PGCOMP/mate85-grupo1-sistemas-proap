import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import SolicitationTableRequests from './SolicitationTableRequests';
import SolicitationTableExtraRequests from './SolicitationTableExtraRequests';
import { useState } from 'react';
// Importação do tipo necessária para o TypeScript
import { SolicitationDetailsDialogProps } from '../request-dialog/SolicitationDetailsDialog';

interface SolicitationTableProps {
  onShowDetails: (props: SolicitationDetailsDialogProps) => void;
}

export default function SolicitationTable({ onShowDetails }: SolicitationTableProps) {
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <>
      <Tabs value={currentTab} onChange={(e, value) => setCurrentTab(value)}>
        <Tab label="Apoio a Publicação Científica" />
        <Tab label="Demanda Extra" />
      </Tabs>

      {/* Aba normal: Mantida sem alterações */}
      {currentTab == 0 && <SolicitationTableRequests />}
      
      {/* Aba Extra: Agora recebe a função onShowDetails */}
      {currentTab == 1 && (
        <SolicitationTableExtraRequests onShowDetails={onShowDetails} />
      )}
    </>
  );
}