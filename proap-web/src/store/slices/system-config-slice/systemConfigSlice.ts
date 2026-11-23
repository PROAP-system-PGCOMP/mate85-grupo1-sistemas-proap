import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { SystemConfiguration } from '../../../types';
import {
  getSystemConfiguration,
  updateSystemConfiguration,
} from '../../../services/adminService';

interface SystemConfigState {
  config: SystemConfiguration;
  isLoading: boolean;
  error: string | null;
}

export const INITIAL_SYSTEM_CONFIG: SystemConfiguration = {
  id: '',
  qualis: [],
  sitePgcompURL: '',
  resolucaoProapURL: '',
  numMaxDiarias: 0,
  valorDiariaBRL: 0,
  valorDiariaAlunoBRL: 0,
  valorDiariaDocenteBRL: 0,
  valorDiariaDocenteSpRjBRL: 0,
  textoAvisoQualis: '',
  textoAvisoValorInscricao: '',
  textoInformacaoQtdDiarias: '',
  textoAvisoEnvioArquivoCarta: '',
  textoInformacaoCalcularQualis: '',
  textoInformacaoValorDiaria: '',
  textoInformacaoValorPassagem: '',
  resourceLinks: [],
  enableSolicitation: false,
};

const initialState: SystemConfigState = {
  config: INITIAL_SYSTEM_CONFIG,
  isLoading: false,
  error: null,
};

export const fetchSystemConfig = createAsyncThunk(
  'systemConfig/fetchSystemConfig',
  async (_, { rejectWithValue }) => {
    try {
      return await getSystemConfiguration();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Erro ao carregar configurações',
      );
    }
  },
);

export const saveSystemConfig = createAsyncThunk(
  'systemConfig/saveSystemConfig',
  async (config: SystemConfiguration, { rejectWithValue }) => {
    try {
      const updatedConfig = await updateSystemConfiguration(config);
      return { success: true, config: updatedConfig };
    } catch (error) {
      return rejectWithValue({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erro ao salvar configurações',
      });
    }
  },
);

const systemConfigSlice = createSlice({
  name: 'systemConfig',
  initialState,
  reducers: {
    updateSystemConfig: (
      state,
      action: PayloadAction<Partial<SystemConfiguration>>,
    ) => {
      state.config = { ...state.config, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchSystemConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSystemConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.config = action.payload;
        state.error = null;
      })
      .addCase(fetchSystemConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(saveSystemConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveSystemConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.config = action.payload.config;
        state.error = null;
      })
      .addCase(saveSystemConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as any)?.error || 'Erro desconhecido';
      });
  },
});

export const { updateSystemConfig } = systemConfigSlice.actions;
export default systemConfigSlice;
export { initialState as SYSTEM_CONFIG_INITIAL_STATE };
