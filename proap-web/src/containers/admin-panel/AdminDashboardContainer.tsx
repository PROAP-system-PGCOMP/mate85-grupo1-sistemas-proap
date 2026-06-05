import { useEffect, useState, useCallback, useRef, SyntheticEvent } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Typography,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ListAlt,
  Settings,
  Dashboard,
  FactCheck,
  AdminPanelSettings,
} from '@mui/icons-material';
import { BudgetFormValues } from './BudgetFormSchema';
import { setBudget } from '../../services/budgetService';
import Toast from '../../helpers/notification';
import ApprovedRequests from './ApprovedRequestsContainer';
import SectionHeader from '../../components/custom/SectionHeader';
import BudgetOverview from './BudgetOverviewContainer';
import useHasPermission from '../../hooks/auth/useHasPermission';
import SettingContainer from './settings/SettingsContainer';

import useCeapgRequests from '../../hooks/admin/useLoadCeapgRequests';
import useLoadApprovedRequests from '../../hooks/admin/useLoadApprovedRequests';
import useLoadBudget from '../../hooks/admin/useLoadBudget';
import useLoadHistoricalBudget from '../../hooks/admin/useLoadHistoricalBudget';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`budget-tabpanel-${index}`}
      aria-labelledby={`budget-tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `budget-tab-${index}`,
    'aria-controls': `budget-tabpanel-${index}`,
  };
};

const AdminDashboardContainer = () => {
  const DASHBOARD_INDEX = 0;
  const APPROVED_REQUESTS_INDEX = 1;
  const SETTINGS_INDEX = 2;
  const isAdmin = useHasPermission('ADMIN_ROLE');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(DASHBOARD_INDEX);
  const [loading, setLoading] = useState(false);
  const [isSettingsDirty, setIsSettingsDirty] = useState(false);
  const [dirtyDialogOpen, setDirtyDialogOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState<number | null>(null);
  const settingsSubmitRef = useRef<(() => Promise<void>) | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );

  const [totalRequestsValue, setTotalRequestsValue] = useState<number>(0);

  const ceapg = useCeapgRequests();
  const solicitationRequests = useLoadApprovedRequests();
  const budgetByYear = useLoadBudget();
  const historicalData = useLoadHistoricalBudget();

  useEffect(() => {
    budgetByYear.getBudget(selectedYear);
    solicitationRequests.getApprovedRequests(); 
    ceapg.getCeapg();
  }, [selectedYear]);

  useEffect(() => {
    historicalData.fetchAvailableYears();
    historicalData.fetchHistoricalBudget();
  }, []);

  useEffect(() => {
    setTotalRequestsValue(
      solicitationRequests.approvedRequests.reduce(
        (sum, item) => sum + item.value,
        0,
      ),
    );
  }, [solicitationRequests.approvedRequests]);

  const doTabChange = (newValue: number) => {
    setTabValue(newValue);

    if (
      (newValue === APPROVED_REQUESTS_INDEX || newValue === DASHBOARD_INDEX) &&
      solicitationRequests.approvedRequests.length === 0
    ) {
      solicitationRequests.getApprovedRequests();
    }

    if (newValue === DASHBOARD_INDEX && budgetByYear.budget === undefined) {
      budgetByYear.getBudget(selectedYear);
    }
    if (
      newValue === DASHBOARD_INDEX &&
      historicalData.availableYears.length === 0
    ) {
      historicalData.fetchAvailableYears();
    }
    if (
      newValue === DASHBOARD_INDEX &&
      historicalData.historicalBudget.length === 0
    ) {
      historicalData.fetchHistoricalBudget();
    }
  };

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    if (tabValue === SETTINGS_INDEX && isSettingsDirty && newValue !== SETTINGS_INDEX) {
      setPendingTab(newValue);
      setDirtyDialogOpen(true);
      return;
    }
    doTabChange(newValue);
  };

  const handleDirtyDialogStay = () => {
    setDirtyDialogOpen(false);
    setPendingTab(null);
  };

  const handleDirtyDialogLeave = () => {
    setDirtyDialogOpen(false);
    if (pendingTab !== null) {
      doTabChange(pendingTab);
      setPendingTab(null);
    }
  };

  const handleDirtyDialogSaveAndLeave = async () => {
    if (settingsSubmitRef.current) {
      await settingsSubmitRef.current();
    }
    handleDirtyDialogLeave();
  };

  const handleYearChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedYear(event.target.value as number);
  };

  const handleApprovedRequestsFilterApply = useCallback(
    (startDate?: string, endDate?: string) => {
      solicitationRequests.getApprovedRequests(startDate, endDate);
    },
    [solicitationRequests.getApprovedRequests],
  );

  const handleBudgetSubmit = async (values: BudgetFormValues) => {
    setLoading(true);
    try {
      await setBudget(values.budget, values.year);
      Toast.success(`Orçamento de ${values.year} definido com sucesso!`);
      if (values.year === selectedYear) {
        budgetByYear.getBudget(selectedYear);
        setTabValue(DASHBOARD_INDEX);
      }
    } catch (error) {
      console.error('Erro ao definir orçamento:', error);
      Toast.error('Erro ao definir o orçamento anual: ' + error);
    } finally {
      setLoading(false);
      historicalData.fetchAvailableYears();
      historicalData.fetchHistoricalBudget();
    }
  };

  const totalCeapgCalculado = budgetByYear.budget?.totalBudget ?? 0;
  
  const ceapgList = Array.isArray(ceapg.ceapgRequests) ? ceapg.ceapgRequests : [];
  
  const usedCeapgCalculado = ceapgList
    .filter((req: any) => !!req.avaliadorCeapg)
    .reduce((acc: number, req: any) => acc + Number(req.custoFinalCeapg || req.valorAprovado || 0), 0);

  const remainingCeapgCalculado = totalCeapgCalculado - usedCeapgCalculado;
  const percentageCeapgCalculado = totalCeapgCalculado > 0 
    ? Math.round((usedCeapgCalculado / totalCeapgCalculado) * 100) 
    : 0;

  return (
    <Box sx={{ pb: 4 }}>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <AdminPanelSettings color="primary" fontSize="large" />
        <Typography variant="h5" fontWeight="bold" color="primary">
          Gestão
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="budget dashboard tabs"
            indicatorColor="primary"
            textColor="primary"
            sx={{ px: 2 }}
          >
            <Tab
              icon={<Dashboard />}
              label={isMobile ? '' : 'Visão Geral'}
              iconPosition={isMobile ? 'top' : 'start'}
              {...a11yProps(DASHBOARD_INDEX)}
            />
            <Tab
              icon={<FactCheck />}
              label={isMobile ? '' : 'Solicitações Aprovadas'}
              iconPosition={isMobile ? 'top' : 'start'}
              {...a11yProps(APPROVED_REQUESTS_INDEX)}
            />
            
            {isAdmin && (
              <Tab
                icon={<Settings />}
                label={isMobile ? '' : 'Configurações'}
                iconPosition={isMobile ? 'top' : 'start'}
                {...a11yProps(SETTINGS_INDEX)}
              />
            )}
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={DASHBOARD_INDEX}>
            <SectionHeader
              icon={<Dashboard color="primary" />}
              title="Visão Geral do Orçamento"
            />
            <BudgetOverview
              budgetLoading={budgetByYear.loading}
              
              // Valores originais (PROAP/Total)
              totalBudget={budgetByYear.budget?.totalBudget ?? 0}
              remainingBudget={budgetByYear.budget?.remainingBudget ?? 0}
              usedPercentage={budgetByYear.budget?.usedPercentage ?? 0}
              usedBudget={budgetByYear.budget?.usedBudget ?? 0}
              
              // Valores CEAPG Calculados
              totalCeapgBudget={totalCeapgCalculado}
              usedCeapgBudget={usedCeapgCalculado}
              remainingCeapgBudget={remainingCeapgCalculado}
              usedCeapgPercentage={percentageCeapgCalculado}
              
              selectedYear={selectedYear}
              historicalData={historicalData.historicalBudget}
              availableYears={historicalData.availableYears}
              yearsLoading={historicalData.yearsLoading}
              onYearChange={handleYearChange}
              
              solicitacoes={solicitationRequests.approvedRequests
              .filter((req: any) => req.perfil && req.perfil.toUpperCase() === 'DOCENTE') 
              .map((req: any) => ({
                nomeDocente: req.docente || 'Docente não identificado',
                valorSolicitado: req.value || 0,
              }))}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={APPROVED_REQUESTS_INDEX}>
            <SectionHeader
              icon={<ListAlt color="primary" />}
              title="Solicitações Aprovadas"
            />
            <ApprovedRequests
              loading={solicitationRequests.loading}
              totalRequests={solicitationRequests.approvedRequests}
              totalRequestsValue={totalRequestsValue}
              onStartDateChange={() => {}}
              onEndDateChange={() => {}}
              onFilter={handleApprovedRequestsFilterApply}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={SETTINGS_INDEX}>
            <SettingContainer
              handleBudgetSubmit={handleBudgetSubmit}
              loading={loading}
              totalBudget={budgetByYear.budget?.totalBudget ?? 0}
              onDirtyChange={setIsSettingsDirty}
              submitRef={settingsSubmitRef}
            />
          </TabPanel>
        </Box>
      </Paper>

      <Dialog open={dirtyDialogOpen} onClose={handleDirtyDialogStay} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight="bold">Alterações não salvas</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Você fez alterações que ainda não foram salvas. O que deseja fazer?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={handleDirtyDialogStay} color="inherit" sx={{ whiteSpace: 'nowrap' }}>
            Continuar editando
          </Button>
          <Button onClick={handleDirtyDialogLeave} color="error" variant="outlined" sx={{ whiteSpace: 'nowrap' }}>
            Sair sem salvar
          </Button>
          <Button onClick={handleDirtyDialogSaveAndLeave} variant="contained" color="primary" sx={{ whiteSpace: 'nowrap' }}>
            Salvar e sair
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboardContainer;