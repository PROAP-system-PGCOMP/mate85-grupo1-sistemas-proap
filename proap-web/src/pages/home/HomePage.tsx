import { useState } from 'react';
import HomeHotbar from '../../containers/home/solicitation-table/HomeHotbar';
import SolicitationTable from '../../containers/home/solicitation-table/SolicitationTable';
// Importe o componente do Modal (verifique se o caminho está correto na sua estrutura)
import SolicitationDetailsDialog, { SolicitationDetailsDialogProps } from '../../containers/home/request-dialog/SolicitationDetailsDialog';

export default function HomePage() {
  // 1. Estado para controlar se o modal está aberto ou fechado
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  
  // 2. Estado para guardar os dados da solicitação que será exibida
  const [detailsDialogData, setDetailsDialogData] = useState<SolicitationDetailsDialogProps | null>(null);

  // 3. Função que será passada adiante ("entregue" até os cards/linhas)
  const handleShowDetails = (data: SolicitationDetailsDialogProps) => {
    setDetailsDialogData(data);
    setIsDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setIsDetailsDialogOpen(false);
    // Limpa os dados ao fechar
    setTimeout(() => setDetailsDialogData(null), 300);
  };

  return (
    <>
      <HomeHotbar />
      
      {/* 4. A correção crucial: entregando a função para o filho */}
      <SolicitationTable onShowDetails={handleShowDetails} />

      {/* 5. Renderização condicional do Modal */}
      {detailsDialogData && (
        <SolicitationDetailsDialog
          open={isDetailsDialogOpen}
          onClose={handleCloseDetailsDialog}
          solicitationData={detailsDialogData}
        />
      )}
    </>
  );
}