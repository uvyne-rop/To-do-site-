import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  error: null,
  panelTaskId: null
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload;
    },

    setError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },

    clearError(state) {
      state.error = null;
    },

    openPanel(state, action) {
      state.panelTaskId = action.payload;
    },

    closePanel(state) {
      state.panelTaskId = null;
    }
  }
});

export const {
  setLoading,
  setError,
  clearError,
  openPanel,
  closePanel
} = uiSlice.actions;

export default uiSlice.reducer;
